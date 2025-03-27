import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { CustomerListView } from 'src/sections/customer/view';

// ----------------------------------------------------------------------

const metadata = { title: `Clients list | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <CustomerListView />
    </>
  );
}
