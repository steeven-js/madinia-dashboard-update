import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

import { paths } from 'src/routes/paths';
import { useParams, useRouter } from 'src/routes/hooks';

import { useEvent } from 'src/hooks/use-event';

import { CONFIG } from 'src/global-config';

import { EventEditView } from 'src/sections/event/view';

// ----------------------------------------------------------------------

const metadata = { title: `Event edit | Dashboard - ${CONFIG.appName}` };

export default function EventEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const { event, loading } = useEvent(id);

  // Redirect if post not found after loading completes
  useEffect(() => {
    if (!loading && !event) {
      router.push(paths.dashboard.event.root);
    }
  }, [event, loading, router]);

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <EventEditView />
    </>
  );
}
