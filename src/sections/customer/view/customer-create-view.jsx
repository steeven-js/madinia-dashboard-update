import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { CustomerNewEditForm } from '../customer-new-edit-form';

// ----------------------------------------------------------------------

export function CustomerCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Créer un nouveau client"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Clients', href: paths.dashboard.customer.root },
          { name: 'Nouveau client' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <CustomerNewEditForm />
    </DashboardContent>
  );
}
