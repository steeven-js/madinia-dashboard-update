import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { CustomerProfileView } from 'src/sections/customer/view';

// ----------------------------------------------------------------------

const metadata = { title: `Client profile | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <CustomerProfileView />
    </>
  );
}
