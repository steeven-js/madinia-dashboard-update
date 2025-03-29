import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';

import { Box, CircularProgress } from '@mui/material';

import { useParams } from 'src/routes/hooks';

// Importer tous les hooks depuis use-users pour résoudre le problème d'importation spécifique
import * as UserHooks from 'src/hooks/use-users';

import { CONFIG } from 'src/global-config';
import { FIRESTORE } from 'src/lib/firebase';

import { UserEditView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

const metadata = { title: `User edit | Dashboard - ${CONFIG.appName}` };

// Implémentation locale du hook useUserById comme solution de contournement
const useLocalUserById = (id) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setUser(null);
      setLoading(false);
      return () => {};
    }

    // Référence au document utilisateur
    const userDocRef = doc(FIRESTORE, 'users', id);

    // Souscription aux changements en temps réel
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const docData = docSnapshot.data();
          setUser({ id: docSnapshot.id, ...docData });
        } else {
          console.error('No such document!');
          setUser(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching user:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  return { user, loading };
};

export default function Page() {
  const { id = '' } = useParams();

  // Essayer d'utiliser d'abord le hook importé, puis la solution de contournement locale
  const useUserById = UserHooks.useUserById || useLocalUserById;
  const { user, loading } = useUserById(id);

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      ) : (
        <UserEditView user={user} />
      )}
    </>
  );
}
