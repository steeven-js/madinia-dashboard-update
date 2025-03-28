import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useRef, useState, useEffect, useCallback } from 'react';
import { updateProfile, updatePassword, onAuthStateChanged } from 'firebase/auth';

import { CONFIG } from 'src/global-config';
import { AUTH, FIRESTORE } from 'src/lib/firebase';

/**
 * Hook principal de gestion de l'authentification
 * Gère l'état de connexion de l'utilisateur et synchronise les données
 * @returns {{
 *   user: Object|null, // Utilisateur Firebase Auth
 *   userId: string|null, // ID de l'utilisateur
 *   userProfile: Object|null, // Profil utilisateur depuis Firestore
 *   loading: boolean, // État du chargement
 *   role: string|null, // Rôle de l'utilisateur
 *   isAuthenticated: boolean // État d'authentification
 * }}
 */
export function useAuth() {
  const [user, setLocalUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const unsubscribeRef = useRef(null);

  /**
   * Configure une écoute en temps réel sur le profil utilisateur dans Firestore
   * @param {string} uid - ID de l'utilisateur
   */
  const setupUserProfileListener = useCallback((uid) => {
    // Nettoyer l'abonnement précédent s'il existe
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (!uid) return;

    // console.log('Configuration de l\'écoute en temps réel pour l\'utilisateur:', uid);
    const userProfileRef = doc(FIRESTORE, 'users', uid);

    /**
     * Convertit les timestamps Firestore en millisecondes
     * @param {Date|FirebaseTimestamp|number|null} timestamp - Timestamp à convertir
     * @returns {number|null} Timestamp en millisecondes ou null
     */
    const serializeTimestamp = (timestamp) => {
      if (!timestamp) return null;
      // Conversion depuis Timestamp Firestore
      if (timestamp?.toMillis) {
        return timestamp.toMillis();
      }
      // Conversion depuis Date
      if (timestamp instanceof Date) {
        return timestamp.getTime();
      }
      // Déjà en millisecondes
      if (typeof timestamp === 'number') {
        return timestamp;
      }
      return null;
    };

    /**
     * Sérialise l'ensemble du profil utilisateur en convertissant les timestamps
     * @param {Object|null} profile - Profil utilisateur brut
     * @returns {Object|null} Profil sérialisé
     */
    const serializeProfile = (profile) => {
      if (!profile) return null;

      const serialized = { ...profile };

      // Conversion des champs temporels
      ['createdAt', 'updatedAt', 'lastConnection'].forEach((field) => {
        if (profile[field]) {
          serialized[field] = serializeTimestamp(profile[field]);
        }
      });

      return serialized;
    };

    unsubscribeRef.current = onSnapshot(
      userProfileRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const profileData = docSnapshot.data();
          const serializedProfile = serializeProfile(profileData);

          // console.log('Mise à jour du profil utilisateur détectée:', serializedProfile);

          setUserProfile(serializedProfile);

          // Actualiser le rôle si nécessaire
          const userRole = profileData?.role || 'user';
          const validRole = CONFIG.roles[userRole] ? userRole : 'user';
          setRole(validRole);
        } else {
          // console.log("Le profil utilisateur n'existe pas");
          setUserProfile(null);
          setRole('user');
        }
      },
      (err) => {
        console.error('Erreur lors de l\'écoute du profil utilisateur:', err);
        setError(err.message);
      }
    );
  }, []);

  // Fonction pour rafraîchir le profil utilisateur manuellement (fallback)
  const refreshUserProfile = async () => {
    if (!userId) return;

    // console.log('Rafraîchissement manuel du profil utilisateur...');
    try {
      // Actualiser Firebase Auth user
      if (AUTH.currentUser) {
        // Forcer l'actualisation du token
        await AUTH.currentUser.getIdToken(true);
        setLocalUser(AUTH.currentUser);
      }
    } catch (err) {
      console.error('Erreur lors du rafraîchissement manuel du profil:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    // Souscription aux changements d'état d'authentification
    const unsubscribe = onAuthStateChanged(AUTH, async (_user) => {
      if (_user) {
        // Utilisateur connecté
        setLocalUser(_user);
        setUserId(_user.uid);
        setIsAuthenticated(true);

        try {
          // Récupération des custom claims (non utilisée directement, mais peut être utile pour le débogage)
          await _user.getIdToken(true);

          // Configurer l'écoute en temps réel du profil utilisateur
          setupUserProfileListener(_user.uid);

        } catch (err) {
          console.error('Error fetching user profile:', err);
          setError(err.message);
        }
      } else {
        // Utilisateur déconnecté
        setLocalUser(null);
        setUserId(null);
        setUserProfile(null);
        setRole(null);
        setIsAuthenticated(false);
        setError(null);

        // Nettoyer l'abonnement précédent s'il existe
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
      }
      setLoading(false);
    });

    // Nettoyage des souscriptions
    return () => {
      unsubscribe();
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [setupUserProfileListener]);

  return {
    user,
    userId,
    userProfile,
    loading,
    role,
    error,
    isAuthenticated,
    hasPermission: (permission) => {
      // Vérifier d'abord les permissions individuelles de l'utilisateur
      if (userProfile?.customPermissions?.includes(permission)) {
        return true;
      }
      // Puis vérifier les permissions du rôle
      return hasRolePermission(role, permission);
    },
    hasMinimumLevel: (level) => hasRoleLevel(role, level),
    refreshUserProfile,
  };
}

/**
 * Hook pour la mise à jour du profil utilisateur
 * Gère la mise à jour simultanée dans Firebase Auth et Firestore
 * @returns {{
 *   updateUserProfile: (newData: Object) => Promise<void>, // Fonction de mise à jour
 *   isUpdating: boolean, // État de la mise à jour
 *   error: string|null // Message d'erreur éventuel
 * }}
 */
export function useUpdateUserProfile() {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setUpdateError] = useState(null);

  /**
   * Met à jour le profil utilisateur
   * @param {Object} newData - Nouvelles données du profil
   */
  const updateUserProfile = async (newData) => {
    if (!user) {
      setUpdateError('User not authenticated');
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);

    try {
      // Mise à jour du profil Firebase Auth
      const authUpdateData = {};
      if (newData.displayName) authUpdateData.displayName = newData.displayName;
      if (newData.photoUrl) authUpdateData.photoUrl = newData.photoUrl;

      if (Object.keys(authUpdateData).length > 0) {
        await updateProfile(AUTH.currentUser, authUpdateData);
      }

      // Mise à jour du profil Firestore
      const userProfileRef = doc(FIRESTORE, 'users', user.uid);
      await updateDoc(userProfileRef, newData);
    } catch (err) {
      setUpdateError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateUserProfile, isUpdating, error };
}

/**
 * Hook pour la mise à jour du mot de passe Firebase
 * @returns {{
 *   updateFirebasePassword: (newPassword: string) => Promise<void>, // Fonction de mise à jour
 *   isUpdating: boolean, // État de la mise à jour
 *   error: string|null // Message d'erreur éventuel
 * }}
 */
export function useUpdateFirebasePassword() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setFirebaseError] = useState(null);

  /**
   * Met à jour le mot de passe de l'utilisateur
   * @param {string} newPassword - Nouveau mot de passe
   */
  const updateFirebasePassword = async (newPassword) => {
    setIsUpdating(true);
    setFirebaseError(null);

    try {
      await updatePassword(AUTH.currentUser, newPassword);
    } catch (err) {
      setFirebaseError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateFirebasePassword, isUpdating, error };
}

/**
 * Vérifie si un rôle a accès à une permission
 * @param {string} role - Le rôle à vérifier
 * @param {string} permission - La permission requise
 * @returns {boolean}
 */
const hasRolePermission = (role, permission) => {
  // Si pas de rôle défini ou rôle non configuré, refuser l'accès
  if (!role || !CONFIG.roles[role]) return false;

  const roleConfig = CONFIG.roles[role];

  // Si le rôle a la permission spéciale 'all', autoriser tout accès
  if (roleConfig.permissions.includes('all')) return true;

  // Vérifier si la permission spécifique est accordée
  return roleConfig.permissions.includes(permission);
};

/**
 * Vérifie si un rôle a un niveau suffisant
 * @param {string} role - Le rôle à vérifier
 * @param {number} requiredLevel - Le niveau minimum requis
 * @returns {boolean}
 */
const hasRoleLevel = (role, requiredLevel) => {
  // Si pas de rôle défini ou rôle non configuré, refuser l'accès
  if (!role || !CONFIG.roles[role]) return false;

  const roleConfig = CONFIG.roles[role];

  // Vérifier si le niveau du rôle est >= au niveau requis
  return roleConfig.level >= requiredLevel;
};
