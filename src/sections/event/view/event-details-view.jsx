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

import { fDate } from 'src/utils/format-time';
import { fShortenNumber } from 'src/utils/format-number';

import { POST_PUBLISH_OPTIONS } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
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

  // Convert status to publish state
  const statusToPublish = (status) => {
    switch (status) {
      case 'current':
        return 'published';
      case 'past':
        return 'archived';
      default:
        return 'draft';
    }
  };

  useEffect(() => {
    if (event) {
      setPublish(event?.status ? statusToPublish(event.status) : 'draft');
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
          liveHref={paths.dashboard.event.details(event?.id)}
          publish={`${publish}`}
          onChangePublish={handleChangePublish}
          publishOptions={POST_PUBLISH_OPTIONS}
        />
      </Container>

      <EventDetailsHero title={`${event?.title}`} coverUrl={`${event?.image}`} />

      <Box
        sx={{
          pb: 5,
          mx: 'auto',
          maxWidth: 720,
          mt: { xs: 5, md: 10 },
          px: { xs: 2, sm: 3 },
        }}
      >
        {event?.date && (
          <Typography variant="subtitle2" sx={{ mb: 3, color: 'text.secondary' }}>
            Date: {fDate(new Date(event.date))}
          </Typography>
        )}

        {/* Render price information */}
        <Typography variant="subtitle2" sx={{ mb: 3, color: 'text.secondary' }}>
          {event?.isFree ? 'Free Event' : `Price: $${event?.price || 0}`}
        </Typography>

        {/* Description is HTML content, so render it with dangerouslySetInnerHTML */}
        <div dangerouslySetInnerHTML={{ __html: event?.description }} />

        {/* External links section if available */}
        {event?.externalLinks && event.externalLinks.length > 0 && (
          <Stack spacing={1} sx={{ mt: 3 }}>
            <Typography variant="subtitle2">External Links:</Typography>
            {event.externalLinks.map((link, index) => (
              <Button
                key={index}
                component="a"
                href={link.url}
                target="_blank"
                variant="outlined"
                startIcon={<Iconify icon="eva:external-link-fill" />}
                sx={{ justifyContent: 'flex-start' }}
              >
                {link.label}
              </Button>
            ))}
          </Stack>
        )}

        {/* Social media links if available */}
        <Stack
          direction="row"
          spacing={2}
          sx={{
            mt: 3,
            flexWrap: 'wrap',
            display:
              event?.linkedin || event?.facebook || event?.instagram || event?.twitter
                ? 'flex'
                : 'none',
          }}
        >
          {event?.linkedin && (
            <Button
              component="a"
              href={event.linkedin}
              target="_blank"
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon="ri:linkedin-fill" />}
            >
              LinkedIn
            </Button>
          )}

          {event?.facebook && (
            <Button
              component="a"
              href={event.facebook}
              target="_blank"
              variant="outlined"
              color="primary"
              startIcon={<Iconify icon="eva:facebook-fill" />}
            >
              Facebook
            </Button>
          )}

          {event?.instagram && (
            <Button
              component="a"
              href={event.instagram}
              target="_blank"
              variant="outlined"
              color="error"
              startIcon={<Iconify icon="ri:instagram-line" />}
            >
              Instagram
            </Button>
          )}

          {event?.twitter && (
            <Button
              component="a"
              href={event.twitter}
              target="_blank"
              variant="outlined"
              color="info"
              startIcon={<Iconify icon="eva:twitter-fill" />}
            >
              Twitter
            </Button>
          )}
        </Stack>

        {/* Participants section */}
        {event?.participants && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2">
              Participants: {event.participants.current || 0}/
              {event.participants.max || 'Unlimited'}
            </Typography>
          </Box>
        )}

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
