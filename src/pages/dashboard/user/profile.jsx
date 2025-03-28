import { Box, CircularProgress } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { EmptyContent } from 'src/components/empty-content';

import { CONFIG } from 'src/global-config';
import { useAuth } from 'src/hooks/use-auth';

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
