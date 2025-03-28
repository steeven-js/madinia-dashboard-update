import { useState } from 'react';
import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function RoleTableRow({ row, onDeleteRow, onEditRow, disableActions = false }) {
  const { id, name, label, level, permissions } = row;

  const isSystemRole = ['super_admin', 'user'].includes(id);

  return (
    <TableRow hover>
      <TableCell>{name}</TableCell>
      <TableCell>{label}</TableCell>
      <TableCell align="center">{level}</TableCell>
      <TableCell>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {permissions.includes('all') ? (
            <Chip label="Tous les accès" color="error" size="small" />
          ) : (
            permissions.map((permission) => (
              <Chip
                key={permission}
                label={permission}
                color="primary"
                size="small"
                variant="outlined"
              />
            ))
          )}
        </Stack>
      </TableCell>
      <TableCell align="right">
        <Tooltip title={disableActions ? 'Accès restreint' : 'Modifier'}>
          <span>
            <IconButton onClick={onEditRow} disabled={disableActions}>
              <Iconify icon="eva:edit-fill" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip
          title={
            disableActions ? 'Accès restreint' : isSystemRole ? 'Rôle système protégé' : 'Supprimer'
          }
        >
          <span>
            <IconButton
              onClick={onDeleteRow}
              disabled={disableActions || isSystemRole}
              sx={{
                color: disableActions || isSystemRole ? 'text.disabled' : 'error.main',
                '&:hover': {
                  bgcolor: disableActions || isSystemRole ? 'transparent' : 'error.lighter',
                },
              }}
            >
              <Iconify icon="eva:trash-2-outline" />
            </IconButton>
          </span>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

RoleTableRow.propTypes = {
  row: PropTypes.object,
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  disableActions: PropTypes.bool,
};
