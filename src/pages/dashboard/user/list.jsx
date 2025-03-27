import { Helmet } from 'react-helmet-async';
import { useState } from 'react';

import { Box, CircularProgress, Switch, FormControlLabel, Typography } from '@mui/material';

import { useAuth } from 'src/hooks/use-auth';
import { useUsersData } from 'src/hooks/use-users';

import { CONFIG } from 'src/global-config';

import { EmptyContent } from 'src/components/empty-content';

import { UserListView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

const metadata = { title: `Liste des utilisateurs | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(true);
  const { users, loading, error, refresh, stopRealtimeUpdates, startRealtimeUpdates } =
    useUsersData(isRealtimeEnabled);

  const { userProfile: currentAuthUser } = useAuth();

  // Gestionnaire pour activer/désactiver les mises à jour en temps réel
  const handleRealtimeToggle = (event) => {
    const newValue = event.target.checked;
    setIsRealtimeEnabled(newValue);

    if (newValue) {
      startRealtimeUpdates();
    } else {
      stopRealtimeUpdates();
    }
  };

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <FormControlLabel
          control={
            <Switch
              checked={isRealtimeEnabled}
              onChange={handleRealtimeToggle}
              name="realtimeUpdates"
              color="primary"
            />
          }
          label={
            <Typography variant="body2" color="text.secondary">
              Mises à jour en temps réel
            </Typography>
          }
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <EmptyContent
            title="Erreur lors du chargement"
            description={error}
            action={
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isRealtimeEnabled}
                      onChange={handleRealtimeToggle}
                      name="realtimeUpdates"
                      color="primary"
                    />
                  }
                  label="Activer les mises à jour en temps réel"
                />
              </Box>
            }
          />
        </Box>
      ) : users.length === 0 ? (
        <EmptyContent title="Aucun utilisateur" />
      ) : (
        <UserListView users={users} currentAuthUser={currentAuthUser} onManualRefresh={refresh} />
      )}
    </>
  );
}
