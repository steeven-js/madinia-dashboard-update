import { useState, useEffect, useCallback } from 'react';
import { getAvailableLabels, addAvailableLabel, deleteAvailableLabel } from 'src/actions/kanban';

import { toast } from 'src/components/snackbar';

/**
 * Hook pour gérer les étiquettes du Kanban
 * @returns {{
 *   labels: string[],
 *   loading: boolean,
 *   error: Error | null,
 *   addLabel: (labelName: string) => Promise<string>,
 *   deleteLabel: (labelName: string) => Promise<void>,
 *   refreshLabels: () => Promise<void>
 * }}
 */
export function useKanbanLabels() {
    const [labels, setLabels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLabels = useCallback(async () => {
        setLoading(true);
        try {
            const fetchedLabels = await getAvailableLabels();
            setLabels(fetchedLabels);
            setError(null);
        } catch (err) {
            console.error('Error fetching kanban labels:', err);
            setError(err);
            toast.error('Erreur lors du chargement des étiquettes');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLabels();
    }, [fetchLabels]);

    const handleAddLabel = useCallback(async (labelName) => {
        if (!labelName.trim()) {
            toast.error('Le nom de l\'étiquette ne peut pas être vide');
            return null;
        }

        try {
            const newLabel = await addAvailableLabel(labelName);
            // Mettre à jour l'état local seulement si l'étiquette n'existe pas déjà
            if (!labels.includes(newLabel)) {
                setLabels((prev) => [...prev, newLabel]);
            }
            toast.success('Étiquette ajoutée avec succès');
            return newLabel;
        } catch (err) {
            console.error('Error adding kanban label:', err);
            toast.error('Erreur lors de l\'ajout de l\'étiquette');
            throw err;
        }
    }, [labels]);

    const handleDeleteLabel = useCallback(async (labelName) => {
        try {
            await deleteAvailableLabel(labelName);
            setLabels((prev) => prev.filter((label) => label !== labelName));
            toast.success('Étiquette supprimée avec succès');
        } catch (err) {
            console.error('Error deleting kanban label:', err);
            toast.error('Erreur lors de la suppression de l\'étiquette');
            throw err;
        }
    }, []);

    return {
        labels,
        loading,
        error,
        addLabel: handleAddLabel,
        deleteLabel: handleDeleteLabel,
        refreshLabels: fetchLabels,
    };
}
