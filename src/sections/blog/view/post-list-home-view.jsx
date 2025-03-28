import { useState } from 'react';
import { orderBy } from 'es-toolkit';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { POST_SORT_OPTIONS } from 'src/_mock';

import { PostList } from '../post-list';
import { PostSort } from '../post-sort';
import { PostSearch } from '../post-search';

// ----------------------------------------------------------------------

export function PostListHomeView({ posts, loading }) {
  const [sortBy, setSortBy] = useState('latest');

  const dataFiltered = applyFilter({ inputData: posts, sortBy });

  return (
    <Container>
      <Typography variant="h4" sx={[{ my: { xs: 3, md: 5 } }]}>
        Blog
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
        <PostSearch redirectPath={(id) => paths.post.details(id)} />

        <PostSort
          sort={sortBy}
          onSort={(newValue) => setSortBy(newValue)}
          sortOptions={POST_SORT_OPTIONS}
        />
      </Box>

      <PostList posts={dataFiltered} loading={loading} />
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
    filteredData = orderBy(filteredData, [(post) => dateToTimestamp(post.createdAt)], ['desc']);
  }

  if (sortBy === 'oldest') {
    filteredData = orderBy(filteredData, [(post) => dateToTimestamp(post.createdAt)], ['asc']);
  }

  if (sortBy === 'popular') {
    filteredData = orderBy(filteredData, ['totalViews'], ['desc']);
  }

  return filteredData;
}
