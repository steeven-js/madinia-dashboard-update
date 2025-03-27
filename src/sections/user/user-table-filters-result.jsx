// Dans user-table-filters-result.jsx
import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';
import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

export function UserTableFiltersResult({ filters, setFilters, onResetPage, totalResults, sx }) {
  const currentFilters = filters;

  // Fonction pour obtenir le libellé d'un rôle à partir de sa valeur
  const getRoleLabel = (roleValue) => {
    return CONFIG.roles[roleValue]?.label || roleValue;
  };

  // Gestionnaire de suppression du mot-clé (recherche)
  const handleRemoveKeyword = useCallback(() => {
    onResetPage();
    setFilters((prev) => ({ ...prev, name: '' }));
  }, [onResetPage, setFilters]);

  // Gestionnaire de suppression du filtre de statut
  const handleRemoveStatus = useCallback(() => {
    onResetPage();
    setFilters((prev) => ({ ...prev, status: 'all' }));
  }, [onResetPage, setFilters]);

  // Gestionnaire de suppression d'un rôle spécifique du filtre
  const handleRemoveRole = useCallback(
    (inputValue) => {
      onResetPage();
      setFilters((prev) => ({
        ...prev,
        role: (prev.role || []).filter((item) => item !== inputValue),
      }));
    },
    [onResetPage, setFilters]
  );

  // Gestionnaire de réinitialisation de tous les filtres
  const handleReset = useCallback(() => {
    onResetPage();
    setFilters({
      name: '',
      role: [],
      status: 'all',
    });
  }, [onResetPage, setFilters]);

  return (
    <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
      {/* Affiche le chip de statut si un statut autre que "all" est sélectionné */}
      <FiltersBlock
        label="Statut:"
        isShow={currentFilters.status && currentFilters.status !== 'all'}
      >
        <Chip
          {...chipProps}
          label={currentFilters.status}
          onDelete={handleRemoveStatus}
          sx={{ textTransform: 'capitalize' }}
        />
      </FiltersBlock>

      {/* Affiche les chips de rôle pour chaque rôle sélectionné */}
      <FiltersBlock label="Rôle:" isShow={!!currentFilters.role?.length}>
        {(currentFilters.role || []).map((item) => (
          <Chip
            {...chipProps}
            key={item}
            label={getRoleLabel(item)}
            onDelete={() => handleRemoveRole(item)}
          />
        ))}
      </FiltersBlock>

      {/* Affiche le chip de mot-clé si une recherche est en cours */}
      <FiltersBlock label="Mot-clé:" isShow={!!currentFilters.name}>
        <Chip {...chipProps} label={currentFilters.name} onDelete={handleRemoveKeyword} />
      </FiltersBlock>
    </FiltersResult>
  );
}
