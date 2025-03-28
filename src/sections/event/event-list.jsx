import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';

import { EventItemSkeleton } from './event-skeleton';
import { EventItem, EventItemLatest } from './event-item';

// ----------------------------------------------------------------------

export function EventList({ events, loading }) {
  const renderLoading = () => (
    <Box
      sx={{
        gap: 3,
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
      }}
    >
      <EventItemSkeleton />
    </Box>
  );

  const renderList = () => (
    <Grid container spacing={3}>
      {events.slice(0, 3).map((event, index) => (
        <Grid
          key={event.id}
          sx={{ display: { xs: 'none', lg: 'block' } }}
          size={{
            xs: 12,
            sm: 6,
            md: 4,
            lg: index === 0 ? 6 : 3,
          }}
        >
          <EventItemLatest
            event={event}
            index={index}
            detailsHref={paths.event.details(event.id)}
          />
        </Grid>
      ))}

      {events.slice(0, 3).map((event) => (
        <Grid
          key={event.id}
          sx={{ display: { lg: 'none' } }}
          size={{
            xs: 12,
            sm: 6,
            md: 4,
            lg: 3,
          }}
        >
          <EventItem event={event} detailsHref={paths.event.details(event.id)} />
        </Grid>
      ))}

      {events.slice(3, events.length).map((event) => (
        <Grid
          key={event.id}
          size={{
            xs: 12,
            sm: 6,
            md: 4,
            lg: 3,
          }}
        >
          <EventItem event={event} detailsHref={paths.event.details(event.id)} />
        </Grid>
      ))}
    </Grid>
  );

  return (
    <>
      {loading ? renderLoading() : renderList()}

      {events.length > 8 && (
        <Stack sx={{ mt: 8, mb: { xs: 10, md: 15 }, alignItems: 'center' }}>
          <Button
            size="large"
            variant="outlined"
            startIcon={<Iconify icon="svg-spinners:12-dots-scale-rotate" width={24} />}
          >
            Load More
          </Button>
        </Stack>
      )}
    </>
  );
}
