import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { RoleBasedGuard } from 'src/auth/guard';

import { UserNewEditForm } from '../user-new-edit-form';

// ----------------------------------------------------------------------

export function UserEditView({ user: currentUser }) {
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
            You don&apos;t have permission to edit users. Only admins or super admins can edit user
            information.
          </div>
        }
      >
        <UserNewEditForm currentUser={currentUser} />
      </RoleBasedGuard>
    </DashboardContent>
  );
}
