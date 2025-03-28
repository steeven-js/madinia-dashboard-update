import { useMemo } from 'react';
import PropTypes from 'prop-types';

import { useAuth } from 'src/hooks/use-auth';

/**
 * Component for conditionally rendering content based on user permissions
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to display if permitted
 * @param {string|string[]} props.permissions - Required permission(s)
 * @param {React.ReactNode} props.fallback - Content to display if not permitted (optional)
 * @param {boolean} props.hideOnUnauthorized - Whether to hide content completely if not permitted
 * @param {boolean} props.disableOnUnauthorized - Whether to disable content if not permitted
 * @returns {React.ReactNode}
 */
export function PermissionControlled({
  children,
  permissions,
  fallback = null,
  hideOnUnauthorized = false,
  disableOnUnauthorized = false,
}) {
  const { hasPermission } = useAuth();

  // If no permissions are required, always show the content
  if (!permissions || permissions.length === 0) {
    return children;
  }

  // Transform single permission to array for consistency
  const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];

  // Check if user has any of the required permissions
  const isAuthorized = useMemo(() => requiredPermissions.some((permission) => hasPermission(permission)), [requiredPermissions, hasPermission]);

  // If user has permission, render the content
  if (isAuthorized) {
    return children;
  }

  // If user doesn't have permission and we should hide completely
  if (hideOnUnauthorized) {
    return fallback;
  }

  // If user doesn't have permission and we should disable
  if (disableOnUnauthorized) {
    // Apply a disabled state to children by cloning them with disabled prop
    const disabledChildren = useMemo(() => {
      const applyDisabled = (child) => {
        // Skip null/undefined children
        if (!child) return child;

        // Text nodes, strings, etc. can't be disabled
        if (typeof child !== 'object') return child;

        // If child has props, clone it and add disabled
        if (child.props) {
          return {
            ...child,
            props: {
              ...child.props,
              disabled: true,
              sx: {
                ...(child.props.sx || {}),
                opacity: 0.6,
                pointerEvents: 'none',
              },
            },
          };
        }

        return child;
      };

      // Apply disabled to all children (if array) or single child
      return Array.isArray(children)
        ? children.map((child) => applyDisabled(child))
        : applyDisabled(children);
    }, [children]);

    return disabledChildren;
  }

  // Default: show fallback content if not authorized
  return fallback;
}

PermissionControlled.propTypes = {
  children: PropTypes.node,
  permissions: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  fallback: PropTypes.node,
  hideOnUnauthorized: PropTypes.bool,
  disableOnUnauthorized: PropTypes.bool,
};
