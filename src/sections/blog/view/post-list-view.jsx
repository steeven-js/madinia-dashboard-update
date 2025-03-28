import { orderBy } from 'es-toolkit';
import { useState, useCallback } from 'react';
import { useSetState } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { POST_SORT_OPTIONS } from 'src/_mock';
import { useGetPosts } from 'src/actions/blog';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PostSort } from '../post-sort';
import { PostSearch } from '../post-search';
import { PostListHorizontal } from '../post-list-horizontal';

// ----------------------------------------------------------------------

export function PostListView() {
  const { posts, postsLoading } = useGetPosts();

  const [sortBy, setSortBy] = useState('latest');

  const { state, setState } = useSetState({ publish: 'all' });

  const dataFiltered = applyFilter({ inputData: posts, filters: state, sortBy });

  const handleFilterPublish = useCallback(
    (event, newValue) => {
      setState({ publish: newValue });
    },
    [setState]
  );

  const publishedCount = posts.filter((post) => post.publish === 'published').length;
  const draftCount = posts.filter((post) => post.publish === 'draft').length;

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
        <PostSearch redirectPath={(id) => paths.dashboard.post.details(id)} />

        <PostSort
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
                {tab === 'all' && posts.length}
                {tab === 'published' && publishedCount}
                {tab === 'draft' && draftCount}
              </Label>
            }
            sx={{ textTransform: 'capitalize' }}
          />
        ))}
      </Tabs>

      <PostListHorizontal posts={dataFiltered} loading={postsLoading} />
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
    filteredData = orderBy(filteredData, [(post) => dateToTimestamp(post.createdAt)], ['desc']);
  }

  if (sortBy === 'oldest') {
    filteredData = orderBy(filteredData, [(post) => dateToTimestamp(post.createdAt)], ['asc']);
  }

  if (sortBy === 'popular') {
    filteredData = orderBy(filteredData, ['totalViews'], ['desc']);
  }

  if (publish !== 'all') {
    filteredData = filteredData.filter((post) => post.publish === publish);
  }

  return filteredData;
}
