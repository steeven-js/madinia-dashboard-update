import { useState, useCallback } from 'react';
import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { RouterLink } from 'src/routes/components';

import { deleteEvent } from 'src/hooks/use-event';

import { fDate } from 'src/utils/format-time';
import { fShortenNumber } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Image } from 'src/components/image';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export function EventItemHorizontal({ sx, event, editHref, detailsHref, ...other }) {
  const menuActions = usePopover();
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleDeleteClick = () => {
    setOpenConfirm(true);
    menuActions.onClose();
  };

  const handleCloseConfirm = useCallback(() => {
    setOpenConfirm(false);
  }, []);

  const handleDeleteEvent = useCallback(async () => {
    try {
      await deleteEvent(event.id);
      toast.success('Event deleted successfully');
      // Removal from UI is handled by the subscribeToEventsChanges real-time updates
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    } finally {
      handleCloseConfirm();
    }
  }, [event.id, handleCloseConfirm]);

  // Get a plain text preview from HTML content if description is HTML
  const getTextPreview = (htmlString) => {
    if (!htmlString) return '';
    // Simple HTML tag removal
    return htmlString.replace(/<[^>]*>?/gm, '').substring(0, 120) + '...';
  };

  // Get event status label and color
  const getStatusDetails = (status) => {
    if (!status) return { label: 'draft', color: 'default' };

    switch (status) {
      case 'current':
        return { label: 'published', color: 'info' };
      case 'past':
        return { label: 'archived', color: 'warning' };
      default:
        return { label: status, color: 'default' };
    }
  };

  const statusDetails = getStatusDetails(event.status);

  const renderMenuActions = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
      slotProps={{ arrow: { placement: 'bottom-center' } }}
    >
      <MenuList>
        <li>
          <MenuItem component={RouterLink} href={detailsHref} onClick={() => menuActions.onClose()}>
            <Iconify icon="solar:eye-bold" />
            View
          </MenuItem>
        </li>

        <li>
          <MenuItem component={RouterLink} href={editHref} onClick={() => menuActions.onClose()}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
        </li>

        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </MenuList>
    </CustomPopover>
  );

  return (
    <>
      <Card sx={[{ display: 'flex' }, ...(Array.isArray(sx) ? sx : [sx])]} {...other}>
        <Stack
          spacing={1}
          sx={[
            (theme) => ({
              flexGrow: 1,
              p: theme.spacing(3, 3, 2, 3),
            }),
          ]}
        >
          <Box
            sx={{
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Label variant="soft" color={statusDetails.color}>
              {statusDetails.label}
            </Label>

            <Box component="span" sx={{ typography: 'caption', color: 'text.disabled' }}>
              {event.date && fDate(new Date(event.date))}
            </Box>
          </Box>

          <Stack spacing={1} sx={{ flexGrow: 1 }}>
            <Link
              component={RouterLink}
              href={detailsHref}
              color="inherit"
              variant="subtitle2"
              sx={[
                (theme) => ({
                  ...theme.mixins.maxLine({ line: 2 }),
                }),
              ]}
            >
              {event.title}
            </Link>

            <Typography
              variant="body2"
              sx={[
                (theme) => ({
                  ...theme.mixins.maxLine({ line: 2 }),
                  color: 'text.secondary',
                }),
              ]}
            >
              {getTextPreview(event.description)}
            </Typography>
          </Stack>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color={menuActions.open ? 'inherit' : 'default'}
              onClick={menuActions.onOpen}
            >
              <Iconify icon="eva:more-horizontal-fill" />
            </IconButton>

            <Box
              sx={{
                gap: 1.5,
                flexGrow: 1,
                display: 'flex',
                flexWrap: 'wrap',
                typography: 'caption',
                color: 'text.disabled',
                justifyContent: 'flex-end',
              }}
            >
              <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
                <Iconify icon="eva:people-outline" width={16} />
                {event.participants ? fShortenNumber(event.participants.current || 0) : 0}
              </Box>

              <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
                <Iconify
                  icon={event.isFree ? 'eva:gift-outline' : 'eva:credit-card-outline'}
                  width={16}
                />
                {event.isFree ? 'Free' : `$${event.price || 0}`}
              </Box>

              {event.linkedin && (
                <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
                  <Iconify icon="ri:linkedin-fill" width={16} />
                  <Link href={event.linkedin} target="_blank" sx={{ color: 'inherit' }}>
                    LinkedIn
                  </Link>
                </Box>
              )}
            </Box>
          </Box>
        </Stack>

        <Box
          sx={{
            p: 1,
            width: 180,
            height: 240,
            flexShrink: 0,
            position: 'relative',
            display: { xs: 'none', sm: 'block' },
          }}
        >
          <Image alt={event.title} src={event.image} sx={{ height: 1, borderRadius: 1.5 }} />
        </Box>
      </Card>

      {renderMenuActions()}

      <Dialog open={openConfirm} onClose={handleCloseConfirm}>
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Are you sure you want to delete this event?</Typography>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={handleCloseConfirm}>
            Cancel
          </Button>
          <Button onClick={handleDeleteEvent} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
