import { useMemo } from 'react';

import { useRolePermission } from 'src/auth/context/role-permission-context';

import { useAuth } from './use-auth';
import { usePermission } from './use-permission';

/**
 * Hook qui centralise toutes les fonctionnalités liées aux rôles et permissions
 * @returns {Object} Fonctions et données pour la gestion des rôles et permissions
 */
export function usePermissionsManager() {
  const { role: currentUserRole, hasPermission } = useAuth();
  const { executeWithPermission } = usePermission();
  const {
    roles,
    permissions,
    getRolesByPermission,
    getPermissionsByRole,
    hasRolePermission,
    hasMinimumLevel,
    updateRolePermissions,
    createRole,
    deleteRole,
    createPermission,
    updatePermission,
  } = useRolePermission();

  // Indique si l'utilisateur actuel est un super administrateur
  const isSuperAdmin = useMemo(() => currentUserRole === 'super_admin', [currentUserRole]);

  // Indique si l'utilisateur actuel est un administrateur (admin ou super_admin)
  const isAdmin = useMemo(
    () => ['admin', 'super_admin'].includes(currentUserRole),
    [currentUserRole]
  );

  /**
   * Exécute une action uniquement si l'utilisateur est super_admin
   * @param {Function} action - L'action à exécuter
   * @param {Object} options - Options supplémentaires
   * @returns {Promise<any>}
   */
  const executeAsSuperAdmin = (action, options = {}) => executeWithPermission('all', action, {
      ...options,
      onDenied: () => {
        throw new Error('Seul un super administrateur peut effectuer cette action');
      },
    });

  /**
   * Exécute une action uniquement si l'utilisateur est admin ou super_admin
   * @param {Function} action - L'action à exécuter
   * @param {Object} options - Options supplémentaires
   * @returns {Promise<any>}
   */
  const executeAsAdmin = (action, options = {}) => executeWithPermission('manage_users', action, {
      ...options,
      onDenied: () => {
        throw new Error('Seul un administrateur peut effectuer cette action');
      },
    });

  /**
   * Obtient le niveau d'accès de l'utilisateur actuel
   * @returns {number} Niveau d'accès
   */
  const getCurrentAccessLevel = () => currentUserRole && roles[currentUserRole] ? roles[currentUserRole].level : 0;

  /**
   * Vérifie si l'utilisateur actuel peut accéder à un niveau de permission donné
   * @param {number} requiredLevel - Niveau requis
   * @returns {boolean}
   */
  const canAccessLevel = (requiredLevel) => getCurrentAccessLevel() >= requiredLevel;

  /**
   * Vérifie si l'utilisateur actuel peut gérer un rôle donné
   * @param {string} roleId - Identifiant du rôle
   * @returns {boolean}
   */
  const canManageRole = (roleId) => {
    // Un utilisateur ne peut gérer que les rôles de niveau inférieur au sien
    if (!currentUserRole || !roleId) return false;

    const currentLevel = getCurrentAccessLevel();
    const targetLevel = roles[roleId]?.level || 0;

    return isSuperAdmin || (currentLevel > targetLevel);
  };

  return {
    // États
    currentUserRole,
    isSuperAdmin,
    isAdmin,
    roles,
    permissions,

    // Vérifications
    hasPermission,
    hasRolePermission,
    hasMinimumLevel,
    canAccessLevel,
    canManageRole,
    getCurrentAccessLevel,

    // Actions conditionnelles
    executeWithPermission,
    executeAsSuperAdmin,
    executeAsAdmin,

    // Gestion des rôles et permissions
    getRolesByPermission,
    getPermissionsByRole,
    updateRolePermissions,
    createRole,
    deleteRole,
    createPermission,
    updatePermission,
  };
}
