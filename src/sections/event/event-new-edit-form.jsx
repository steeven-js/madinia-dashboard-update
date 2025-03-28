import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useEffect, useCallback } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { MenuItem, InputAdornment } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { addEvent, updateEvent } from 'src/hooks/use-event';

import { FIREBASE_STORAGE } from 'src/lib/firebase';
import { TwitterIcon, FacebookIcon, LinkedinIcon, InstagramIcon } from 'src/assets/icons';

import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export const NewEventSchema = zod.object({
  title: zod.string().optional(),
  status: zod.string().optional(),
  date: schemaHelper.date().optional(),
  isScheduledDate: zod.boolean().optional(),
  scheduledDate: schemaHelper.date().optional().nullable(),
  price: zod.number().optional(),
  description: zod.string().optional(),
  image: schemaHelper.file().optional(),
  isFree: zod.boolean().optional(),
  facebook: zod.string().optional().nullable(),
  instagram: zod.string().optional().nullable(),
  linkedin: zod.string().optional().nullable(),
  twitter: zod.string().optional().nullable(),
  externalLinks: zod
    .array(
      zod.object({
        label: zod.string(),
        url: zod.string().url("L'URL doit être valide"),
      })
    )
    .optional()
    .default([]),
  participants: zod
    .object({
      max: zod.number().optional(),
      current: zod.number().optional(),
    })
    .optional(),
});

// ----------------------------------------------------------------------

export function EventNewEditForm({ currentEvent }) {
  const router = useRouter();

  const showPreview = useBoolean();

  const defaultValues = useMemo(
    () => ({
      title: currentEvent?.title || '',
      status: currentEvent?.status || 'draft',
      date: currentEvent?.date || null,
      scheduledDate: currentEvent?.scheduledDate || null,
      isFree: currentEvent?.isFree ?? false,
      price: currentEvent?.price || 0,
      description: currentEvent?.description || '',
      image: currentEvent?.image || '',
      stripeEventId: currentEvent?.stripeEventId || '',
      facebook: currentEvent?.facebook || '',
      instagram: currentEvent?.instagram || '',
      linkedin: currentEvent?.linkedin || '',
      twitter: currentEvent?.twitter || '',
      externalLinks: currentEvent?.externalLinks || [],
      participants: {
        max: currentEvent?.participants?.max || 10,
        current: currentEvent?.participants?.current || 0,
      },
      isScheduledDate: currentEvent?.isScheduledDate || false,
      isActive: currentEvent?.isActive || false,
    }),
    [currentEvent]
  );

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(NewEventSchema),
    defaultValues,
    values: currentEvent,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Add createdAt if it's a new event
      if (!currentEvent) {
        data.createdAt = new Date().toISOString();
      }

      // Handle publish status from switch
      const publishSwitch = document.getElementById('publish-switch');
      data.publish = publishSwitch && publishSwitch.checked ? 'published' : 'draft';

      // Handle comments from switch
      const commentsSwitch = document.getElementById('comments-switch');
      data.enableComments = commentsSwitch && commentsSwitch.checked;

      if (currentEvent?.id) {
        // Update existing event
        await updateEvent(currentEvent.id, data);
        toast.success('Event updated successfully!');
      } else {
        // Create new event
        await addEvent(data);
        toast.success('Event created successfully!');
      }

      reset();
      showPreview.onFalse();
      router.push(paths.dashboard.event.root);
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event. Please try again.');
    }
  });

  // Reset form when currentEvent changes
  useEffect(() => {
    if (currentEvent) {
      reset({
        title: currentEvent?.title || '',
        status: currentEvent?.status || 'draft',
        date: currentEvent?.date || null,
        scheduledDate: currentEvent?.scheduledDate || null,
        isFree: currentEvent?.isFree ?? false,
        price: currentEvent?.price || 0,
        description: currentEvent?.description || '',
        image: currentEvent?.image || '',
        stripeEventId: currentEvent?.stripeEventId || '',
        facebook: currentEvent?.facebook || '',
        instagram: currentEvent?.instagram || '',
        linkedin: currentEvent?.linkedin || '',
        twitter: currentEvent?.twitter || '',
        externalLinks: currentEvent?.externalLinks || [],
        participants: {
          max: currentEvent?.participants?.max || 10,
          current: currentEvent?.participants?.current || 0,
        },
        isScheduledDate: currentEvent?.isScheduledDate || false,
        isActive: currentEvent?.isActive || false,
      });
    }
  }, [currentEvent, reset]);

  // Combined date synchronization logic
  useEffect(() => {
    if (!values.isScheduledDate) {
      // When isScheduledDate is false, always sync scheduledDate with date
      if (values.date !== values.scheduledDate) {
        setValue('scheduledDate', values.date);
      }
    } else if (!values.scheduledDate) {
      // When isScheduledDate is true and scheduledDate is not set, initialize it with date
      setValue('scheduledDate', values.date);
    }
  }, [values.isScheduledDate, values.date, values.scheduledDate, setValue]);

  const handleDateChange = useCallback(
    (newDate) => {
      setValue('date', newDate);
      if (!values.isScheduledDate) {
        setValue('scheduledDate', newDate);
      }
    },
    [setValue, values.isScheduledDate]
  );

  const handleScheduledToggle = useCallback(
    (e) => {
      const { checked } = e.target;
      setValue('isScheduledDate', checked);
      if (!checked) {
        setValue('scheduledDate', values.date);
      }
    },
    [setValue, values.date]
  );

  const handleRemoveFile = useCallback(() => {
    setValue('image', null);
  }, [setValue]);

  const handleOneUpload = async (acceptedFile) => {
    try {
      const file = Array.isArray(acceptedFile) ? acceptedFile[0] : acceptedFile;
      const fileName = `events/${currentEvent?.id || Date.now()}/${Date.now()}_${file.name}`;
      const storageRef = ref(FIREBASE_STORAGE, fileName);

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      setValue('image', url);
      toast.success('Image uploadée avec succès!');
      return url;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Échec de l'upload de l'image");
      throw error;
    }
  };

  const renderDetails = (
    <Card>
      <CardHeader title="Détails" subheader="Titre, description courte, image..." sx={{ mb: 3 }} />
      <Divider />
      <Stack spacing={3} sx={{ p: 3 }}>
        <Field.Text name="title" label="Titre de l'événement" />
        <Field.MobileDateTimePicker
          name="date"
          label="Date de l'événement"
          onChange={handleDateChange}
        />
        <Field.Switch
          name="isScheduledDate"
          label="Date Programmée"
          onChange={handleScheduledToggle}
        />
        {values.isScheduledDate && (
          <Field.MobileDateTimePicker name="scheduledDate" label="Date programmée" />
        )}
        <Field.Select fullWidth name="status" label="Statut">
          {[
            { value: 'draft', label: 'Brouillon' },
            { value: 'pending', label: 'Programmé' },
            { value: 'current', label: 'En cours' },
            { value: 'past', label: 'Terminé' },
            { value: 'cancelled', label: 'Annulé' },
          ].map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Field.Select>
        <Field.Editor name="description" label="Description" multiline rows={4} />
        <Stack spacing={1.5}>
          <Typography variant="subtitle2">Image Principale</Typography>
          <Field.Upload
            single
            name="image"
            maxSize={3145728}
            onDrop={handleOneUpload}
            onDelete={handleRemoveFile}
            helperText="Format accepté : image uniquement. Taille maximale : 3MB"
            file={
              values.image
                ? {
                    preview: values.image,
                    url: values.image,
                    type: 'image/*',
                  }
                : null
            }
            accept={{
              'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
            }}
          />
        </Stack>
      </Stack>
    </Card>
  );

  const renderSocialLink = (
    <Card>
      <CardHeader
        title="Liens Sociaux"
        subheader="Liens vers les réseaux sociaux de l'événement"
        sx={{ mb: 3 }}
      />
      <Divider />
      <Stack spacing={3} sx={{ p: 3 }}>
        {['facebook', 'instagram', 'linkedin', 'twitter'].map((social) => (
          <Field.Text
            key={social}
            name={social}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {social === 'facebook' && <FacebookIcon width={24} />}
                  {social === 'instagram' && <InstagramIcon width={24} />}
                  {social === 'linkedin' && <LinkedinIcon width={24} />}
                  {social === 'twitter' && (
                    <TwitterIcon width={24} sx={{ color: 'text.primary' }} />
                  )}
                </InputAdornment>
              ),
            }}
          />
        ))}
      </Stack>
    </Card>
  );

  const renderExternalLinks = (
    <Card>
      <CardHeader
        title="Liens Externes"
        subheader="Ajoutez des liens vers des ressources externes"
        sx={{ mb: 3 }}
      />
      <Divider />
      <Stack spacing={3} sx={{ p: 3 }}>
        {values.externalLinks.map((_, index) => (
          <Stack key={index} direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Field.Text
              name={`externalLinks.${index}.label`}
              label="Libellé"
              placeholder="Ex: Site web, Billetterie..."
            />
            <Field.Text
              name={`externalLinks.${index}.url`}
              label="URL"
              placeholder="https://"
              fullWidth
            />
            <LoadingButton
              variant="outlined"
              color="error"
              onClick={() => {
                const newLinks = [...values.externalLinks];
                newLinks.splice(index, 1);
                setValue('externalLinks', newLinks);
              }}
            >
              Supprimer
            </LoadingButton>
          </Stack>
        ))}
        <LoadingButton
          variant="contained"
          onClick={() => {
            setValue('externalLinks', [...values.externalLinks, { label: '', url: '' }]);
          }}
        >
          Ajouter un lien
        </LoadingButton>
      </Stack>
    </Card>
  );

  const renderPricing = (
    <Card>
      <CardHeader title="Tarification" subheader="Informations sur les prix" sx={{ mb: 3 }} />
      <Divider />
      <Stack spacing={3} sx={{ p: 3 }}>
        <Field.Text
          name="participants.max"
          label="Nombre maximum de participants"
          type="number"
          InputProps={{
            inputProps: { min: 1 },
          }}
        />
        <Field.Switch name="isFree" label="Événement gratuit" />
        {!values.isFree && (
          <Field.Text
            name="price"
            label="Prix régulier"
            placeholder="0.00"
            type="number"
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Box component="span" sx={{ color: 'text.disabled' }}>
                    €
                  </Box>
                </InputAdornment>
              ),
            }}
          />
        )}
      </Stack>
    </Card>
  );

  const renderActions = (
    <Stack spacing={3} direction="row" alignItems="center" flexWrap="wrap">
      <LoadingButton type="submit" variant="contained" loading={isSubmitting} sx={{ ml: 'auto' }}>
        {!currentEvent ? 'Create event' : 'Save changes'}
      </LoadingButton>
    </Stack>
  );

  return (
    <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={{ xs: 3, md: 5 }} sx={{ mx: 'auto', maxWidth: { xs: 720, xl: 880 } }}>
        {renderDetails}
        {renderSocialLink}
        {renderExternalLinks}
        {renderPricing}
        {renderActions}
      </Stack>
    </Form>
  );
}
