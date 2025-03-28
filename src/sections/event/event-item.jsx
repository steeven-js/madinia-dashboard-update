import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';
import { fShortenNumber } from 'src/utils/format-number';

import { AvatarShape } from 'src/assets/illustrations';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function EventItem({ event, detailsHref, sx, ...other }) {
  return (
    <Card sx={sx} {...other}>
      <Box sx={{ position: 'relative' }}>
        <AvatarShape
          sx={{
            left: 0,
            zIndex: 9,
            width: 88,
            height: 36,
            bottom: -16,
            position: 'absolute',
          }}
        />

        <Avatar
          alt={event.author.name}
          src={event.author.avatarUrl}
          sx={{
            left: 24,
            zIndex: 9,
            bottom: -24,
            position: 'absolute',
          }}
        />

        <Image alt={event.title} src={event.coverUrl} ratio="4/3" />
      </Box>

      <CardContent sx={{ pt: 6 }}>
        <Typography variant="caption" component="div" sx={{ mb: 1, color: 'text.disabled' }}>
          {fDate(event.createdAt)}
        </Typography>

        <Link
          component={RouterLink}
          href={detailsHref}
          color="inherit"
          variant="subtitle2"
          sx={(theme) => ({
            ...theme.mixins.maxLine({ line: 2, persistent: theme.typography.subtitle2 }),
          })}
        >
          {event.title}
        </Link>

        <InfoBlock
          totalViews={event.totalViews}
          totalShares={event.totalShares}
          totalComments={event.totalComments}
        />
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------

export function EventItemLatest({ event, index, detailsHref }) {
  const eventSmall = index === 1 || index === 2;

  return (
    <Card>
      <Avatar
        alt={event.author.name}
        src={event.author.avatarUrl}
        sx={{
          top: 24,
          left: 24,
          zIndex: 9,
          position: 'absolute',
        }}
      />

      <Image
        alt={event.title}
        src={event.coverUrl}
        ratio="4/3"
        sx={{ height: 360 }}
        slotProps={{
          overlay: {
            sx: (theme) => ({
              bgcolor: varAlpha(theme.vars.palette.grey['900Channel'], 0.64),
            }),
          },
        }}
      />

      <CardContent
        sx={{
          width: 1,
          zIndex: 9,
          bottom: 0,
          position: 'absolute',
          color: 'common.white',
        }}
      >
        <Typography variant="caption" component="div" sx={{ mb: 1, opacity: 0.64 }}>
          {fDate(event.createdAt)}
        </Typography>

        <Link
          component={RouterLink}
          href={detailsHref}
          color="inherit"
          variant={eventSmall ? 'subtitle2' : 'h5'}
          sx={(theme) => ({
            ...theme.mixins.maxLine({
              line: 2,
              persistent: eventSmall ? theme.typography.subtitle2 : theme.typography.h5,
            }),
          })}
        >
          {event.title}
        </Link>

        <InfoBlock
          totalViews={event.totalViews}
          totalShares={event.totalShares}
          totalComments={event.totalComments}
          sx={{ opacity: 0.64, color: 'common.white' }}
        />
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------

function InfoBlock({ sx, totalViews, totalShares, totalComments, ...other }) {
  return (
    <Box
      sx={[
        () => ({
          mt: 3,
          gap: 1.5,
          display: 'flex',
          typography: 'caption',
          color: 'text.disabled',
          justifyContent: 'flex-end',
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
        <Iconify width={16} icon="eva:message-circle-fill" />
        {fShortenNumber(totalComments)}
      </Box>

      <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
        <Iconify width={16} icon="solar:eye-bold" />
        {fShortenNumber(totalViews)}
      </Box>

      <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
        <Iconify width={16} icon="solar:share-bold" />
        {fShortenNumber(totalShares)}
      </Box>
    </Box>
  );
}
