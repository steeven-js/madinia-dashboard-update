import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';
import { useAuth } from 'src/hooks/use-auth';

// ----------------------------------------------------------------------

export function KanbanDetailsCommentInput({ taskId, columnId, onAddComment, task }) {
  const { userProfile } = useAuth();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('text');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChangeMessage = useCallback((event) => {
    setMessage(event.target.value);
  }, []);

  const handleAddComment = useCallback(async () => {
    if (!message.trim()) return;

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

      await onAddComment(newComment);
      setMessage('');
      setMessageType('text');
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
        />

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ flexGrow: 1, display: 'flex' }}>
            <IconButton onClick={() => setMessageType('image')}>
              <Iconify icon="solar:gallery-add-bold" />
            </IconButton>

            <IconButton onClick={() => setMessageType('file')}>
              <Iconify icon="eva:attach-2-fill" />
            </IconButton>
          </Box>

          <Button
            variant="contained"
            onClick={handleAddComment}
            disabled={!message.trim() || isSubmitting}
          >
            Comment
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
