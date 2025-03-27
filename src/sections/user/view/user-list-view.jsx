import { varAlpha } from 'minimal-shared/utils';
import { useBoolean } from 'minimal-shared/hooks';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { updateUserRole, updateUserStatus } from 'src/hooks/use-users';

import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  rowInPage,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { UserTableRow } from '../user-table-row';
import { UserTableToolbar } from '../user-table-toolbar';
import { UserTableFiltersResult } from '../user-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Utilisateur', align: 'left', width: 280 },
  { id: 'phoneNumber', label: 'Téléphone', align: 'left', width: 180 },
  { id: 'role', label: 'Rôle', align: 'left', width: 180 },
  { id: 'status', label: 'Statut', align: 'left', width: 180 },
  { id: 'actions', label: '', align: 'right', width: 100 },
];

// ----------------------------------------------------------------------

const ROLE_OPTIONS = Object.entries(CONFIG.roles)
  .sort((a, b) => b[1].level - a[1].level)
  .map(([value, role]) => ({
    value,
    label: role.label,
    level: role.level,
  }));

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'active', label: 'Actif', color: 'success' },
  { value: 'pending', label: 'En attente', color: 'warning' },
  { value: 'banned', label: 'Banni', color: 'error' },
  { value: 'rejected', label: 'Rejeté', color: 'default' },
];

// ----------------------------------------------------------------------

// Fonction améliorée pour le filtrage des données
function applyFilter({ inputData, comparator, filters }) {
  const { name, status, role } = filters;

  // Create stable sort array
  const stabilizedThis = inputData.map((el, index) => [el, index]);

  // Sort based on comparator and maintain original order for equal items
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    return order !== 0 ? order : a[1] - b[1];
  });

  // Apply filters sequentially
  return stabilizedThis
    .map((el) => el[0])
    .filter((user) => {
      // Name filter - search in multiple fields
      if (name) {
        const searchTerm = name.toLowerCase();
        const matchesSearch =
          (user.displayName && user.displayName.toLowerCase().includes(searchTerm)) ||
          (user.firstName && user.firstName.toLowerCase().includes(searchTerm)) ||
          (user.lastName && user.lastName.toLowerCase().includes(searchTerm)) ||
          (user.email && user.email.toLowerCase().includes(searchTerm)) ||
          (user.phoneNumber && user.phoneNumber.toLowerCase().includes(searchTerm));

        if (!matchesSearch) {
          return false;
        }
      }

      // Status filter
      if (status !== 'all' && user.status !== status) {
        return false;
      }

      // Role filter - check if any role is selected and if the user's role is included
      if (role && role.length > 0 && !role.includes(user.role)) {
        return false;
      }

      return true;
    });
}

// ----------------------------------------------------------------------

export function UserListView({ users = [], currentAuthUser, onManualRefresh }) {
  const router = useRouter();
  const table = useTable();
  const confirmDialog = useBoolean();

  const [tableData, setTableData] = useState(users || []);

  const [filters, setFilters] = useState({
    name: '',
    role: [],
    status: 'all',
  });

  // Récupérer le niveau de l'utilisateur actuel à partir de CONFIG
  const currentUserLevel = CONFIG.roles[currentAuthUser?.role]?.level || 0;

  // Filtrer les rôles que l'utilisateur peut gérer
  const manageableRoles = ROLE_OPTIONS.filter((role) => {
    if (currentAuthUser?.role === 'super_admin') return true;
    return role.level < currentUserLevel;
  });

  // Fonction de filtrage avec le comparateur appliqué
  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset = !!filters.name || filters.role.length > 0 || filters.status !== 'all';

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  // Vérifier si l'utilisateur peut gérer un autre utilisateur
  const canManageUser = useCallback(
    (user) => {
      // Super admin peut tout gérer
      if (currentAuthUser?.role === 'super_admin') return true;

      const userRoleLevel = CONFIG.roles[user.role]?.level || 0;
      return userRoleLevel < currentUserLevel;
    },
    [currentUserLevel, currentAuthUser?.role]
  );

  // Gestionnaire de suppression d'une ligne
  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);
      setTableData(deleteRow);
      table.onUpdatePageDeleteRow(dataInPage.length);
      toast.success('Delete success!');
    },
    [dataInPage.length, table, tableData]
  );

  // Gestionnaire de suppression de plusieurs lignes
  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    setTableData(deleteRows);
    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
    toast.success('Delete success!');
  }, [dataFiltered.length, dataInPage.length, table, tableData]);

  // Gestionnaire d'édition d'une ligne
  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.user.edit(id));
    },
    [router]
  );

  // Gestionnaire de filtrage par statut
  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      setFilters((prev) => ({ ...prev, status: newValue || 'all' }));
    },
    [table]
  );

  // Gestionnaire de changement de rôle (pour une ligne)
  const handleChangeRole = useCallback(
    async (newRole, userId) => {
      const targetUser = tableData.find((user) => user.id === userId);
      if (!targetUser) {
        console.error('User not found:', userId);
        return;
      }

      // Super admin peut attribuer n'importe quel rôle
      if (currentAuthUser?.role !== 'super_admin') {
        const targetRoleLevel = CONFIG.roles[newRole]?.level || 0;
        // Pour les autres, vérifier le niveau
        if (targetRoleLevel >= currentUserLevel) {
          toast.error("Vous n'avez pas les permissions nécessaires pour attribuer ce rôle");
          return;
        }
      }

      try {
        await updateUserRole(userId, newRole);
        setTableData((prevData) =>
          prevData.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  role: newRole,
                  roleLevel: CONFIG.roles[newRole].level,
                  permissions: CONFIG.roles[newRole].permissions,
                }
              : user
          )
        );
        toast.success('Rôle mis à jour avec succès');
      } catch (error) {
        console.error('Erreur lors de la mise à jour du rôle:', error);
        toast.error('Une erreur est survenue lors de la mise à jour du rôle');
      }
    },
    [tableData, currentUserLevel, currentAuthUser?.role]
  );

  // Gestionnaire de changement de statut (pour une ligne)
  const handleChangeStatus = useCallback(async (userId, newStatus) => {
    try {
      await updateUserStatus(userId, newStatus);
      // Mettre à jour les données locales
      setTableData((prevData) =>
        prevData.map((user) => (user.id === userId ? { ...user, status: newStatus } : user))
      );
      toast.success('Statut mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Une erreur est survenue lors de la mise à jour du statut');
    }
  }, []);

  // Gestionnaire de filtrage par nom (recherche)
  const handleFilterName = useCallback(
    (value) => {
      table.onResetPage();
      setFilters((prev) => ({ ...prev, name: value }));
    },
    [table]
  );

  // Gestionnaire de filtrage par rôle
  const handleFilterRole = useCallback(
    (value) => {
      table.onResetPage();
      setFilters((prev) => ({ ...prev, role: value }));
    },
    [table]
  );

  // Gestionnaire de réinitialisation des filtres - Utilisé par UserTableFiltersResult
  // via la propriété onReset - Donc ne pas supprimer
  const handleResetFilters = useCallback(() => {
    table.onResetPage();
    setFilters({
      name: '',
      role: [],
      status: 'all',
    });
  }, [table]);

  const handleResetPage = useCallback(() => {
    table.onResetPage();
  }, [table]);

  // Gestionnaire de sélection d'une ligne
  const handleSelectRow = useCallback(
    (id) => {
      table.onSelectRow(id);
    },
    [table]
  );

  // Dialogue de confirmation de suppression
  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Delete"
      content={
        <>
          Are you sure want to delete <strong> {table.selected.length} </strong> items?
        </>
      }
      action={
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            handleDeleteRows();
            confirmDialog.onFalse();
          }}
        >
          Delete
        </Button>
      }
    />
  );

  // Effets pour mettre à jour les données du tableau quand les props users changent
  useEffect(() => {
    if (users.length) {
      setTableData(users);
    }
  }, [users]);

  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Liste des utilisateurs"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Utilisateurs', href: paths.dashboard.user.root },
            { name: 'Liste' },
          ]}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              {onManualRefresh && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Iconify icon="eva:refresh-outline" />}
                  onClick={onManualRefresh}
                >
                  Actualiser
                </Button>
              )}
              <Button
                component={RouterLink}
                href={paths.dashboard.user.new}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                Nouvel utilisateur
              </Button>
            </Box>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <Tabs
            value={filters.status}
            onChange={handleFilterStatus}
            sx={[
              (theme) => ({
                px: 2.5,
                boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
              }),
            ]}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'soft'
                    }
                    color={tab.color || 'default'}
                  >
                    {['active', 'pending', 'banned', 'rejected'].includes(tab.value)
                      ? users.filter((user) => user.status === tab.value).length
                      : users.length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <UserTableToolbar
            filters={filters}
            onFilterName={handleFilterName}
            onFilterRole={handleFilterRole}
            onResetPage={handleResetPage}
            options={{ roles: manageableRoles }}
          />

          {canReset && (
            <UserTableFiltersResult
              filters={filters}
              setFilters={setFilters}
              onResetPage={handleResetPage}
              onReset={handleResetFilters}
              totalResults={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <Box sx={{ position: 'relative' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={dataFiltered.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.id)
                )
              }
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirmDialog.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headCells={TABLE_HEAD}
                  rowCount={dataFiltered.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      dataFiltered.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {dataInPage.map((row) => (
                    <UserTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => handleSelectRow(row.id)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                      onEditRow={() => handleEditRow(row.id)}
                      manageableRoles={manageableRoles}
                      updateUserRole={(newRole) => handleChangeRole(newRole, row.id)}
                      updateUserStatus={(newStatus) => handleChangeStatus(row.id, newStatus)}
                      isCurrentUser={currentAuthUser?.id === row.id}
                      canManage={canManageUser(row)}
                      currentUserRole={currentAuthUser?.role}
                      STATUS_OPTIONS={STATUS_OPTIONS.filter((option) => option.value !== 'all')}
                      editHref={paths.dashboard.user.edit(row.id)}
                    />
                  ))}

                  <TableEmptyRows
                    height={table.dense ? 56 : 56 + 20}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </Box>

          <TablePaginationCustom
            page={table.page}
            dense={table.dense}
            count={dataFiltered.length}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onChangeDense={table.onChangeDense}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      </DashboardContent>

      {renderConfirmDialog()}
    </>
  );
}
