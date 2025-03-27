import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { useAuth } from 'src/hooks/use-auth';
import { deleteUserCompletely, updateOrCreateUserData } from 'src/hooks/use-users';

import { fData } from 'src/utils/format-number';

import { toast } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export const UpdateUserSchema = zod.object({
  displayName: zod.string().min(1, { message: 'Name is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  photoURL: zod.union([
    schemaHelper.file({ message: 'Invalid file format' }).optional(),
    zod.string().url().optional(),
    zod.literal(null).optional(),
  ]),
  // Optional fields
  phoneNumber: schemaHelper.phoneNumber({ isValid: isValidPhoneNumber }).optional().nullable(),
  country: zod.string().optional().nullable(),
  address: zod.string().optional().nullable(),
  state: zod.string().optional().nullable(),
  city: zod.string().optional().nullable(),
  zipCode: zod.string().optional().nullable(),
  about: zod.string().optional().nullable(),
  // Not required
  isPublic: zod.boolean(),
});

// ----------------------------------------------------------------------

export function AccountGeneral() {
  const { user, userProfile, userId, loading } = useAuth();
  const confirmDelete = useBoolean();
  const deleteLoading = useBoolean();

  // console.log('AccountGeneral - Chargement en cours:', loading);
  // console.log('AccountGeneral - Utilisateur Firebase:', user);
  // console.log('AccountGeneral - ID Utilisateur:', userId);
  // console.log('AccountGeneral - Profil Utilisateur:', userProfile);
  // console.log('AccountGeneral - Rôle Utilisateur:', role);

  // Mémoriser l'objet currentUser pour éviter de le recréer à chaque rendu
  const currentUser = useMemo(
    () => ({
      id: userId,
      displayName: userProfile?.displayName || user?.displayName || '',
      firstName: userProfile?.firstName || '',
      lastName: userProfile?.lastName || '',
      email: userProfile?.email || user?.email || '',
      photoURL: userProfile?.avatarUrl || user?.photoURL || null,
      phoneNumber: userProfile?.phoneNumber || user?.phoneNumber || '',
      country: userProfile?.country || '',
      address: userProfile?.address || '',
      state: userProfile?.state || '',
      city: userProfile?.city || '',
      zipCode: userProfile?.zipCode || '',
      about: userProfile?.about || '',
      isPublic: userProfile?.isPublic || false,
    }),
    [userId, userProfile, user]
  );

  // Mémoriser les valeurs par défaut pour éviter de les recréer à chaque rendu
  const defaultValues = useMemo(
    () => ({
      displayName: '',
      email: '',
      photoURL: null,
      phoneNumber: '',
      country: '',
      address: '',
      state: '',
      city: '',
      zipCode: '',
      about: '',
      isPublic: false,
    }),
    []
  );

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(UpdateUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;

  // Mettre à jour les valeurs du formulaire quand les données utilisateur sont chargées
  useEffect(() => {
    if (!loading && currentUser) {
      // Mettre à jour chaque champ individuellement
      Object.entries(currentUser).forEach(([field, value]) => {
        // Ne pas mettre à jour l'ID ou les champs non présents dans le formulaire
        if (field !== 'id' && field in defaultValues) {
          setValue(field, value);
        }
      });
      // console.log('Formulaire mis à jour avec les données utilisateur', currentUser);
    }
  }, [loading, currentUser, setValue, defaultValues]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      // console.log('Données soumises:', data);

      // Extract first name and last name from display name if possible
      const nameParts = data.displayName.trim().split(' ');
      const lastName = nameParts.length > 0 ? nameParts[0] : '';
      const firstName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      // Prepare data for update
      const updateData = {
        ...data,
        firstName,
        lastName,
      };

      // Gestion spéciale de l'avatar
      if (data.photoURL instanceof File) {
        updateData.avatarUrl = data.photoURL;
      } else if (typeof data.photoURL === 'string') {
        updateData.avatarUrl = data.photoURL;
      } else if (currentUser.photoURL) {
        updateData.avatarUrl = currentUser.photoURL;
      }

      // console.log('Données pour mise à jour:', { currentUser, updateData });

      // Call the update function
      await updateOrCreateUserData({
        currentUser,
        data: updateData,
      });

      toast.success('Profile updated successfully!');

      // Plus besoin de rafraîchir manuellement car onSnapshot capture les mises à jour
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  });

  const handleDeleteUser = async () => {
    if (!userId) return;

    deleteLoading.onTrue();
    try {
      await deleteUserCompletely(userId);
      toast.success('User deleted successfully');
      reset();
      // Rediriger vers la page de connexion
      window.location.href = '/auth/firebase/sign-in';
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      deleteLoading.onFalse();
      confirmDelete.onFalse();
    }
  };

  const renderConfirmDeleteDialog = () => (
    <ConfirmDialog
      open={confirmDelete.value}
      onClose={confirmDelete.onFalse}
      title="Delete Account"
      content="Are you sure you want to permanently delete your account? This action cannot be undone."
      action={
        <LoadingButton
          variant="contained"
          color="error"
          onClick={handleDeleteUser}
          loading={deleteLoading.value}
        >
          Delete
        </LoadingButton>
      }
    />
  );

  // Afficher une alerte de chargement si les données sont en cours de chargement
  if (loading) {
    return <Alert severity="info">Loading user data...</Alert>;
  }

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              pt: 10,
              pb: 5,
              px: 3,
              textAlign: 'center',
            }}
          >
            <Field.UploadAvatar
              name="photoURL"
              accept="image/*"
              maxSize={3145728}
              helperText={
                <Typography
                  variant="caption"
                  sx={{
                    mt: 3,
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.disabled',
                  }}
                >
                  Allowed *.jpeg, *.jpg, *.png, *.gif
                  <br /> max size of {fData(3145728)}
                </Typography>
              }
            />

            <Field.Switch
              name="isPublic"
              labelPlacement="start"
              label="Public profile"
              sx={{ mt: 5 }}
            />

            <Button variant="soft" color="error" sx={{ mt: 3 }} onClick={confirmDelete.onTrue}>
              Delete account
            </Button>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3 }}>
            <Box
              sx={{
                rowGap: 3,
                columnGap: 2,
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              }}
            >
              <Field.Text name="displayName" label="Name" />
              <Field.Text name="email" label="Email address" />
              <Field.Phone name="phoneNumber" label="Phone number" />
              <Field.Text name="address" label="Address" />

              <Field.CountrySelect name="country" label="Country" placeholder="Choose a country" />

              <Field.Text name="state" label="State/region" />
              <Field.Text name="city" label="City" />
              <Field.Text name="zipCode" label="Zip/code" />
            </Box>

            <Stack spacing={3} sx={{ mt: 3, alignItems: 'flex-end' }}>
              <Field.Text name="about" multiline rows={4} label="About" />

              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Save changes
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {renderConfirmDeleteDialog()}
    </Form>
  );
}
