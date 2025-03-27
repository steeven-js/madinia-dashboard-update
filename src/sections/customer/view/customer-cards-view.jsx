import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { _customerCards } from 'src/_mock/_customer';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { CustomerCardList } from '../customer-card-list';

// ----------------------------------------------------------------------

export function CustomerCardsView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Clients cards"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Clients', href: paths.dashboard.customer.root },
          { name: 'Cards' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.customer.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Nouveau client
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <CustomerCardList users={_customerCards} />
    </DashboardContent>
  );
}
