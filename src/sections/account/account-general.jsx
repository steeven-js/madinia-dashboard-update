import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { fData } from 'src/utils/format-number';
import { paths } from 'src/routes/paths';

import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

import { useAuth } from 'src/hooks/use-auth';
import { updateOrCreateUserData } from 'src/hooks/use-users';

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
  const { user, userProfile } = useAuth();

  // Log des valeurs récupérées depuis Firebase Auth
  // console.log('Firebase Auth user:', {
  //   uid: user?.uid,
  //   displayName: user?.displayName,
  //   photoURL: user?.photoURL,
  //   email: user?.email,
  //   phoneNumber: user?.phoneNumber,
  // });

  // Log des valeurs du profil Firestore
  // console.log('Firestore userProfile:', userProfile);

  const currentUser = {
    id: user?.uid,
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
  };

  // Log du currentUser construit
  // console.log('Current user constructed:', currentUser);

  const defaultValues = {
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
  };

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(UpdateUserSchema),
    defaultValues: {
      ...defaultValues,
      ...currentUser,
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      // console.log('Form data submitted:', data);
      // console.log('photoURL type:', typeof data.photoURL, data.photoURL instanceof File);

      // if (data.photoURL) {
      //   if (data.photoURL instanceof File) {
      //     console.log('photoURL is a File object:', data.photoURL.name, data.photoURL.size);
      //   } else if (typeof data.photoURL === 'string') {
      //     console.log('photoURL is a string URL:', data.photoURL);
      //   } else {
      //     console.log('photoURL is another type:', Object.prototype.toString.call(data.photoURL));
      //   }
      // } else {
      //   console.log('photoURL is null or undefined');
      // }

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
      // Si photoURL est un objet File, utilisez-le comme avatarUrl
      // Sinon, utilisez l'avatar existant
      if (data.photoURL instanceof File) {
        updateData.avatarUrl = data.photoURL;
        // console.log('Using new File for avatarUrl');
      } else if (typeof data.photoURL === 'string') {
        updateData.avatarUrl = data.photoURL;
        // console.log('Using string URL for avatarUrl:', data.photoURL);
      } else if (currentUser.photoURL) {
        updateData.avatarUrl = currentUser.photoURL;
        // console.log('Using existing photoURL for avatarUrl:', currentUser.photoURL);
      } else {
        // console.log('No avatarUrl set');
      }

      // console.log('Data being sent to updateOrCreateUserData:', { currentUser, updateData });

      // Call the update function
      await updateOrCreateUserData({
        currentUser,
        data: updateData,
      });

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  });

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

            <Button variant="soft" color="error" sx={{ mt: 3 }}>
              Delete user
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
    </Form>
  );
}
