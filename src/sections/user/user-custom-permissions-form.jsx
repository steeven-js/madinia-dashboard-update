import { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import OutlinedInput from '@mui/material/OutlinedInput';

import { useAuth } from 'src/hooks/use-auth';
import { updateUserCustomPermissions } from 'src/hooks/use-users';

import { useRolePermission } from 'src/auth/context/role-permission-context';

// ----------------------------------------------------------------------

export function UserCustomPermissionsForm({
  userId,
  currentPermissions = [],
  open,
  onClose,
  onSuccess,
}) {
  const { role: currentUserRole } = useAuth();
  const { permissions } = useRolePermission();

  const [selectedPermissions, setSelectedPermissions] = useState(currentPermissions || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isSuperAdmin = currentUserRole === 'super_admin';
  const isAdmin = currentUserRole === 'admin' || isSuperAdmin;

  // Liste des codes de permission disponibles
  const availablePermissions = permissions.map((p) => p.code);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      await updateUserCustomPermissions(userId, selectedPermissions);

      if (onSuccess) {
        onSuccess(selectedPermissions);
      }

      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Gérer les permissions personnalisées</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2, mt: 2 }}>
            {error}
          </Alert>
        )}

        {!isAdmin && (
          <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
            Seuls les administrateurs peuvent gérer les permissions personnalisées.
          </Alert>
        )}

        <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
          Les permissions personnalisées sont attribuées directement à l&apos;utilisateur et
          s&apos;ajoutent à celles de son rôle.
        </Typography>

        <FormControl fullWidth disabled={!isAdmin}>
          <InputLabel id="custom-permissions-label">Permissions personnalisées</InputLabel>
          <Select
            labelId="custom-permissions-label"
            multiple
            value={selectedPermissions}
            onChange={(e) => setSelectedPermissions(e.target.value)}
            input={<OutlinedInput label="Permissions personnalisées" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 48 * 4.5 + 8,
                  width: 250,
                },
              },
            }}
          >
            {availablePermissions.map((permission) => (
              <MenuItem key={permission} value={permission}>
                {permission === 'all' ? 'Toutes les permissions' : permission}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedPermissions.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
            {selectedPermissions.map((permission) => (
              <Chip
                key={permission}
                label={permission}
                color="primary"
                variant="outlined"
                onDelete={
                  isAdmin
                    ? () => {
                        setSelectedPermissions((prev) => prev.filter((p) => p !== permission));
                      }
                    : undefined
                }
              />
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <LoadingButton
          onClick={handleSubmit}
          loading={loading}
          disabled={!isAdmin}
          variant="contained"
        >
          Enregistrer
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

UserCustomPermissionsForm.propTypes = {
  userId: PropTypes.string.isRequired,
  currentPermissions: PropTypes.arrayOf(PropTypes.string),
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};
