import PropTypes from 'prop-types';
import { useMemo, useState, useContext, useCallback, createContext } from 'react';

import { useAuth } from 'src/hooks/use-auth';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

/**
 * Contexte pour la gestion des rôles et permissions
 */
const RolePermissionContext = createContext({
  // Données
  roles: {},
  permissions: [],

  // Méthodes
  getRolesByPermission: () => [],
  getPermissionsByRole: () => [],
  hasRolePermission: () => false,
  hasMinimumLevel: () => false,

  // Actions
  updateRolePermissions: () => Promise.resolve(),
  createRole: () => Promise.resolve(),
  deleteRole: () => Promise.resolve(),
  createPermission: () => Promise.resolve(),
  updatePermission: () => Promise.resolve(),
});

// ----------------------------------------------------------------------

/**
 * Provider pour le contexte de gestion des rôles et permissions
 */
export function RolePermissionProvider({ children }) {
  const { role: currentUserRole } = useAuth();

  // État initial basé sur CONFIG.roles
  const [roles, setRoles] = useState(CONFIG.roles);

  // Extraire toutes les permissions uniques de roles
  const permissions = useMemo(() => {
    const permissionsMap = new Map();

    // Ajouter la permission spéciale 'all'
    permissionsMap.set('all', {
      code: 'all',
      description: 'Accès complet à toutes les fonctionnalités',
      roles: Object.entries(roles)
        .filter(([_, role]) => role.permissions.includes('all'))
        .map(([key, _]) => key),
    });

    // Ajouter les autres permissions
    Object.entries(roles).forEach(([roleName, role]) => {
      role.permissions.forEach((permission) => {
        if (permission !== 'all') {
          const existingPermission = permissionsMap.get(permission);

          if (existingPermission) {
            if (!existingPermission.roles.includes(roleName)) {
              existingPermission.roles.push(roleName);
            }
          } else {
            permissionsMap.set(permission, {
              code: permission,
              description: getDefaultDescription(permission),
              roles: [roleName],
            });
          }
        }
      });
    });

    return Array.from(permissionsMap.values());
  }, [roles]);

  /**
   * Obtenir la description par défaut d'une permission
   */
  function getDefaultDescription(permissionCode) {
    const descriptions = {
      manage_users: 'Gérer les utilisateurs',
      manage_content: 'Gérer le contenu',
      view_analytics: 'Voir les analytiques',
      view_content: 'Voir le contenu',
    };

    return descriptions[permissionCode] || permissionCode;
  }

  /**
   * Vérifier si un rôle a une permission spécifique
   */
  const hasRolePermission = useCallback(
    (roleName, permission) => {
      // Si pas de rôle défini ou rôle non configuré, refuser l'accès
      if (!roleName || !roles[roleName]) return false;

      const roleConfig = roles[roleName];

      // Si le rôle a la permission spéciale 'all', autoriser tout accès
      if (roleConfig.permissions.includes('all')) return true;

      // Vérifier si la permission spécifique est accordée
      return roleConfig.permissions.includes(permission);
    },
    [roles]
  );

  /**
   * Vérifier si un rôle a un niveau minimum requis
   */
  const hasMinimumLevel = useCallback(
    (roleName, requiredLevel) => {
      // Si pas de rôle défini ou rôle non configuré, refuser l'accès
      if (!roleName || !roles[roleName]) return false;

      const roleConfig = roles[roleName];

      // Vérifier si le niveau du rôle est >= au niveau requis
      return roleConfig.level >= requiredLevel;
    },
    [roles]
  );

  /**
   * Obtenir tous les rôles ayant une permission spécifique
   */
  const getRolesByPermission = useCallback(
    (permission) =>
      Object.entries(roles)
        .filter(
          ([_, roleConfig]) =>
            roleConfig.permissions.includes(permission) || roleConfig.permissions.includes('all')
        )
        .map(([roleName, _]) => roleName),
    [roles]
  );

  /**
   * Obtenir toutes les permissions d'un rôle
   */
  const getPermissionsByRole = useCallback(
    (roleName) => {
      if (!roleName || !roles[roleName]) return [];

      return roles[roleName].permissions;
    },
    [roles]
  );

  /**
   * Mettre à jour les permissions d'un rôle
   */
  const updateRolePermissions = useCallback(
    async (roleName, newPermissions) => {
      // Vérifier si l'utilisateur actuel est super_admin (seul autorisé à modifier les permissions)
      if (currentUserRole !== 'super_admin') {
        throw new Error('Seul un super administrateur peut modifier les permissions');
      }

      // Vérifier si le rôle existe
      if (!roleName || !roles[roleName]) {
        throw new Error(`Le rôle ${roleName} n'existe pas`);
      }

      // Protéger les rôles système
      if (['super_admin'].includes(roleName)) {
        throw new Error('Les permissions du rôle super_admin ne peuvent pas être modifiées');
      }

      // Mettre à jour les permissions
      setRoles((prev) => ({
        ...prev,
        [roleName]: {
          ...prev[roleName],
          permissions: newPermissions,
        },
      }));

      // Ici, vous pourriez également synchroniser avec Firestore/Firebase
      return true;
    },
    [currentUserRole, roles]
  );

  /**
   * Créer un nouveau rôle
   */
  const createRole = useCallback(
    async (roleData) => {
      // Vérifier si l'utilisateur actuel est super_admin
      if (currentUserRole !== 'super_admin') {
        throw new Error('Seul un super administrateur peut créer des rôles');
      }

      const { id, name, label, level, permissions: permissionList } = roleData;

      // Vérifier si le rôle existe déjà
      if (roles[id]) {
        throw new Error(`Le rôle ${id} existe déjà`);
      }

      // Créer le nouveau rôle
      setRoles((prev) => ({
        ...prev,
        [id]: {
          name,
          label,
          level,
          permissions: permissionList,
        },
      }));

      // Ici, vous pourriez également synchroniser avec Firestore/Firebase
      return true;
    },
    [currentUserRole, roles]
  );

  /**
   * Supprimer un rôle
   */
  const deleteRole = useCallback(
    async (roleId) => {
      // Vérifier si l'utilisateur actuel est super_admin
      if (currentUserRole !== 'super_admin') {
        throw new Error('Seul un super administrateur peut supprimer des rôles');
      }

      // Protéger les rôles système
      if (['super_admin', 'user'].includes(roleId)) {
        throw new Error('Les rôles système ne peuvent pas être supprimés');
      }

      // Vérifier si le rôle existe
      if (!roles[roleId]) {
        throw new Error(`Le rôle ${roleId} n'existe pas`);
      }

      // Supprimer le rôle
      setRoles((prev) => {
        const newRoles = { ...prev };
        delete newRoles[roleId];
        return newRoles;
      });

      // Ici, vous pourriez également synchroniser avec Firestore/Firebase
      return true;
    },
    [currentUserRole, roles]
  );

  /**
   * Créer une nouvelle permission (descriptive uniquement)
   */
  const createPermission = useCallback(
    async (permissionData) =>
      // Cette fonction est principalement informative car les permissions
      // sont en réalité stockées avec les rôles
      true,
    []
  );

  /**
   * Mettre à jour une permission (descriptive uniquement)
   */
  const updatePermission = useCallback(
    async (permissionData) =>
      // Cette fonction est principalement informative car les permissions
      // sont en réalité stockées avec les rôles
      true,
    []
  );

  const contextValue = useMemo(
    () => ({
      // Données
      roles,
      permissions,

      // Méthodes
      getRolesByPermission,
      getPermissionsByRole,
      hasRolePermission,
      hasMinimumLevel,

      // Actions
      updateRolePermissions,
      createRole,
      deleteRole,
      createPermission,
      updatePermission,
    }),
    [
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
    ]
  );

  return (
    <RolePermissionContext.Provider value={contextValue}>{children}</RolePermissionContext.Provider>
  );
}

RolePermissionProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// ----------------------------------------------------------------------

/**
 * Hook pour utiliser le contexte de gestion des rôles et permissions
 */
export function useRolePermission() {
  const context = useContext(RolePermissionContext);

  if (!context) {
    throw new Error('useRolePermission doit être utilisé dans un RolePermissionProvider');
  }

  return context;
}
