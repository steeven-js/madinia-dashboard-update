import { Helmet } from 'react-helmet-async';

import { Box, CircularProgress } from '@mui/material';

import { useAuth } from 'src/hooks/use-auth';

import { CONFIG } from 'src/global-config';

import { EmptyContent } from 'src/components/empty-content';

import { UserProfileView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

const metadata = { title: `User profile | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { user: currentUser, userProfile: currentUserProfile, loading } = useAuth();

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      ) : currentUser && currentUserProfile ? (
        <UserProfileView currentUser={currentUser} currentUserProfile={currentUserProfile} />
      ) : (
        <EmptyContent title="Aucun utilisateur" />
      )}
    </>
  );
}
