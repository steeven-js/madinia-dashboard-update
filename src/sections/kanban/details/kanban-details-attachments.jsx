import { useState, useCallback } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { storage } from 'src/utils/firebase';
import { Iconify } from 'src/components/iconify';
import { UploadBox, MultiFilePreview } from 'src/components/upload';

// ----------------------------------------------------------------------

const LoadingWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  zIndex: 10,
  borderRadius: theme.shape.borderRadius,
}));

export function KanbanDetailsAttachments({ attachments, task, onUpdateTask }) {
  const [files, setFiles] = useState(attachments || []);
  const [isUploading, setIsUploading] = useState(false);
  const [loadingFile, setLoadingFile] = useState(null);

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      if (!acceptedFiles.length || !task) return;

      setIsUploading(true);
      try {
        const uploadedFiles = [];

        for (const file of acceptedFiles) {
          // Créer un chemin unique pour chaque fichier
          const fileExtension = file.name.split('.').pop().toLowerCase();
          const fileName = `${crypto.randomUUID()}.${fileExtension}`;
          const filePath = `attachments/${task.status}/${task.id}/${fileName}`;
          const storageRef = ref(storage, filePath);

          // Téléverser le fichier vers Firebase Storage
          await uploadBytes(storageRef, file);

          // Obtenir l'URL de téléchargement
          const downloadURL = await getDownloadURL(storageRef);

          // Créer l'objet pièce jointe
          const attachmentFile = {
            name: file.name,
            size: file.size,
            type: file.type,
            path: filePath,
            url: downloadURL,
            preview: URL.createObjectURL(file),
            createdAt: new Date().toISOString(),
          };

          uploadedFiles.push(attachmentFile);
        }

        // Mettre à jour l'état local et la tâche
        const updatedFiles = [...files, ...uploadedFiles];
        setFiles(updatedFiles);

        if (onUpdateTask) {
          onUpdateTask({ ...task, attachments: updatedFiles });
        }
      } catch (error) {
        console.error('Error uploading files:', error);
      } finally {
        setIsUploading(false);
      }
    },
    [files, task, onUpdateTask]
  );

  const handleRemoveFile = useCallback(
    async (fileToRemove) => {
      try {
        setLoadingFile(fileToRemove);

        // Si le fichier a un chemin de stockage, le supprimer de Firebase
        if (fileToRemove.path) {
          const storageRef = ref(storage, fileToRemove.path);
          await deleteObject(storageRef);
        }

        // Filtrer les fichiers pour supprimer celui-ci
        const filteredFiles = files.filter((file) => file !== fileToRemove);
        setFiles(filteredFiles);

        // Mettre à jour la tâche
        if (onUpdateTask) {
          onUpdateTask({ ...task, attachments: filteredFiles });
        }
      } catch (error) {
        console.error('Error removing file:', error);
      } finally {
        setLoadingFile(null);
      }
    },
    [files, task, onUpdateTask]
  );

  const handleFileClick = useCallback((file) => {
    if (file.url) {
      window.open(file.url, '_blank');
    }
  }, []);

  return (
    <MultiFilePreview
      thumbnail
      files={files}
      onRemove={(file) => handleRemoveFile(file)}
      onClick={(file) => handleFileClick(file)}
      slotProps={{
        thumbnail: {
          sx: { width: 64, height: 64, position: 'relative' },
          extra: (file) =>
            loadingFile === file && (
              <LoadingWrapper>
                <CircularProgress size={24} color="inherit" />
              </LoadingWrapper>
            ),
        },
      }}
      lastNode={
        <Box sx={{ position: 'relative' }}>
          {isUploading && (
            <LoadingWrapper>
              <CircularProgress size={24} color="inherit" />
            </LoadingWrapper>
          )}
          <UploadBox onDrop={handleDrop} disabled={isUploading} />
        </Box>
      }
    />
  );
}
