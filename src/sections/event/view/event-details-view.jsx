import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import AvatarGroup, { avatarGroupClasses } from '@mui/material/AvatarGroup';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fShortenNumber } from 'src/utils/format-number';

import { POST_PUBLISH_OPTIONS } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Markdown } from 'src/components/markdown';
import { EmptyContent } from 'src/components/empty-content';

import { EventItemSkeleton } from '../event-skeleton';
import { EventDetailsHero } from '../event-details-hero';
import { EventCommentList } from '../event-comment-list';
import { EventCommentForm } from '../event-comment-form';
import { EventDetailsToolbar } from '../event-details-toolbar';

// ----------------------------------------------------------------------

export function EventDetailsView({ event, loading, error }) {
  const [publish, setPublish] = useState('');

  const handleChangePublish = useCallback((newValue) => {
    setPublish(newValue);
  }, []);

  useEffect(() => {
    if (event) {
      setPublish(event?.publish);
    }
  }, [event]);

  if (loading) {
    return (
      <DashboardContent maxWidth={false} disablePadding>
        <EventItemSkeleton />
      </DashboardContent>
    );
  }

  if (error) {
    return (
      <DashboardContent maxWidth={false}>
        <EmptyContent
          filled
          title="Event not found!"
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.event.root}
              startIcon={<Iconify width={16} icon="eva:arrow-ios-back-fill" />}
              sx={{ mt: 3 }}
            >
              Back to list
            </Button>
          }
          sx={{ py: 10, height: 'auto', flexGrow: 'unset' }}
        />
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth={false} disablePadding>
      <Container maxWidth={false} sx={{ px: { sm: 5 } }}>
        <EventDetailsToolbar
          backHref={paths.dashboard.event.root}
          editHref={paths.dashboard.event.edit(event?.id)}
          liveHref={paths.event.details(event?.id)}
          publish={`${publish}`}
          onChangePublish={handleChangePublish}
          publishOptions={POST_PUBLISH_OPTIONS}
        />
      </Container>

      <EventDetailsHero title={`${event?.title}`} coverUrl={`${event?.coverUrl}`} />

      <Box
        sx={{
          pb: 5,
          mx: 'auto',
          maxWidth: 720,
          mt: { xs: 5, md: 10 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Typography variant="subtitle1">{event?.description}</Typography>

        <Markdown children={event?.content} />

        <Stack
          spacing={3}
          sx={[
            (theme) => ({
              py: 3,
              borderTop: `dashed 1px ${theme.vars.palette.divider}`,
              borderBottom: `dashed 1px ${theme.vars.palette.divider}`,
            }),
          ]}
        >
          <Box sx={{ gap: 1, display: 'flex', flexWrap: 'wrap' }}>
            {event?.tags?.map((tag) => (
              <Chip key={tag} label={tag} variant="soft" />
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              label={fShortenNumber(event?.totalFavorites || 0)}
              control={
                <Checkbox
                  defaultChecked
                  size="small"
                  color="error"
                  icon={<Iconify icon="solar:heart-bold" />}
                  checkedIcon={<Iconify icon="solar:heart-bold" />}
                  inputProps={{
                    id: 'favorite-checkbox',
                    'aria-label': 'Favorite checkbox',
                  }}
                />
              }
              sx={{ mr: 1 }}
            />

            <AvatarGroup sx={{ [`& .${avatarGroupClasses.avatar}`]: { width: 32, height: 32 } }}>
              {event?.favoritePerson?.map((person) => (
                <Avatar key={person.name} alt={person.name} src={person.avatarUrl} />
              ))}
            </AvatarGroup>
          </Box>
        </Stack>

        <Box sx={{ mb: 3, mt: 5, display: 'flex' }}>
          <Typography variant="h4">Comments</Typography>

          <Typography variant="subtitle2" sx={{ color: 'text.disabled' }}>
            ({event?.comments?.length || 0})
          </Typography>
        </Box>

        <EventCommentForm />

        <Divider sx={{ mt: 5, mb: 2 }} />

        <EventCommentList comments={event?.comments ?? []} />
      </Box>
    </DashboardContent>
  );
}
