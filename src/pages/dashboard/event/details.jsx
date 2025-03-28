import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { useEvent } from 'src/hooks/use-event';

import { CONFIG } from 'src/global-config';

import { EventDetailsView } from 'src/sections/event/view';

// ----------------------------------------------------------------------

const metadata = { title: `Event details | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { id = '' } = useParams();

  const { event, loading, error } = useEvent(id);

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <EventDetailsView event={event} loading={loading} error={error} />
    </>
  );
}
