// Dans user-table-row.jsx
import { useBoolean, usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';

import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/global-config';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

import { UserQuickEditForm } from './user-quick-edit-form';

// ----------------------------------------------------------------------

export function UserTableRow({
  row,
  selected,
  editHref,
  onSelectRow,
  onDeleteRow,
  updateUserRole,
  updateUserStatus,
  manageableRoles = [],
  STATUS_OPTIONS,
  isCurrentUser,
  canManage,
  currentUserRole,
}) {
  const menuActions = usePopover();
  const confirmDialog = useBoolean();
  const quickEditForm = useBoolean();

  const handleRoleChange = async (event) => {
    try {
      const newRole = event.target.value;
      await updateUserRole(newRole);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour du rôle');
    }
  };

  const handleStatusChange = async (event) => {
    try {
      await updateUserStatus(event.target.value);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Une erreur est survenue lors de la mise à jour du statut');
    }
  };

  const getDisplayName = (user) => {
    if (user.displayName) {
      return user.displayName;
    }
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return 'N/A';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'banned':
        return 'error';
      case 'rejected':
        return 'default';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role) => CONFIG.roles[role]?.label || role;

  const renderQuickEditForm = () => (
    <UserQuickEditForm
      currentUser={row}
      open={quickEditForm.value}
      onClose={quickEditForm.onFalse}
    />
  );

  const renderMenuActions = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
      slotProps={{ arrow: { placement: 'right-top' } }}
    >
      <MenuList>
        <li>
          <MenuItem component={RouterLink} href={editHref} onClick={() => menuActions.onClose()}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
        </li>

        <MenuItem
          onClick={() => {
            confirmDialog.onTrue();
            menuActions.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </MenuList>
    </CustomPopover>
  );

  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Delete"
      content="Are you sure want to delete?"
      action={
        <Button variant="contained" color="error" onClick={onDeleteRow}>
          Delete
        </Button>
      }
    />
  );

  // Vérifier si le rôle de l'utilisateur est gérable et sinon, n'afficher que ce rôle
  const filteredRoles = canManage
    ? manageableRoles
    : row.role
      ? [{ value: row.role, label: getRoleLabel(row.role) }]
      : [];

  const filteredStatusOptions = STATUS_OPTIONS.filter((option) => option.value !== 'all');

  return (
    <>
      <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1}>
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onClick={onSelectRow}
            inputProps={{
              id: `${row.id}-checkbox`,
              'aria-label': `${row.id} checkbox`,
            }}
          />
        </TableCell>

        <TableCell>
          <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar alt={getDisplayName(row)} src={row.avatarUrl} />

            <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
              <Link
                component={RouterLink}
                href={editHref}
                color="inherit"
                sx={{ cursor: 'pointer' }}
              >
                {getDisplayName(row)}
              </Link>
              <Box component="span" sx={{ color: 'text.disabled' }}>
                {row.email}
              </Box>
            </Stack>
          </Box>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Typography variant="body2">{row.phoneNumber || 'N/A'}</Typography>
        </TableCell>

        <TableCell>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={row.role || ''}
              onChange={handleRoleChange}
              input={<OutlinedInput />}
              renderValue={(value) => getRoleLabel(value)}
              disabled={!canManage || isCurrentUser}
            >
              {filteredRoles.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </TableCell>

        <TableCell>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={row.status || ''}
              onChange={handleStatusChange}
              input={<OutlinedInput />}
              disabled={!canManage || isCurrentUser}
              renderValue={(value) => (
                <Label
                  variant="soft"
                  color={getStatusColor(value)}
                  sx={{ textTransform: 'capitalize' }}
                >
                  {value}
                </Label>
              )}
            >
              {filteredStatusOptions.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  <Label
                    variant="soft"
                    color={getStatusColor(status.value)}
                    sx={{ textTransform: 'capitalize', mx: 1 }}
                  >
                    {status.label}
                  </Label>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Quick Edit" placement="top" arrow>
              <IconButton
                color={quickEditForm.value ? 'inherit' : 'default'}
                onClick={quickEditForm.onTrue}
              >
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            </Tooltip>

            <IconButton
              color={menuActions.open ? 'inherit' : 'default'}
              onClick={menuActions.onOpen}
            >
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Box>
        </TableCell>
      </TableRow>

      {renderQuickEditForm()}
      {renderMenuActions()}
      {renderConfirmDialog()}
    </>
  );
}
