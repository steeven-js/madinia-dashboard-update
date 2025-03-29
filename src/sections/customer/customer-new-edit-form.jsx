import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { addCustomer, updateCustomer, deleteCustomer } from 'src/hooks/use-customer';

import { fData } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export const NewCustomerSchema = zod.object({
  avatarUrl: schemaHelper.file({ message: 'Avatar est requis!' }),
  name: zod.string().min(1, { message: 'Nom est requis!' }),
  email: zod
    .string()
    .min(1, { message: 'Email est requis!' })
    .email({ message: 'Email doit être une adresse email valide!' }),
  phoneNumber: schemaHelper.phoneNumber({ isValid: isValidPhoneNumber }),
  country: schemaHelper.nullableInput(zod.string().min(1, { message: 'Pays est requis!' }), {
    // message for null value
    message: 'Pays est requis!',
  }),
  address: zod.string().min(1, { message: 'Adresse est requise!' }),
  company: zod.string().min(1, { message: 'Entreprise est requise!' }),
  state: zod.string().min(1, { message: 'Etat est requis!' }),
  city: zod.string().min(1, { message: 'Ville est requise!' }),
  role: zod.string().min(1, { message: 'Rôle est requis!' }),
  zipCode: zod.string().min(1, { message: 'Code postal est requis!' }),
  // Not required
  status: zod.string(),
  isVerified: zod.boolean(),
});

// ----------------------------------------------------------------------

export function CustomerNewEditForm({ currentUser }) {
  const router = useRouter();

  const defaultValues = {
    status: '',
    avatarUrl: null,
    isVerified: true,
    name: '',
    email: '',
    phoneNumber: '',
    country: '',
    state: '',
    city: '',
    address: '',
    zipCode: '',
    company: '',
    role: '',
  };

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(NewCustomerSchema),
    defaultValues,
    values: currentUser,
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Traitement de l'avatar si c'est un File
      let processedData = { ...data };

      if (data.avatarUrl instanceof File) {
        // Pour simplifier, on ne gère pas ici l'upload de fichier
        // qui nécessiterait d'utiliser Firebase Storage
        // Dans un cas réel, vous devriez implémenter cette partie
        console.warn("Upload d'avatar non implémenté dans cet exemple");
        processedData.avatarUrl = null;
      }

      if (currentUser) {
        // Mise à jour d'un client existant
        await updateCustomer(currentUser.id, processedData);
      } else {
        // Création d'un nouveau client
        await addCustomer(processedData);
      }

      reset();
      toast.success(currentUser ? 'Mise à jour réussie!' : 'Création réussie!');
      router.push(paths.dashboard.customer.list);
    } catch (error) {
      console.error(error);
      toast.error(currentUser ? 'Erreur lors de la mise à jour' : 'Erreur lors de la création');
    }
  });

  const handleDelete = async () => {
    try {
      if (!currentUser?.id) return;

      await deleteCustomer(currentUser.id);
      toast.success('Client supprimé avec succès');
      router.push(paths.dashboard.customer.list);
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ pt: 10, pb: 5, px: 3 }}>
            {currentUser && (
              <Label
                color={
                  (values.status === 'active' && 'success') ||
                  (values.status === 'banned' && 'error') ||
                  'warning'
                }
                sx={{ position: 'absolute', top: 24, right: 24 }}
              >
                {values.status}
              </Label>
            )}

            <Box sx={{ mb: 5 }}>
              <Field.UploadAvatar
                name="avatarUrl"
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
            </Box>

            {currentUser && (
              <FormControlLabel
                labelPlacement="start"
                control={
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        {...field}
                        checked={field.value !== 'active'}
                        onChange={(event) =>
                          field.onChange(event.target.checked ? 'banned' : 'active')
                        }
                      />
                    )}
                  />
                }
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Banned
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Apply disable account
                    </Typography>
                  </>
                }
                sx={{
                  mx: 0,
                  mb: 3,
                  width: 1,
                  justifyContent: 'space-between',
                }}
              />
            )}

            <Field.Switch
              name="isVerified"
              labelPlacement="start"
              label={
                <>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Email vérifié
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Désactiver ceci enverra automatiquement un email de vérification au client
                  </Typography>
                </>
              }
              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            />

            {currentUser && (
              <Stack sx={{ mt: 3, alignItems: 'center', justifyContent: 'center' }}>
                <Button variant="soft" color="error" onClick={handleDelete}>
                  Supprimer le client
                </Button>
              </Stack>
            )}
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
              <Field.Text name="name" label="Full name" />
              <Field.Text name="email" label="Email address" />
              <Field.Phone
                name="phoneNumber"
                label="Phone number"
                country={!currentUser ? 'DE' : undefined}
              />

              <Field.CountrySelect
                fullWidth
                name="country"
                label="Country"
                placeholder="Choose a country"
              />

              <Field.Text name="state" label="State/region" />
              <Field.Text name="city" label="City" />
              <Field.Text name="address" label="Address" />
              <Field.Text name="zipCode" label="Zip/code" />
              <Field.Text name="company" label="Company" />
              <Field.Text name="role" label="Role" />
            </Box>

            <Stack sx={{ mt: 3, alignItems: 'flex-end' }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentUser ? 'Créer un client' : 'Enregistrer les modifications'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
