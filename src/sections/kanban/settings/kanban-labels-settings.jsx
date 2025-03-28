import { useState, useCallback } from 'react';
import { useKanbanLabels } from 'src/hooks/use-kanban-labels';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';

import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';

// ----------------------------------------------------------------------

export function KanbanLabelsSettings() {
  const { labels, loading, addLabel, deleteLabel } = useKanbanLabels();
  const [newLabelName, setNewLabelName] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenDialog = useCallback(() => {
    setOpenDialog(true);
    setNewLabelName('');
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
  }, []);

  const handleChangeNewLabel = useCallback((event) => {
    setNewLabelName(event.target.value);
  }, []);

  const handleSubmitNewLabel = useCallback(async () => {
    if (!newLabelName.trim()) return;

    setSubmitting(true);
    try {
      await addLabel(newLabelName);
      setNewLabelName('');
      handleCloseDialog();
    } finally {
      setSubmitting(false);
    }
  }, [addLabel, newLabelName, handleCloseDialog]);

  const handleKeyUp = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        handleSubmitNewLabel();
      }
    },
    [handleSubmitNewLabel]
  );

  const handleDeleteLabel = useCallback((labelName) => {
    setConfirmDelete(labelName);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmDelete) return;

    try {
      await deleteLabel(confirmDelete);
    } finally {
      setConfirmDelete(null);
    }
  }, [confirmDelete, deleteLabel]);

  return (
    <>
      <Card>
        <CardHeader
          title="Étiquettes"
          action={
            <Button
              color="primary"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={handleOpenDialog}
            >
              Nouvelle étiquette
            </Button>
          }
        />

        <Divider />

        <CardContent>
          {loading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ height: 200 }}>
              <CircularProgress />
            </Stack>
          ) : (
            <Stack spacing={3}>
              {labels.length > 0 ? (
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {labels.map((label) => (
                    <Chip
                      key={label}
                      label={label}
                      color="primary"
                      variant="soft"
                      deleteIcon={
                        <Tooltip title="Supprimer">
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </Tooltip>
                      }
                      onDelete={() => handleDeleteLabel(label)}
                    />
                  ))}
                </Stack>
              ) : (
                <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                  Aucune étiquette disponible
                </Typography>
              )}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Dialog pour ajouter une nouvelle étiquette */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="xs">
        <DialogTitle>Ajouter une nouvelle étiquette</DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            label="Nom de l'étiquette"
            value={newLabelName}
            onChange={handleChangeNewLabel}
            onKeyUp={handleKeyUp}
            disabled={submitting}
            margin="normal"
            placeholder="Ex: Urgent, Important, En cours..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="solar:bookmark-bold" sx={{ color: 'primary.main' }} />
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmitNewLabel}
            variant="contained"
            disabled={!newLabelName.trim() || submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Ajout en cours...' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title="Supprimer l'étiquette"
        content={`Êtes-vous sûr de vouloir supprimer l'étiquette "${confirmDelete}" ? Cette action ne peut pas être annulée.`}
        action={
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Supprimer
          </Button>
        }
      />
    </>
  );
}
