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

  // Always calculate isAuthorized with useMemo
  const isAuthorized = useMemo(() => {
    // If no permissions required, user is authorized
    if (!permissions || permissions.length === 0) {
      return true;
    }

    // Transform single permission to array for consistency
    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
    return requiredPermissions.some((permission) => hasPermission(permission));
  }, [permissions, hasPermission]);

  // Always calculate disabledChildren with useMemo
  const disabledChildren = useMemo(() => {
    // Only calculate if we need to disable unauthorized content
    if (!disableOnUnauthorized || isAuthorized) return null;

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
  }, [children, disableOnUnauthorized, isAuthorized]);

  // Render based on authorization state and options
  if (isAuthorized) {
    return children;
  }

  if (hideOnUnauthorized) {
    return fallback;
  }

  if (disableOnUnauthorized) {
    return disabledChildren;
  }

  return fallback;
}

PermissionControlled.propTypes = {
  children: PropTypes.node,
  permissions: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  fallback: PropTypes.node,
  hideOnUnauthorized: PropTypes.bool,
  disableOnUnauthorized: PropTypes.bool,
};
