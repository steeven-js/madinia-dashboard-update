import { deleteUser, updateProfile } from 'firebase/auth';
import { useRef, useState, useEffect, useCallback } from 'react';
import { ref, listAll, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDocs, updateDoc, deleteDoc, onSnapshot, collection, serverTimestamp } from 'firebase/firestore';

import { CONFIG } from 'src/global-config';
import { AUTH, FIRESTORE, FIREBASE_STORAGE } from 'src/lib/firebase';

import { toast } from 'src/components/snackbar';

/**
 * Récupère l'ID de l'utilisateur actuellement connecté
 * @returns {string|undefined} L'ID de l'utilisateur ou undefined si non connecté
 */
const getCurrentUserUid = () => AUTH.currentUser?.uid;

/**
 * Hook pour récupérer la liste des utilisateurs
 * @returns {{
 *   users: Array<{id: string, [key: string]: any}>, // Liste des utilisateurs
 *   loading: boolean // État du chargement
 * }}
 */
export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Référence à la collection users
    const usersRef = collection(FIRESTORE, 'users');

    // Récupération unique des documents
    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(usersRef);
        const fetchedUsers = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }));
        setUsers(fetchedUsers || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users: users || [], loading };
};

/**
 * Hook étendu pour gérer les données utilisateurs avec fonction de mise à jour et option de temps réel
 * @param {boolean} realtime - Active les mises à jour en temps réel si true
 * @returns {{
 *   users: Array<{id: string, [key: string]: any}>, // Liste des utilisateurs
 *   loading: boolean, // État du chargement
 *   error: string|null, // Message d'erreur éventuel
 *   refresh: () => Promise<void>, // Fonction pour forcer un rafraîchissement
 *   updateUsersList: (newUsers: Array) => void, // Fonction pour mettre à jour la liste manuellement
 *   stopRealtimeUpdates: () => void, // Fonction pour arrêter les mises à jour en temps réel
 *   startRealtimeUpdates: () => void // Fonction pour redémarrer les mises à jour en temps réel
 * }}
 */
export const useUsersData = (realtime = true) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRealtimeActive, setIsRealtimeActive] = useState(realtime);
  const unsubscribeRef = useRef(null);

  // Fonction pour charger les utilisateurs une seule fois
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const usersRef = collection(FIRESTORE, 'users');
      const snapshot = await getDocs(usersRef);
      const fetchedUsers = snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      }));
      setUsers(fetchedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour configurer les mises à jour en temps réel
  const setupRealtimeUpdates = useCallback(() => {
    // Nettoyage de l'abonnement précédent si existant
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // Si le temps réel n'est pas actif, on ne s'abonne pas
    if (!isRealtimeActive) return;

    const usersRef = collection(FIRESTORE, 'users');
    unsubscribeRef.current = onSnapshot(
      usersRef,
      (snapshot) => {
        const fetchedUsers = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }));
        setUsers(fetchedUsers);
        setLoading(false);
      },
      (err) => {
        console.error('Error in realtime updates:', err);
        setError(err.message);
        setLoading(false);
      }
    );
  }, [isRealtimeActive]);

  // Arrêter les mises à jour en temps réel
  const stopRealtimeUpdates = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    setIsRealtimeActive(false);
  }, []);

  // Redémarrer les mises à jour en temps réel
  const startRealtimeUpdates = useCallback(() => {
    setIsRealtimeActive(true);
  }, []);

  // Forcer un rafraîchissement manuel (utile quand le temps réel est désactivé)
  const refresh = useCallback(async () => {
    if (!isRealtimeActive) {
      await fetchUsers();
    }
  }, [fetchUsers, isRealtimeActive]);

  // Fonction mémorisée pour mettre à jour la liste des utilisateurs manuellement
  const updateUsersList = useCallback((newUsers) => setUsers(newUsers), []);

  // Effet pour configurer les abonnements au montage et changements de mode
  useEffect(() => {
    if (isRealtimeActive) {
      setupRealtimeUpdates();
    } else {
      // Charger les données une seule fois si le temps réel est désactivé
      fetchUsers();
    }

    // Nettoyage à la destruction du composant
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [isRealtimeActive, setupRealtimeUpdates, fetchUsers]);

  return {
    users,
    loading,
    error,
    refresh,
    updateUsersList,
    stopRealtimeUpdates,
    startRealtimeUpdates
  };
};

/**
 * Hook pour récupérer un utilisateur spécifique par son ID
 * @param {string} id - ID de l'utilisateur à récupérer
 * @returns {{
 *   user: {id: string, [key: string]: any} | null, // Données de l'utilisateur
 *   loading: boolean // État du chargement
 * }}
 */
export const useUserById = (id) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setUser(null);
      setLoading(false);
      return () => { };
    }

    // Référence au document utilisateur
    const userDocRef = doc(FIRESTORE, 'users', id);

    // Souscription aux changements en temps réel
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const { ...docData } = docSnapshot.data();
          setUser({ id: docSnapshot.id, ...docData });
        } else {
          console.error('No such document!');
          setUser(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching user:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  return { user, loading };
};

/**
 * Met à jour ou crée un utilisateur avec gestion de l'avatar
 * @param {Object} params - Paramètres de la fonction
 * @param {Object} params.currentUser - Utilisateur actuel
 * @param {Object} params.data - Données à mettre à jour
 * @returns {Promise<void>}
 */
export async function updateOrCreateUserData({ currentUser, data }) {
  if (!currentUser?.id) {
    throw new Error('ID utilisateur manquant');
  }

  try {
    console.log('Début de la mise à jour:', { currentUser, data });

    let avatarUrl = null;
    let coverUrl = null;

    // Gestion de l'avatar
    if (data.avatarUrl instanceof File) {
      // Supprimer l'ancienne image si elle existe
      if (currentUser.avatarUrl) {
        try {
          const { avatarUrl: oldAvatarUrl } = currentUser;
          const oldAvatarRef = ref(FIREBASE_STORAGE, oldAvatarUrl);
          await deleteObject(oldAvatarRef);
          console.log('Ancienne image supprimée avec succès');
        } catch (error) {
          console.warn('Erreur lors de la suppression de l\'ancienne image:', error);
        }
      }


      const fileExtension = data.avatarUrl.name.split('.').pop();
      const storageRef = ref(FIREBASE_STORAGE, `avatars/${currentUser.id}/avatar.${fileExtension}`);
      await uploadBytes(storageRef, data.avatarUrl);
      avatarUrl = await getDownloadURL(storageRef);

      // Mise à jour du profil Auth avec le nouvel avatar
      await updateProfile(AUTH.currentUser, {
        photoURL: avatarUrl
      });
    } else if (typeof data.avatarUrl === 'string' && data.avatarUrl.startsWith('http')) {
      avatarUrl = data.avatarUrl;
    }

    // Gestion de la couverture
    if (data.coverUrl instanceof File) {
      // Supprimer l'ancienne image si elle existe
      if (currentUser.coverUrl) {
        try {
          const { coverUrl: oldCoverUrl } = currentUser;
          const oldCoverRef = ref(FIREBASE_STORAGE, oldCoverUrl);
          await deleteObject(oldCoverRef);
          console.log('Ancienne image de couverture supprimée avec succès');
        } catch (error) {
          console.warn('Erreur lors de la suppression de l\'ancienne image de couverture:', error);
        }
      }


      const fileExtension = data.coverUrl.name.split('.').pop();
      const storageRef = ref(FIREBASE_STORAGE, `covers/${currentUser.id}/cover.${fileExtension}`);
      await uploadBytes(storageRef, data.coverUrl);
      coverUrl = await getDownloadURL(storageRef);
    } else if (typeof data.coverUrl === 'string' && data.coverUrl.startsWith('http')) {
      coverUrl = data.coverUrl;
    }

    // Générer le displayName à partir de firstName et lastName s'ils existent
    let displayName = data.displayName;
    if (data.firstName && data.lastName) {
      displayName = `${data.lastName} ${data.firstName}`;
    }

    // Préparation des données à mettre à jour
    const userData = {
      displayName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      country: data.country,
      address: data.address,
      state: data.state,
      city: data.city,
      zipCode: data.zipCode,
      about: data.about,
      isPublic: data.isPublic,
      updatedAt: serverTimestamp(),
    };

    // Ajouter firstName et lastName seulement s'ils sont définis
    if (data.firstName !== undefined) {
      userData.firstName = data.firstName;
    }

    if (data.lastName !== undefined) {
      userData.lastName = data.lastName;
    }

    // Ajouter les URLs seulement si elles existent
    if (avatarUrl) {
      userData.avatarUrl = avatarUrl;
    }

    if (coverUrl) {
      userData.coverUrl = coverUrl;
    }

    // console.log('Données à sauvegarder:', userData);

    // Mise à jour du document dans Firestore
    const userRef = doc(FIRESTORE, 'users', currentUser.id);
    await setDoc(userRef, userData, { merge: true });

    // Mise à jour du profil Auth
    await updateProfile(AUTH.currentUser, {
      displayName,
      photoURL: avatarUrl
    });

    toast.success('Profil mis à jour avec succès');

    // console.log('Mise à jour réussie:', {
    //   firestoreData: userData,
    //   authProfile: {
    //     displayName: data.displayName,
    //     photoURL: avatarUrl
    //   }
    // });

  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    toast.error('Erreur lors de la mise à jour du profil');
    throw error;
  }
}

/**
 * Met à jour rapidement les données d'un utilisateur
 * @param {Object} params - Paramètres de la fonction
 * @param {Object} params.data - Données à mettre à jour
 * @throws {Error} Si aucun utilisateur n'est connecté
 * @returns {Promise<void>}
 */
export const updateFastUsers = async ({ data }) => {
  const uid = getCurrentUserUid();
  if (!uid) {
    throw new Error("No user is currently logged in");
  }

  const userRef = doc(FIRESTORE, 'users', uid);

  try {
    await updateDoc(userRef, data);
    toast.success('Mise à jour rapide réussie !');
  } catch (error) {
    console.error('Erreur lors de la mise à jour rapide de l\'utilisateur:', error);
    toast.error('Une erreur est survenue lors de la mise à jour rapide');
    throw error;
  }
};

/**
 * Met à jour le rôle d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {string} newRole - Nouveau rôle à attribuer
 * @returns {Promise<void>}
 */
export const updateUserRole = async (userId, newRole) => {
  console.log('updateUserRole called with:', { userId, newRole });

  if (!userId) {
    throw new Error("L'ID de l'utilisateur est requis");
  }

  if (!newRole) {
    throw new Error("Le nouveau rôle est requis");
  }

  // Validate role exists in CONFIG
  if (!CONFIG.roles[newRole]) {
    throw new Error(`Le rôle ${newRole} n'existe pas dans la configuration`);
  }

  const userRef = doc(FIRESTORE, 'users', userId);

  try {
    const userData = {
      role: newRole,
      roleLevel: CONFIG.roles[newRole].level,
      permissions: CONFIG.roles[newRole].permissions,
      updatedAt: serverTimestamp()
    };

    console.log('Updating user role with:', { userId, newRole, userData });

    await updateDoc(userRef, userData);

    // Optionally update custom claims through a Cloud Function
    // This would require setting up a Cloud Function to update Firebase Auth custom claims

    toast.success('Rôle mis à jour avec succès !');
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error);
    toast.error('Une erreur est survenue lors de la mise à jour du rôle');
    throw error;
  }
};

/**
 * Met à jour le statut d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {string} newStatus - Nouveau statut à attribuer
 * @returns {Promise<void>}
 */
export const updateUserStatus = async (userId, newStatus) => {
  if (!userId) {
    throw new Error("L'ID de l'utilisateur est requis");
  }

  const userRef = doc(FIRESTORE, 'users', userId);

  try {
    await updateDoc(userRef, {
      status: newStatus,
      updatedAt: Date.now()
    });
    toast.success('Statut mis à jour avec succès !');
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    toast.error('Une erreur est survenue lors de la mise à jour du statut');
    throw error;
  }
};

/**
 * Supprime complètement un utilisateur (Firestore et Storage)
 * Note: La suppression dans Firebase Auth nécessite une Cloud Function avec Admin SDK
 * @param {string} userId - ID de l'utilisateur à supprimer
 * @returns {Promise<void>}
 */
export const deleteUserCompletely = async (userId) => {
  if (!userId) {
    throw new Error("L'ID de l'utilisateur est requis");
  }

  try {
    // 1. Supprimer les fichiers de stockage associés à l'utilisateur
    // Supprimer les avatars
    const avatarsRef = ref(FIREBASE_STORAGE, `avatars/${userId}`);
    try {
      const avatarsList = await listAll(avatarsRef);
      const deletePromises = avatarsList.items.map((itemRef) => deleteObject(itemRef));
      await Promise.all(deletePromises);
    } catch (error) {
      // Ignorer l'erreur si le dossier n'existe pas
      if (!error.message.includes('does not exist')) {
        console.warn('Erreur lors de la suppression des avatars:', error);
      }
    }

    // Supprimer les couvertures
    const coversRef = ref(FIREBASE_STORAGE, `covers/${userId}`);
    try {
      const coversList = await listAll(coversRef);
      const deletePromises = coversList.items.map((itemRef) => deleteObject(itemRef));
      await Promise.all(deletePromises);
    } catch (error) {
      // Ignorer l'erreur si le dossier n'existe pas
      if (!error.message.includes('does not exist')) {
        console.warn('Erreur lors de la suppression des couvertures:', error);
      }
    }

    // 2. Supprimer le document utilisateur dans Firestore
    const userRef = doc(FIRESTORE, 'users', userId);
    await deleteDoc(userRef);

    // 3. IMPORTANT: La suppression dans Firebase Auth nécessite une Cloud Function
    // La suppression d'un utilisateur dans Firebase Auth depuis le client a des limitations:
    // - Un utilisateur ne peut supprimer que son propre compte après réauthentification récente
    // - Pour supprimer d'autres utilisateurs, il faut utiliser Firebase Admin SDK via une Cloud Function

    // Si l'utilisateur actuel essaie de se supprimer lui-même
    if (AUTH.currentUser && AUTH.currentUser.uid === userId) {
      try {
        // Cela ne fonctionnera que si l'utilisateur s'est connecté récemment
        await deleteUser(AUTH.currentUser);
      } catch (error) {
        console.warn('Impossible de supprimer l\'utilisateur dans Firebase Auth:', error.message);
        // Continuer malgré l'erreur car nous avons déjà supprimé les données Firestore et Storage
      }
    } else {
      console.warn(
        'ATTENTION: L\'utilisateur a été supprimé de Firestore et Storage, ' +
        'mais PAS de Firebase Auth. Pour une suppression complète, ' +
        'implémentez une Cloud Function utilisant Firebase Admin SDK.'
      );
    }

    toast.success('Utilisateur supprimé avec succès de Firestore et Storage!');
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    toast.error('Une erreur est survenue lors de la suppression de l\'utilisateur');
    throw error;
  }
};
