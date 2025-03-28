import { useCallback } from 'react';

import { toast } from 'src/components/snackbar';

import { useAuth } from './use-auth';

/**
 * Hook pour vérifier les permissions avant d'effectuer des opérations
 * @returns {Object} Fonctions pour effectuer des opérations avec vérification des permissions
 */
export function usePermission() {
  const { hasPermission, role } = useAuth();

  /**
   * Vérifie si l'utilisateur a la permission requise et exécute l'action si c'est le cas
   * @param {string} permission - La permission requise
   * @param {Function} action - L'action à exécuter
   * @param {Object} options - Options supplémentaires
   * @returns {Promise<any>} Résultat de l'action ou null si non autorisé
   */
  const executeWithPermission = useCallback(
    async (permission, action, options = {}) => {
      const { silent = false, onDenied = null } = options;

      // Vérifier si l'utilisateur a la permission
      if (!hasPermission(permission)) {
        if (!silent) {
          toast.error(
            `Vous n'avez pas la permission nécessaire (${permission}) pour effectuer cette action.`
          );
        }

        // Exécuter la fonction de callback en cas de refus si fournie
        if (onDenied && typeof onDenied === 'function') {
          return onDenied();
        }

        return null;
      }

      try {
        // Exécuter l'action
        return await action();
      } catch (error) {
        if (!silent) {
          toast.error(`Erreur: ${error.message}`);
        }
        throw error;
      }
    },
    [hasPermission]
  );

  /**
   * Vérifie si l'utilisateur a la permission de créer et exécute l'action
   * @param {Function} action - L'action de création à exécuter
   * @param {Object} options - Options supplémentaires
   * @returns {Promise<any>} Résultat de l'action ou null si non autorisé
   */
  const createWithPermission = useCallback(
    (action, options = {}) => executeWithPermission('manage_content', action, options),
    [executeWithPermission]
  );

  /**
   * Vérifie si l'utilisateur a la permission de mettre à jour et exécute l'action
   * @param {Function} action - L'action de mise à jour à exécuter
   * @param {Object} options - Options supplémentaires
   * @returns {Promise<any>} Résultat de l'action ou null si non autorisé
   */
  const updateWithPermission = useCallback(
    (action, options = {}) => executeWithPermission('manage_content', action, options),
    [executeWithPermission]
  );

  /**
   * Vérifie si l'utilisateur a la permission de supprimer et exécute l'action
   * @param {Function} action - L'action de suppression à exécuter
   * @param {Object} options - Options supplémentaires
   * @returns {Promise<any>} Résultat de l'action ou null si non autorisé
   */
  const deleteWithPermission = useCallback(
    (action, options = {}) => executeWithPermission('manage_content', action, options),
    [executeWithPermission]
  );

  /**
   * Vérifie si l'utilisateur a la permission de gérer les utilisateurs et exécute l'action
   * @param {Function} action - L'action de gestion d'utilisateur à exécuter
   * @param {Object} options - Options supplémentaires
   * @returns {Promise<any>} Résultat de l'action ou null si non autorisé
   */
  const manageUserWithPermission = useCallback(
    (action, options = {}) => executeWithPermission('manage_users', action, options),
    [executeWithPermission]
  );

  return {
    role,
    hasPermission,
    createWithPermission,
    updateWithPermission,
    deleteWithPermission,
    manageUserWithPermission,
    executeWithPermission,
  };
}
