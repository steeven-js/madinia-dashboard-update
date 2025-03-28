import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AlertTitle from '@mui/material/AlertTitle';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';

import { useAuth } from 'src/hooks/use-auth';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { useRolePermission } from 'src/auth/context/role-permission-context';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'code', label: 'Code', align: 'left' },
  { id: 'description', label: 'Description', align: 'left' },
  { id: 'roles', label: 'Rôles associés', align: 'left' },
  { id: '', label: 'Actions', align: 'right' },
];

// ----------------------------------------------------------------------

export function PermissionsTab() {
  const { permissions, createPermission, updatePermission } = useRolePermission();
  const { role: currentUserRole } = useAuth();

  const table = useTable({
    defaultOrderBy: 'code',
  });

  const [tableData, setTableData] = useState([]);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Synchroniser tableData avec permissions
  useEffect(() => {
    setTableData(permissions);
  }, [permissions]);

  const handleOpenEditDialog = (permission) => {
    setSelectedPermission(permission);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedPermission(null);
    setError(null);
  };

  const handleUpdatePermission = async () => {
    if (!selectedPermission) return;

    try {
      setLoading(true);
      setError(null);

      if (selectedPermission.code) {
        // Mise à jour d'une permission existante
        await updatePermission(selectedPermission);
        toast.success('Description de la permission mise à jour avec succès!');
      } else {
        // Création d'une nouvelle permission
        await createPermission(selectedPermission);
        toast.success('Permission créée avec succès!');
      }

      handleCloseEditDialog();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewPermission = () => {
    setSelectedPermission({
      code: '',
      description: '',
      roles: [],
    });
    setOpenEditDialog(true);
  };

  const isSuperAdmin = currentUserRole === 'super_admin';

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
        <Typography variant="h5">Gestion des Permissions</Typography>
        {isSuperAdmin && (
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleCreateNewPermission}
          >
            Nouvelle Permission
          </Button>
        )}
      </Stack>

      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Information</AlertTitle>
        Les permissions définissent les capacités des utilisateurs dans l&apos;application. Pour
        attribuer des permissions aux rôles, utilisez l&apos;onglet &quot;Gestion des Rôles&quot;.
        {!isSuperAdmin && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Seul un super administrateur peut créer ou modifier les permissions.
          </Typography>
        )}
      </Alert>

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
                    <TableRow key={row.code} hover>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{row.code}</TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell>
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                          {row.roles.map((roleName) => (
                            <Chip
                              key={roleName}
                              label={roleName}
                              color="primary"
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        {isSuperAdmin && (
                          <Tooltip title="Modifier">
                            <IconButton onClick={() => handleOpenEditDialog(row)}>
                              <Iconify icon="eva:edit-fill" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}

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

      {/* Dialog d'édition */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedPermission && selectedPermission.code
            ? 'Modifier la Permission'
            : 'Créer une Nouvelle Permission'}
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
              label="Code de permission"
              value={selectedPermission?.code || ''}
              onChange={(e) =>
                setSelectedPermission({ ...selectedPermission, code: e.target.value })
              }
              disabled={!!selectedPermission?.code}
              helperText="Identifiant unique pour la permission (ex: manage_users, view_content...)"
            />
            <TextField
              fullWidth
              label="Description"
              value={selectedPermission?.description || ''}
              onChange={(e) =>
                setSelectedPermission({ ...selectedPermission, description: e.target.value })
              }
              helperText="Description détaillée de ce que permet cette permission"
            />

            <Alert severity="warning">
              Cette fonctionnalité est uniquement informative. Pour attribuer des permissions aux
              rôles, utilisez l&apos;onglet &quot;Gestion des Rôles&quot;.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Annuler</Button>
          <Button onClick={handleUpdatePermission} variant="contained" disabled={loading}>
            {loading
              ? 'Traitement en cours...'
              : selectedPermission && selectedPermission.code
                ? 'Mettre à jour'
                : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

PermissionsTab.propTypes = {
  // Add any necessary prop types here
};
