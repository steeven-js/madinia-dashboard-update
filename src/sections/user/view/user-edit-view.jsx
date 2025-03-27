import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { RoleBasedGuard } from 'src/auth/guard';

import { UserNewEditForm } from '../user-new-edit-form';
import { useAuth } from 'src/hooks/use-auth';

// ----------------------------------------------------------------------

export function UserEditView({ user: currentUser }) {
  const { role: currentUserRole } = useAuth();

  // Vérifier si c'est un super_admin ou un admin
  const isAdmin = currentUserRole === 'super_admin' || currentUserRole === 'admin';

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit"
        backHref={paths.dashboard.user.list}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'User', href: paths.dashboard.user.root },
          { name: currentUser?.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <RoleBasedGuard
        hasContent
        roles={['super_admin', 'admin']}
        deniedContent={
          <div>
            You don't have permission to edit users. Only admins or super admins can edit user
            information.
          </div>
        }
      >
        <UserNewEditForm currentUser={currentUser} />
      </RoleBasedGuard>
    </DashboardContent>
  );
}
