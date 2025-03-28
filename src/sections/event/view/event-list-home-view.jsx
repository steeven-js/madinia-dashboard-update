import { useState } from 'react';
import { orderBy } from 'es-toolkit';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { EVENT_SORT_OPTIONS } from 'src/_mock';

import { EventList } from '../event-list';
import { EventSort } from '../event-sort';
import { EventSearch } from '../event-search';

// ----------------------------------------------------------------------

export function EventListHomeView({ events, loading }) {
  const [sortBy, setSortBy] = useState('latest');

  const dataFiltered = applyFilter({ inputData: events, sortBy });

  return (
    <Container>
      <Typography variant="h4" sx={[{ my: { xs: 3, md: 5 } }]}>
        Events
      </Typography>

      <Box
        sx={[
          () => ({
            gap: 3,
            display: 'flex',
            mb: { xs: 3, md: 5 },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-end', sm: 'center' },
          }),
        ]}
      >
        <EventSearch redirectPath={(id) => paths.event.details(id)} />

        <EventSort
          sort={sortBy}
          onSort={(newValue) => setSortBy(newValue)}
          sortOptions={EVENT_SORT_OPTIONS}
        />
      </Box>

      <EventList events={dataFiltered} loading={loading} />
    </Container>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, sortBy }) {
  const dateToTimestamp = (date) => {
    if (!date) return 0;

    // Handle string dates
    if (typeof date === 'string') {
      return new Date(date).getTime();
    }

    // Handle Firestore timestamps
    if (date && typeof date === 'object' && date.toDate && typeof date.toDate === 'function') {
      return date.toDate().getTime();
    }

    // Handle JavaScript Date objects
    if (date instanceof Date && !isNaN(date)) {
      return date.getTime();
    }

    // Fallback for other cases
    console.warn('Unknown date format:', date);
    return 0;
  };

  let filteredData = [...inputData];

  if (sortBy === 'latest') {
    filteredData = orderBy(filteredData, [(event) => dateToTimestamp(event.createdAt)], ['desc']);
  }

  if (sortBy === 'oldest') {
    filteredData = orderBy(filteredData, [(event) => dateToTimestamp(event.createdAt)], ['asc']);
  }

  if (sortBy === 'popular') {
    filteredData = orderBy(filteredData, ['totalViews'], ['desc']);
  }

  return filteredData;
}
