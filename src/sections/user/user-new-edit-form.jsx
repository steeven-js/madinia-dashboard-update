import { z as zod } from 'zod';
import { useBoolean } from 'minimal-shared/hooks';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/hooks/use-auth';
import {
  updateUserRole,
  deleteUserCompletely,
  updateOrCreateUserData,
  updateUserCustomPermissions,
} from 'src/hooks/use-users';

import { fData } from 'src/utils/format-number';

import { CONFIG } from 'src/global-config';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

import { useRolePermission } from 'src/auth/context/role-permission-context';

// ----------------------------------------------------------------------

export const NewUserSchema = zod.object({
  avatarUrl: zod.union([
    schemaHelper.file({ message: { required_error: 'Invalid file format' } }).optional(),
    zod.string().url().optional(),
    zod.literal(null).optional(),
    zod.undefined(),
  ]),
  displayName: zod.string().optional(),
  email: zod.string().email({ message: 'Email must be a valid email address!' }).optional(),
  phoneNumber: schemaHelper.phoneNumber({ isValid: isValidPhoneNumber }).optional().nullable(),
  country: zod.any().optional().nullable(),
  address: zod.string().optional().nullable(),
  company: zod.string().optional().nullable(),
  state: zod.string().optional().nullable(),
  city: zod.string().optional().nullable(),
  role: zod.string().optional().nullable(),
  zipCode: zod.string().optional().nullable(),
  about: zod.string().optional().nullable(),
  isPublic: zod.boolean().optional().nullable(),
  // Not required fields (unchanged)
  status: zod.string().optional().default('active'),
  isVerified: zod.boolean().optional().default(false),
  isBanned: zod.boolean().optional().default(false),
});

// ----------------------------------------------------------------------

export function UserNewEditForm({ currentUser }) {
  const router = useRouter();
  const { role: currentUserRole } = useAuth();
  const { permissions } = useRolePermission();
  const confirmDelete = useBoolean();
  const deleteLoading = useBoolean();
  const [customPermissions, setCustomPermissions] = useState([]);
  const [savingPermissions, setSavingPermissions] = useState(false);

  const isSuperAdmin = currentUserRole === 'super_admin';
  const isAdmin = currentUserRole === 'admin' || isSuperAdmin;

  const defaultValues = useMemo(
    () => ({
      status: currentUser?.status ?? '',
      avatarUrl: currentUser?.avatarUrl || null,
      isVerified: currentUser?.isVerified ?? false,
      isBanned: currentUser?.isBanned ?? false,
      displayName: currentUser?.displayName ?? '',
      email: currentUser?.email ?? '',
      phoneNumber: currentUser?.phoneNumber ?? '',
      country: currentUser?.country ?? null,
      state: currentUser?.state ?? '',
      city: currentUser?.city ?? '',
      address: currentUser?.address ?? '',
      zipCode: currentUser?.zipCode ?? '',
      company: currentUser?.company ?? '',
      role: currentUser?.role ?? '',
    }),
    [currentUser]
  );

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(NewUserSchema),
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

  useEffect(() => {
    if (currentUser?.customPermissions) {
      setCustomPermissions(currentUser.customPermissions);
    }
  }, [currentUser]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log('Form data to submit:', data);

      if (currentUser) {
        // Check if role has changed
        const roleChanged = currentUser.role !== data.role && data.role;

        // Update user profile data
        await updateOrCreateUserData({
          currentUser,
          data,
        });

        // If role has changed, update role separately to handle claims
        if (roleChanged && isAdmin) {
          await updateUserRole(currentUser.id, data.role);
        }
      } else {
        // Create user - Implement this with your API
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      reset();
      toast.success(currentUser ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.user.list);
      console.info('DATA', data);
    } catch (error) {
      console.error('Error during form submission:', error);
      toast.error('Failed to save user data');
    }
  });

  const handleDeleteUser = async () => {
    if (!currentUser?.id) return;

    deleteLoading.onTrue();
    try {
      await deleteUserCompletely(currentUser.id);
      toast.success('User deleted successfully');
      router.push(paths.dashboard.user.list);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      deleteLoading.onFalse();
      confirmDelete.onFalse();
    }
  };

  const handleUpdateCustomPermissions = async () => {
    if (!currentUser?.id) return;

    setSavingPermissions(true);
    try {
      await updateUserCustomPermissions(currentUser.id, customPermissions);
      toast.success('Permissions personnalisées mises à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des permissions :', error);
      toast.error('Échec de la mise à jour des permissions');
    } finally {
      setSavingPermissions(false);
    }
  };

  const renderConfirmDeleteDialog = () => (
    <ConfirmDialog
      open={confirmDelete.value}
      onClose={confirmDelete.onFalse}
      title="Delete User"
      content="Are you sure you want to permanently delete this user? This action cannot be undone."
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

  // Liste des codes de permission disponibles
  const availablePermissions = permissions?.map((p) => p.code) || [];

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
                    Email verified
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Disabling this will automatically send the user a verification email
                  </Typography>
                </>
              }
              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            />

            {currentUser && isSuperAdmin && (
              <Stack sx={{ mt: 3, alignItems: 'center', justifyContent: 'center' }}>
                <Button variant="soft" color="error" onClick={confirmDelete.onTrue}>
                  Delete user
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
              <Field.Text name="displayName" label="Full name" />
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

              <FormControl fullWidth>
                <InputLabel id="role-select-label">Role</InputLabel>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="role-select-label"
                      label="Role"
                      disabled={!isSuperAdmin}
                    >
                      {Object.entries(CONFIG.roles).map(([roleKey, roleData]) => (
                        <MenuItem key={roleKey} value={roleKey}>
                          {roleKey === 'super_admin' ? 'Super Administrateur' : roleData.label}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Box>

            {currentUser && isAdmin && (
              <Box sx={{ mt: 3, pt: 3, borderTop: '1px dashed rgba(145, 158, 171, 0.2)' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Permissions personnalisées
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                  Ces permissions s&apos;ajoutent à celles du rôle de l&apos;utilisateur
                </Typography>

                <FormControl fullWidth>
                  <InputLabel id="custom-permissions-label">Permissions personnalisées</InputLabel>
                  <Select
                    labelId="custom-permissions-label"
                    multiple
                    value={customPermissions}
                    onChange={(e) => setCustomPermissions(e.target.value)}
                    input={<OutlinedInput label="Permissions personnalisées" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                  >
                    {availablePermissions.map((permission) => (
                      <MenuItem key={permission} value={permission}>
                        {permission === 'all' ? 'Toutes les permissions' : permission}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
                  <LoadingButton
                    variant="contained"
                    color="primary"
                    onClick={handleUpdateCustomPermissions}
                    loading={savingPermissions}
                  >
                    Enregistrer les permissions
                  </LoadingButton>
                </Stack>
              </Box>
            )}

            <Stack sx={{ mt: 3, alignItems: 'flex-end' }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentUser ? 'Create user' : 'Save changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {renderConfirmDeleteDialog()}
    </Form>
  );
}
