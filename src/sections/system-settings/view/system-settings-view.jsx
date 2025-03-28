import { useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { useAuth } from 'src/hooks/use-auth';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { RoleBasedGuard } from 'src/auth/guard';

import { RolesTab } from '../tabs/roles-tab';
import { PermissionsTab } from '../tabs/permissions-tab';
import { GeneralSettingsTab } from '../tabs/general-settings-tab';

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'general',
    label: 'Paramètres Généraux',
    component: <GeneralSettingsTab />,
  },
  {
    value: 'roles',
    label: 'Gestion des Rôles',
    component: <RolesTab />,
  },
  {
    value: 'permissions',
    label: 'Gestion des Permissions',
    component: <PermissionsTab />,
  },
];

// ----------------------------------------------------------------------

export function SystemSettingsView() {
  const [currentTab, setCurrentTab] = useState('general');

  const { userProfile, role } = useAuth();

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Paramètres Système"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Paramètres Système' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <RoleBasedGuard
        hasContent
        roles={['super_admin']}
        deniedContent={
          <Container sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h6" paragraph>
              Accès Restreint
            </Typography>
            <Typography variant="body2">
              Cette section est réservée aux administrateurs système. Vous n'avez pas les
              autorisations nécessaires pour accéder à cette page.
            </Typography>
          </Container>
        }
      >
        <Tabs
          value={currentTab}
          onChange={handleChangeTab}
          sx={{
            mb: 5,
            '& .MuiTabs-flexContainer': {
              justifyContent: { xs: 'center', md: 'flex-start' },
            },
          }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>

        {TABS.map((tab) => tab.value === currentTab && <div key={tab.value}>{tab.component}</div>)}
      </RoleBasedGuard>
    </DashboardContent>
  );
}
