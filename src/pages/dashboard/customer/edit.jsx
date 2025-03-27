import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';

import { useParams } from 'src/routes/hooks';

import { getCustomer } from 'src/hooks/use-customer';

import { CONFIG } from 'src/global-config';

import { CustomerEditView } from 'src/sections/customer/view';

// ----------------------------------------------------------------------

const metadata = { title: `Client edit | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { id = '' } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        if (id) {
          const customer = await getCustomer(id);
          setCurrentUser(customer);
        }
      } catch (error) {
        console.error('Error fetching customer:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      {!loading && <CustomerEditView user={currentUser} />}
    </>
  );
}
