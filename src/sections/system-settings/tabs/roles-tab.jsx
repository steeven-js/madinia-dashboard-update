import { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import OutlinedInput from '@mui/material/OutlinedInput';
import TableContainer from '@mui/material/TableContainer';

import { useAuth } from 'src/hooks/use-auth';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { useRolePermission } from 'src/auth/context/role-permission-context';

import { RoleTableRow } from '../role-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Nom du Rôle', align: 'left' },
  { id: 'label', label: 'Libellé', align: 'left' },
  { id: 'level', label: 'Niveau', align: 'center' },
  { id: 'permissions', label: 'Permissions', align: 'left' },
  { id: '', label: 'Actions', align: 'right' },
];

// ----------------------------------------------------------------------

export function RolesTab() {
  const { roles, permissions, createRole, updateRolePermissions, deleteRole } = useRolePermission();
  const { role: currentUserRole } = useAuth();

  // Convertir les rôles en tableau pour l'affichage
  const ROLES = useMemo(() => {
    const rolesArray = [];
    Object.entries(roles).forEach(([key, value]) => {
      rolesArray.push({
        id: key,
        ...value,
      });
    });
    return rolesArray;
  }, [roles]);

  // Liste des permissions disponibles pour les sélecteurs
  const availablePermissions = useMemo(() => permissions.map((p) => p.code), [permissions]);

  const table = useTable({
    defaultOrderBy: 'level',
    defaultOrder: 'desc',
  });

  const [tableData, setTableData] = useState([]);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Synchroniser tableData avec ROLES
  useEffect(() => {
    setTableData(ROLES);
  }, [ROLES]);

  const handleDeleteRow = async (id) => {
    try {
      setLoading(true);
      await deleteRole(id);
      toast.success('Rôle supprimé avec succès!');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditDialog = (role) => {
    setSelectedRole(role);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedRole(null);
    setError(null);
  };

  const handleUpdateRole = async () => {
    if (!selectedRole) return;

    try {
      setLoading(true);
      setError(null);

      if (selectedRole.id) {
        // Mise à jour d'un rôle existant
        await updateRolePermissions(selectedRole.id, selectedRole.permissions);
        toast.success('Rôle mis à jour avec succès!');
      } else {
        // Création d'un nouveau rôle
        await createRole({
          id: selectedRole.name,
          name: selectedRole.name,
          label: selectedRole.label,
          level: selectedRole.level,
          permissions: selectedRole.permissions,
        });
        toast.success('Rôle créé avec succès!');
      }

      handleCloseEditDialog();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewRole = () => {
    setSelectedRole({
      id: '',
      name: '',
      label: '',
      level: 1,
      permissions: ['view_content'],
    });
    setOpenEditDialog(true);
  };

  const isSuperAdmin = currentUserRole === 'super_admin';

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
        <Typography variant="h5">Gestion des Rôles Utilisateurs</Typography>
        {isSuperAdmin && (
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleCreateNewRole}
          >
            Nouveau Rôle
          </Button>
        )}
      </Stack>

      {!isSuperAdmin && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Seul un super administrateur peut créer, modifier ou supprimer des rôles.
        </Alert>
      )}

      <Card>
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size="medium" sx={{ minWidth: 800 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headCells={TABLE_HEAD}
                onSort={table.onSort}
              />

              <TableBody>
                {tableData
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row) => (
                    <RoleTableRow
                      key={row.id}
                      row={row}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                      onEditRow={() => handleOpenEditDialog(row)}
                      disableActions={!isSuperAdmin}
                    />
                  ))}

                <TableEmptyRows
                  height={72}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                />

                <TableNoData notFound={tableData.length === 0} />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePaginationCustom
          count={tableData.length}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      {/* Dialog d'édition ou création */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedRole && selectedRole.id ? 'Modifier le Rôle' : 'Créer un Nouveau Rôle'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 2 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={3} sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Identifiant du rôle"
              value={selectedRole?.name || ''}
              onChange={(e) =>
                setSelectedRole({
                  ...selectedRole,
                  name: e.target.value,
                  id: selectedRole?.id || e.target.value,
                })
              }
              disabled={!!selectedRole?.id}
              helperText="Identifiant unique pour le rôle (ex: editor, manager...)"
            />
            <TextField
              fullWidth
              label="Libellé du rôle"
              value={selectedRole?.label || ''}
              onChange={(e) => setSelectedRole({ ...selectedRole, label: e.target.value })}
              helperText="Nom affiché pour le rôle (ex: Éditeur, Responsable...)"
            />
            <TextField
              fullWidth
              label="Niveau d'accès"
              type="number"
              value={selectedRole?.level || 1}
              onChange={(e) => setSelectedRole({ ...selectedRole, level: Number(e.target.value) })}
              inputProps={{ min: 1, max: 10 }}
              helperText="Niveau hiérarchique (1 = minimum, 10 = maximum)"
            />
            <FormControl fullWidth>
              <InputLabel id="permissions-select-label">Permissions</InputLabel>
              <Select
                labelId="permissions-select-label"
                multiple
                value={selectedRole?.permissions || []}
                onChange={(e) => setSelectedRole({ ...selectedRole, permissions: e.target.value })}
                input={<OutlinedInput label="Permissions" />}
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
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Annuler</Button>
          <Button onClick={handleUpdateRole} variant="contained" disabled={loading}>
            {loading
              ? 'Traitement en cours...'
              : selectedRole && selectedRole.id
                ? 'Mettre à jour'
                : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
