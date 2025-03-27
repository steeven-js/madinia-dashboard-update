import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';
import { _customerList } from 'src/_mock/_customer';

import { CustomerEditView } from 'src/sections/customer/view';

// ----------------------------------------------------------------------

const metadata = { title: `Client edit | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { id = '' } = useParams();

  const currentUser = _customerList.find((user) => user.id === id);

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <CustomerEditView user={currentUser} />
    </>
  );
}
