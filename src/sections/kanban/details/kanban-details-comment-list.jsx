import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { fToNow } from 'src/utils/format-time';

import { deleteComment } from 'src/actions/kanban';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';
import { Lightbox, useLightBox } from 'src/components/lightbox';

// Import des constantes de format
import { fileThumb, fileNameByUrl } from 'src/sections/kanban/utils';

// ----------------------------------------------------------------------

export function KanbanDetailsCommentList({ comments, columnId, taskId, onCommentDeleted }) {
  const lastCommentRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  // Filtrer les commentaires qui ont des images pour les diapositives
  const imageComments = comments.filter((comment) => comment.messageType === 'image');

  // Créer des diapositives pour le lightbox avec les URLs d'images directes
  const slides = imageComments.map((comment) => ({
    src: comment.message,
    title: comment.fileName || '',
  }));

  const lightbox = useLightBox(slides);

  // Scroll vers le dernier commentaire quand les commentaires changent
  useEffect(() => {
    if (lastCommentRef.current) {
      lastCommentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments.length]);

  // Fonction pour obtenir l'icône appropriée en fonction du messageType
  const getMessageTypeIcon = (comment) => {
    const { messageType, fileExtension } = comment;

    switch (messageType) {
      case 'image':
        return 'solar:gallery-add-bold';
      case 'file':
        if (fileExtension) {
          // Créer une URL factice pour réutiliser les fonctions utils.js
          const fakeUrl = `dummy.${fileExtension.toLowerCase()}`;

          // Obtenir directement le chemin vers l'icône SVG
          const iconPath = fileThumb(fakeUrl);

          // Log pour déboguer
          // console.log(
          //   `Comment: ${JSON.stringify({
          //     messageType: comment.messageType,
          //     fileExtension: comment.fileExtension,
          //     fileName: comment.fileName,
          //   })}`
          // );
          // console.log(`Chemin d'icône: ${iconPath}`);

          return iconPath;
        }
        // Utiliser directement l'URL du message si pas d'extension
        return fileThumb(comment.message);
      default:
        return 'eva:message-circle-fill';
    }
  };

  const handleOpenMenu = (event, comment) => {
    setAnchorEl(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleDeleteComment = async () => {
    if (!selectedComment || !columnId || !taskId) return;

    // Conserver l'ID du commentaire en cours de suppression
    const commentIdToDelete = selectedComment.id;

    // Fermer le menu immédiatement pour éviter les problèmes d'affichage
    handleCloseMenu();

    try {
      setIsDeleting(true);
      setDeletingCommentId(commentIdToDelete);

      await deleteComment(columnId, taskId, commentIdToDelete);

      // Notifier le parent si cette fonction existe
      if (onCommentDeleted) {
        onCommentDeleted(commentIdToDelete);
      }

      console.log('Comment deleted:', commentIdToDelete);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    } finally {
      setIsDeleting(false);
      setDeletingCommentId(null);
    }
  };

  return (
    <>
      <Stack component="ul" spacing={3}>
        {comments.map((comment, index) => {
          const isLastComment = index === comments.length - 1;
          const messageIcon = getMessageTypeIcon(comment);
          const isBeingDeleted = deletingCommentId === comment.id;

          return (
            <Box
              component="li"
              key={comment.id}
              sx={{
                gap: 2,
                display: 'flex',
                opacity: isBeingDeleted ? 0.5 : 1,
                position: 'relative',
              }}
              ref={isLastComment ? lastCommentRef : null}
            >
              {isBeingDeleted && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1,
                    bgcolor: 'rgba(0,0,0,0.05)',
                    borderRadius: 1,
                  }}
                >
                  <Iconify icon="eos-icons:loading" width={24} height={24} />
                </Box>
              )}

              <Tooltip title={comment.name}>
                <Avatar src={comment.avatarUrl} sx={{ width: 40, height: 40 }}>
                  {!comment.avatarUrl && comment.name?.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>

              <Stack spacing={comment.messageType === 'image' ? 1 : 0.5} flexGrow={1}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Typography variant="subtitle2">{comment.name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.disabled', mr: 1 }}>
                      {fToNow(comment.createdAt)}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(event) => handleOpenMenu(event, comment)}
                      sx={{ p: 0.5 }}
                    >
                      <Iconify icon="eva:more-vertical-fill" width={16} height={16} />
                    </IconButton>
                  </Box>
                </Box>

                {comment.messageType === 'image' ? (
                  <Card sx={{ borderRadius: 1.5, overflow: 'hidden', cursor: 'pointer' }}>
                    <Box
                      sx={{
                        position: 'relative',
                        paddingTop: '56.25%', // Ratio 16:9
                        bgcolor: 'background.neutral',
                        transition: (theme) => theme.transitions.create(['opacity']),
                        '&:hover': { opacity: 0.9 },
                      }}
                      onClick={() => lightbox.onOpen(comment.message)}
                    >
                      <Image
                        src={comment.message}
                        alt={comment.fileName || 'Image'}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    </Box>
                    {comment.fileName && (
                      <CardContent sx={{ p: 1.5 }}>
                        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                          {comment.fileName}
                        </Typography>
                      </CardContent>
                    )}
                  </Card>
                ) : comment.messageType === 'file' ? (
                  <Card sx={{ borderRadius: 1.5, overflow: 'hidden' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                      <Box sx={{ minWidth: 40, display: 'flex', justifyContent: 'center' }}>
                        {comment.fileExtension ? (
                          <Image
                            src={messageIcon}
                            sx={{ width: 32, height: 32, color: 'primary.main' }}
                          />
                        ) : (
                          <Iconify
                            icon={messageIcon}
                            width={32}
                            height={32}
                            sx={{ color: 'primary.main' }}
                          />
                        )}
                      </Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ flexGrow: 1, wordBreak: 'break-word', maxWidth: '80%', ml: 1 }}
                      >
                        {comment.fileName || fileNameByUrl(comment.message)}
                      </Typography>
                      <IconButton
                        size="small"
                        component="a"
                        href={comment.message}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Iconify icon="eva:download-fill" />
                      </IconButton>
                    </Box>
                  </Card>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      bgcolor: 'background.neutral',
                      wordBreak: 'break-word',
                    }}
                  >
                    {comment.message}
                  </Typography>
                )}
              </Stack>
            </Box>
          );
        })}
      </Stack>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleDeleteComment} sx={{ color: 'error.main' }} disabled={isDeleting}>
          <ListItemIcon sx={{ color: isDeleting ? 'text.disabled' : 'error.main' }}>
            {isDeleting ? (
              <Iconify icon="eos-icons:loading" />
            ) : (
              <Iconify icon="eva:trash-2-outline" />
            )}
          </ListItemIcon>
          <ListItemText
            primary={isDeleting ? 'Suppression en cours...' : 'Supprimer'}
            primaryTypographyProps={{ variant: 'body2' }}
          />
        </MenuItem>
      </Menu>

      <Lightbox
        index={lightbox.selected}
        slides={slides}
        open={lightbox.open}
        close={lightbox.onClose}
      />
    </>
  );
}
