import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { CustomerCreateView } from 'src/sections/customer/view';

// ----------------------------------------------------------------------

const metadata = { title: `Créer un nouveau client | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <CustomerCreateView />
    </>
  );
}
