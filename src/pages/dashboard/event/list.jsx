import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { EventListView } from 'src/sections/event/view';

// ----------------------------------------------------------------------

const metadata = { title: `Event list | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <EventListView />
    </>
  );
}
