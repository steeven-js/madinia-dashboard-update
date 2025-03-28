import { useState, useCallback, useRef } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { Iconify } from 'src/components/iconify';
import { useAuth } from 'src/hooks/use-auth';
import { storage } from 'src/utils/firebase';

// ----------------------------------------------------------------------

export function KanbanDetailsCommentInput({ taskId, columnId, onAddComment, task }) {
  const { userProfile } = useAuth();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('text');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const handleChangeMessage = useCallback((event) => {
    setMessage(event.target.value);
  }, []);

  const handleAddComment = useCallback(async () => {
    if (!message.trim() && messageType === 'text') return;

    setIsSubmitting(true);

    try {
      const newComment = {
        id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: task.reporter.name || 'Anonymous',
        avatarUrl: task.reporter.avatarUrl || '',
        message: message.trim(),
        messageType,
        createdAt: new Date().toISOString(),
        userId: task.reporter.id || task.createdBy || '',
      };

      const success = await onAddComment(newComment);
      if (success) {
        setMessage('');
        setMessageType('text');

        // Remettre le focus sur l'input après l'envoi
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [message, messageType, task.reporter, onAddComment]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      handleAddComment();
    }
  };

  const handleFileUpload = async (file, type) => {
    if (!file) return;

    setIsSubmitting(true);
    try {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const fileName = `${crypto.randomUUID()}.${fileExtension}`;
      const filePath = `comments/${columnId}/${taskId}/${fileName}`;
      const storageRef = ref(storage, filePath);

      // Téléverser le fichier vers Firebase Storage
      await uploadBytes(storageRef, file);

      // Obtenir l'URL de téléchargement
      const downloadURL = await getDownloadURL(storageRef);

      // Créer le commentaire avec les données du fichier
      const newComment = {
        id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: task.reporter.name || 'Anonymous',
        avatarUrl: task.reporter.avatarUrl || '',
        message: downloadURL,
        messageType: type,
        fileName: file.name,
        fileExtension: fileExtension,
        fileSize: file.size,
        filePath,
        createdAt: new Date().toISOString(),
        userId: task.reporter.id || task.createdBy || '',
      };

      const success = await onAddComment(newComment);
      if (success) {
        setMessageType('text');
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file, 'image');
      e.target.value = null; // Réinitialiser l'input
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file, 'file');
      e.target.value = null; // Réinitialiser l'input
    }
  };

  return (
    <Box
      sx={{
        py: 3,
        gap: 2,
        px: 2.5,
        display: 'flex',
      }}
    >
      <Avatar src={task.reporter.avatarUrl} alt={task.reporter.name}>
        {!task.reporter.avatarUrl && task.reporter.name?.charAt(0).toUpperCase()}
      </Avatar>

      <Paper variant="outlined" sx={{ p: 1, flexGrow: 1, bgcolor: 'transparent' }}>
        <InputBase
          fullWidth
          multiline
          rows={2}
          placeholder="Type a message"
          sx={{ px: 1 }}
          value={message}
          onChange={handleChangeMessage}
          onKeyDown={handleKeyDown}
          inputRef={inputRef}
          disabled={isSubmitting}
        />

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ flexGrow: 1, display: 'flex' }}>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={imageInputRef}
              onChange={handleImageChange}
            />
            <Tooltip title="Ajouter une image">
              <IconButton
                onClick={handleImageClick}
                color={messageType === 'image' ? 'primary' : 'default'}
                disabled={isSubmitting}
              >
                <Iconify icon="solar:gallery-add-bold" />
              </IconButton>
            </Tooltip>

            <input
              type="file"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <Tooltip title="Ajouter un fichier">
              <IconButton
                onClick={handleFileClick}
                color={messageType === 'file' ? 'primary' : 'default'}
                disabled={isSubmitting}
              >
                <Iconify icon="eva:attach-2-fill" />
              </IconButton>
            </Tooltip>
          </Box>

          <Button
            variant="contained"
            onClick={handleAddComment}
            disabled={(!message.trim() && messageType === 'text') || isSubmitting}
          >
            {isSubmitting ? 'Envoi...' : 'Comment'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
