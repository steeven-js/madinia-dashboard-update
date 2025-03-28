import { m } from 'framer-motion';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useAuth } from 'src/hooks/use-auth';

import { ForbiddenIllustration } from 'src/assets/illustrations';

import { varBounce, MotionContainer } from 'src/components/animate';

// ----------------------------------------------------------------------

/**
 * Component to restrict access based on user permissions
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if user has permission
 * @param {boolean} props.hasContent - Whether to show content if permission is denied
 * @param {string|string[]} props.permissions - Required permission(s) to access the content
 * @param {Object} props.sx - Additional styles
 * @param {React.ReactNode} props.deniedContent - Custom content to show when permission is denied
 * @returns {React.ReactNode}
 */
export function PermissionBasedGuard({ sx, children, hasContent, permissions, deniedContent }) {
  const { hasPermission } = useAuth();

  // If no permissions specified, allow access
  if (!permissions || permissions.length === 0) {
    return <>{children}</>;
  }

  // Convert single permission to array
  const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];

  // Check if user has any of the required permissions
  const hasRequiredPermission = requiredPermissions.some((permission) => hasPermission(permission));

  if (!hasRequiredPermission) {
    // If denied content is provided, use it
    if (deniedContent) {
      return deniedContent;
    }

    // If hasContent is true, show the default denied message
    return hasContent ? (
      <Container
        component={MotionContainer}
        sx={[{ textAlign: 'center' }, ...(Array.isArray(sx) ? sx : [sx])]}
      >
        <m.div variants={varBounce('in')}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Permission refusée
          </Typography>
        </m.div>

        <m.div variants={varBounce('in')}>
          <Typography sx={{ color: 'text.secondary' }}>
            Vous ne disposez pas des permissions nécessaires pour accéder à cette fonctionnalité.
          </Typography>
        </m.div>

        <m.div variants={varBounce('in')}>
          <ForbiddenIllustration sx={{ my: { xs: 5, sm: 10 } }} />
        </m.div>
      </Container>
    ) : null;
  }

  return <>{children}</>;
}
