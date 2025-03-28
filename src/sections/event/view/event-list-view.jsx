import { orderBy } from 'es-toolkit';
import { useState, useCallback } from 'react';
import { useSetState } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useEvent } from 'src/hooks/use-event';

import { POST_SORT_OPTIONS } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { EventSort } from '../event-sort';
import { EventSearch } from '../event-search';
import { EventListHorizontal } from '../event-list-horizontal';

// ----------------------------------------------------------------------

export function EventListView() {
  const { events, loading } = useEvent();

  const [sortBy, setSortBy] = useState('latest');

  const { state, setState } = useSetState({ publish: 'all' });

  const dataFiltered = applyFilter({ inputData: events, filters: state, sortBy });

  const handleFilterPublish = useCallback(
    (event, newValue) => {
      setState({ publish: newValue });
    },
    [setState]
  );

  const publishedCount = events.filter((event) => event.publish === 'published').length;
  const draftCount = events.filter((event) => event.publish === 'draft').length;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Blog', href: paths.dashboard.post.root },
          { name: 'List' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.post.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New post
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Box
        sx={{
          gap: 3,
          display: 'flex',
          mb: { xs: 3, md: 5 },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-end', sm: 'center' },
        }}
      >
        <EventSearch redirectPath={(id) => paths.dashboard.event.details(id)} />

        <EventSort
          sort={sortBy}
          onSort={(newValue) => setSortBy(newValue)}
          sortOptions={POST_SORT_OPTIONS}
        />
      </Box>

      <Tabs value={state.publish} onChange={handleFilterPublish} sx={{ mb: { xs: 3, md: 5 } }}>
        {['all', 'published', 'draft'].map((tab) => (
          <Tab
            key={tab}
            iconPosition="end"
            value={tab}
            label={tab}
            icon={
              <Label
                variant={((tab === 'all' || tab === state.publish) && 'filled') || 'soft'}
                color={(tab === 'published' && 'info') || 'default'}
              >
                {tab === 'all' && events.length}
                {tab === 'published' && publishedCount}
                {tab === 'draft' && draftCount}
              </Label>
            }
            sx={{ textTransform: 'capitalize' }}
          />
        ))}
      </Tabs>

      <EventListHorizontal events={dataFiltered} loading={loading} />
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, filters, sortBy }) {
  const { publish } = filters;

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

  if (publish !== 'all') {
    filteredData = filteredData.filter((event) => event.publish === publish);
  }

  return filteredData;
}
