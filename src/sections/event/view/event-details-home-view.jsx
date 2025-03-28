import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import AvatarGroup from '@mui/material/AvatarGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fShortenNumber } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { Markdown } from 'src/components/markdown';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { EventItem } from '../event-item';
import { EventItemSkeleton } from '../event-skeleton';
import { EventCommentList } from '../event-comment-list';
import { EventCommentForm } from '../event-comment-form';
import { EventDetailsHero } from '../event-details-hero';

// ----------------------------------------------------------------------

export function EventDetailsHomeView({ event, latestEvents, loading, error }) {
  if (loading) {
    return <EventItemSkeleton />;
  }

  if (error) {
    return (
      <Container sx={{ my: 5 }}>
        <EmptyContent
          filled
          title="Event not found!"
          action={
            <Button
              component={RouterLink}
              href={paths.event.root}
              startIcon={<Iconify width={16} icon="eva:arrow-ios-back-fill" />}
              sx={{ mt: 3 }}
            >
              Back to list
            </Button>
          }
          sx={{ py: 10 }}
        />
      </Container>
    );
  }

  return (
    <>
      <EventDetailsHero
        title={event?.title ?? ''}
        author={event?.author}
        coverUrl={event?.coverUrl ?? ''}
        createdAt={event?.createdAt}
      />

      <Container
        maxWidth={false}
        sx={[
          (theme) => ({ py: 3, mb: 5, borderBottom: `solid 1px ${theme.vars.palette.divider}` }),
        ]}
      >
        <CustomBreadcrumbs
          links={[
            { name: 'Home', href: '/' },
            { name: 'Event', href: paths.event.root },
            { name: event?.title },
          ]}
          sx={{ maxWidth: 720, mx: 'auto' }}
        />
      </Container>

      <Container maxWidth={false}>
        <Stack sx={{ maxWidth: 720, mx: 'auto' }}>
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
              {event?.tags.map((tag) => (
                <Chip key={tag} label={tag} variant="soft" />
              ))}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                label={fShortenNumber(event?.totalFavorites)}
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

              <AvatarGroup>
                {event?.favoritePerson.map((person) => (
                  <Avatar key={person.name} alt={person.name} src={person.avatarUrl} />
                ))}
              </AvatarGroup>
            </Box>
          </Stack>

          <Box sx={{ mb: 3, mt: 5, display: 'flex' }}>
            <Typography variant="h4">Comments</Typography>

            <Typography variant="subtitle2" sx={{ color: 'text.disabled' }}>
              ({event?.comments.length})
            </Typography>
          </Box>

          <EventCommentForm />

          <Divider sx={{ mt: 5, mb: 2 }} />

          <EventCommentList comments={event?.comments} />
        </Stack>
      </Container>

      {!!latestEvents?.length && (
        <Container sx={{ pb: 15 }}>
          <Typography variant="h4" sx={{ mb: 5 }}>
            Recent Events
          </Typography>

          <Grid container spacing={3}>
            {latestEvents?.slice(latestEvents.length - 4).map((latestEvent) => (
              <Grid
                key={latestEvent.id}
                size={{
                  xs: 12,
                  sm: 6,
                  md: 4,
                  lg: 3,
                }}
              >
                <EventItem
                  event={latestEvent}
                  detailsHref={paths.event.details(latestEvent.title)}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      )}
    </>
  );
}
