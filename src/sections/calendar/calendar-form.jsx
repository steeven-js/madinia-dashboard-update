import { z as zod } from 'zod';
import { useMemo, useCallback } from 'react';
import { uuidv4 } from 'minimal-shared/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogActions from '@mui/material/DialogActions';

import { useAuth } from 'src/hooks/use-auth';

import { fIsAfter } from 'src/utils/format-time';

import { createEvent, updateEvent, deleteEvent } from 'src/actions/calendar';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Form, Field } from 'src/components/hook-form';
import { ColorPicker } from 'src/components/color-utils';

// ----------------------------------------------------------------------

export const EventSchema = zod.object({
  title: zod
    .string()
    .min(1, { message: 'Title is required!' })
    .max(100, { message: 'Title must be less than 100 characters' }),
  description: zod
    .string()
    .min(1, { message: 'Description is required!' })
    .min(50, { message: 'Description must be at least 50 characters' }),
  // Not required
  color: zod.string(),
  allDay: zod.boolean(),
  start: zod.union([zod.string(), zod.number()]),
  end: zod.union([zod.string(), zod.number()]),
});

// ----------------------------------------------------------------------

export function CalendarForm({ currentEvent, colorOptions, onClose }) {
  const { userProfile: currentAuthUser } = useAuth();

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(EventSchema),
    defaultValues: currentEvent,
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const dateError = fIsAfter(values.start, values.end);

  // Check if user can modify the event (creator or super_admin)
  const canModifyEvent = useMemo(() => {
    if (!currentAuthUser) return false;

    // Cas d'un nouvel événement - toujours autorisé
    if (!currentEvent?.id) return true;

    // Déterminer l'ID de l'utilisateur courant pour la comparaison
    const currentUserId = currentAuthUser.userId || currentAuthUser.uid || currentAuthUser.id || '';

    // Vérifier si l'utilisateur est super_admin ou le créateur
    return currentAuthUser?.role === 'super_admin' || currentEvent?.userId === currentUserId;
  }, [currentEvent, currentAuthUser]);

  const onSubmit = handleSubmit(async (data) => {
    // If not the creator or super_admin, show error
    if (!canModifyEvent) {
      toast.error('Unauthorized: You do not have permission to modify this event');
      return;
    }

    const eventData = {
      id: currentEvent?.id ? currentEvent?.id : uuidv4(),
      color: data?.color,
      title: data?.title,
      allDay: data?.allDay,
      description: data?.description,
      end: data?.end,
      start: data?.start,
    };

    try {
      if (!dateError) {
        if (currentEvent?.id) {
          await updateEvent(eventData, currentAuthUser);
          toast.success('Update success!');
        } else {
          await createEvent(eventData, currentAuthUser);
          toast.success('Create success!');
        }
        onClose();
        reset();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'There was an error processing your request');
    }
  });

  const onDelete = useCallback(async () => {
    // If not the creator or super_admin, show error
    if (!canModifyEvent) {
      toast.error('Unauthorized: You do not have permission to delete this event');
      return;
    }

    try {
      await deleteEvent(`${currentEvent?.id}`, currentAuthUser);
      toast.success('Delete success!');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'There was an error deleting the event');
    }
  }, [currentEvent?.id, onClose, currentAuthUser, canModifyEvent]);

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Scrollbar sx={{ p: 3, bgcolor: 'background.neutral' }}>
        <Stack spacing={3}>
          <Field.Text name="title" label="Title" />

          <Field.Text name="description" label="Description" multiline rows={3} />

          {currentEvent?.id && (
            <Box
              sx={{
                py: 1,
                px: 2,
                borderRadius: 1,
                bgcolor: 'background.paper',
                boxShadow: (theme) => theme.vars.shadows[2],
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Created by:
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  component="img"
                  src={currentEvent?.photoURL || ''}
                  alt={currentEvent?.userDisplayName || ''}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: (theme) => `solid 1px ${theme.palette.divider}`,
                  }}
                />
                <Box>
                  <Typography variant="subtitle2">
                    {currentEvent?.userDisplayName || 'Anonymous'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {currentEvent?.userEmail || ''}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}

          <Field.Switch name="allDay" label="All day" />

          <Field.MobileDateTimePicker name="start" label="Start date" />

          <Field.MobileDateTimePicker
            name="end"
            label="End date"
            slotProps={{
              textField: {
                error: dateError,
                helperText: dateError ? 'End date must be later than start date' : null,
              },
            }}
          />

          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <ColorPicker
                value={field.value}
                onChange={(color) => field.onChange(color)}
                options={colorOptions}
              />
            )}
          />
        </Stack>
      </Scrollbar>

      <DialogActions sx={{ flexShrink: 0 }}>
        {!!currentEvent?.id && (
          <Tooltip
            title={
              !canModifyEvent ? "You don't have permission to delete this event" : 'Delete event'
            }
          >
            <span>
              <IconButton onClick={onDelete} disabled={!canModifyEvent}>
                <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            </span>
          </Tooltip>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancel
        </Button>

        <LoadingButton
          type="submit"
          variant="contained"
          loading={isSubmitting}
          disabled={dateError || !canModifyEvent}
        >
          Save changes
        </LoadingButton>
      </DialogActions>
    </Form>
  );
}
