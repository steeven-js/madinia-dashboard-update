import Box from '@mui/material/Box';
import Pagination, { paginationClasses } from '@mui/material/Pagination';

import { paths } from 'src/routes/paths';

import { EventItemSkeleton } from './event-skeleton';
import { EventItemHorizontal } from './event-item-horizontal';

// ----------------------------------------------------------------------

export function EventListHorizontal({ events, loading }) {
  const renderLoading = () => <EventItemSkeleton variant="horizontal" />;

  const renderList = () =>
    events.map((event) => (
      <EventItemHorizontal
        key={event.id}
        event={event}
        detailsHref={paths.dashboard.event.details(event.id)}
        editHref={paths.dashboard.event.edit(event.id)}
      />
    ));

  return (
    <>
      <Box
        sx={{
          gap: 3,
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' },
        }}
      >
        {loading ? renderLoading() : renderList()}
      </Box>

      {events.length > 8 && (
        <Pagination
          count={8}
          sx={{
            mt: { xs: 5, md: 8 },
            [`& .${paginationClasses.ul}`]: { justifyContent: 'center' },
          }}
        />
      )}
    </>
  );
}
