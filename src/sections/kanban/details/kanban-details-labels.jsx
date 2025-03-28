import { useState } from 'react';
import PropTypes from 'prop-types';
import { useKanbanLabels } from 'src/hooks/use-kanban-labels';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Label color mapping
const LABEL_COLORS = {
  bug: 'error',
  feature: 'success',
  enhancement: 'info',
  documentation: 'warning',
  design: 'primary',
  // Add more label-to-color mappings as needed
};

// Get color for a label, with fallback to default
const getLabelColor = (label) => LABEL_COLORS[label.toLowerCase()] || 'default';

export function KanbanDetailsLabels({ taskLabels = [], onUpdateLabels }) {
  const { labels, loading } = useKanbanLabels();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleToggleLabel = (label) => {
    const updatedLabels = taskLabels.includes(label)
      ? taskLabels.filter((l) => l !== label)
      : [...taskLabels, label];

    onUpdateLabels(updatedLabels);
  };

  if (loading) {
    return <CircularProgress size={20} />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
        {taskLabels.map((label) => (
          <Chip
            key={label}
            label={label}
            color={getLabelColor(label)}
            size="small"
            variant="soft"
            onDelete={() => handleToggleLabel(label)}
            deleteIcon={<Iconify icon="eva:close-fill" />}
            sx={{
              borderRadius: '4px',
              fontWeight: 'medium',
              textTransform: 'capitalize',
            }}
          />
        ))}

        <Tooltip title="Ajouter ou supprimer des étiquettes">
          <IconButton
            size="small"
            onClick={handleOpenMenu}
            color="primary"
            sx={{
              ml: 0.5,
              width: 24,
              height: 24,
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <Iconify icon={taskLabels.length ? 'eva:edit-fill' : 'eva:plus-fill'} width={16} />
          </IconButton>
        </Tooltip>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              width: 180,
              maxHeight: 260,
              mt: 0.5,
              boxShadow: (theme) =>
                theme.customShadows?.dropdown ||
                '0 0 2px 0 rgba(0,0,0,0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
            },
          },
        }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          Étiquettes
        </Typography>

        {labels.length > 0 ? (
          labels.map((label) => {
            const isSelected = taskLabels.includes(label);
            const color = getLabelColor(label);

            return (
              <MenuItem
                key={label}
                selected={isSelected}
                onClick={() => handleToggleLabel(label)}
                sx={{
                  height: 40,
                  mx: 1,
                  borderRadius: 1,
                  ...(isSelected && {
                    backgroundColor: (theme) =>
                      theme.palette[color]?.lighter || theme.palette.action.selected,
                  }),
                }}
              >
                <Iconify
                  icon={isSelected ? 'eva:checkmark-fill' : ''}
                  width={20}
                  height={20}
                  sx={{
                    mr: 1,
                    color: (theme) =>
                      isSelected ? theme.palette[color]?.main || 'primary.main' : 'inherit',
                    ...(isSelected ? {} : { visibility: 'hidden' }),
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    textTransform: 'capitalize',
                    ...(isSelected && {
                      fontWeight: 'fontWeightMedium',
                    }),
                  }}
                >
                  {label}
                </Typography>
              </MenuItem>
            );
          })
        ) : (
          <MenuItem disabled>
            <Typography variant="body2">Aucune étiquette disponible</Typography>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
}

KanbanDetailsLabels.propTypes = {
  taskLabels: PropTypes.arrayOf(PropTypes.string),
  onUpdateLabels: PropTypes.func,
};
