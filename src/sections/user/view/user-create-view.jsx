import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { RoleBasedGuard } from 'src/auth/guard';

import { UserNewEditForm } from '../user-new-edit-form';

// ----------------------------------------------------------------------

export function UserCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create a new user"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'User', href: paths.dashboard.user.root },
          { name: 'New user' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <RoleBasedGuard
        hasContent
        roles={['super_admin', 'admin']}
        deniedContent={
          <div>
            You don't have permission to create users. Only admins or super admins can create new
            users.
          </div>
        }
      >
        <UserNewEditForm />
      </RoleBasedGuard>
    </DashboardContent>
  );
}
