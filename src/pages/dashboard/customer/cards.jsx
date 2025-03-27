import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { CustomerCardsView } from 'src/sections/customer/view';

// ----------------------------------------------------------------------

const metadata = { title: `Clients cards | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <CustomerCardsView />
    </>
  );
}
