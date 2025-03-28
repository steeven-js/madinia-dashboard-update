import { useParams } from 'react-router';

import { paths } from 'src/routes/paths';

import { useEvent } from 'src/hooks/use-event';

import { DashboardContent } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { EventNewEditForm } from '../event-new-edit-form';

// ----------------------------------------------------------------------

export function EventEditView() {
  const { id } = useParams();
  const { event, eventLoading } = useEvent(id);

  if (eventLoading) {
    return <LoadingScreen />;
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit"
        backHref={paths.dashboard.event.root}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Event', href: paths.dashboard.event.root },
          { name: event?.title || '' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <EventNewEditForm currentEvent={event} />
    </DashboardContent>
  );
}
