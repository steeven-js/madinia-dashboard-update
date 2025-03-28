import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tooltip from '@mui/material/Tooltip';

import { fToNow } from 'src/utils/format-time';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';
import { Lightbox, useLightBox } from 'src/components/lightbox';

// ----------------------------------------------------------------------

export function KanbanDetailsCommentList({ comments }) {
  // Filtrer les commentaires qui ont des images pour les diapositives
  const imageComments = comments.filter((comment) => comment.messageType === 'image');

  // Créer des diapositives pour le lightbox avec des icônes pour représenter les images
  const slides = imageComments.map((comment) => ({
    src: comment.message,
    icon: <Iconify icon="solar:gallery-add-bold" width={64} height={64} />,
  }));

  const lightbox = useLightBox(slides);

  return (
    <>
      <Stack component="ul" spacing={3}>
        {comments.map((comment) => (
          <Box component="li" key={comment.id} sx={{ gap: 2, display: 'flex' }}>
            <Tooltip title={comment.name}>
              <Avatar src={comment.avatarUrl} sx={{ width: 40, height: 40 }}>
                {!comment.avatarUrl && comment.name?.charAt(0).toUpperCase()}
              </Avatar>
            </Tooltip>

            <Stack spacing={comment.messageType === 'image' ? 1 : 0.5} flexGrow={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2">{comment.name}</Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  {fToNow(comment.createdAt)}
                </Typography>
              </Box>

              {comment.messageType === 'image' ? (
                <Card sx={{ borderRadius: 1.5, overflow: 'hidden', cursor: 'pointer' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'background.neutral',
                      p: 3,
                      transition: (theme) => theme.transitions.create(['opacity']),
                      '&:hover': { opacity: 0.8 },
                    }}
                    onClick={() => lightbox.onOpen(comment.message)}
                  >
                    <Iconify icon="solar:gallery-add-bold" width={48} height={48} />
                  </Box>
                  <CardContent sx={{ p: 1.5 }}>
                    <Typography variant="body2" noWrap>
                      {comment.message}
                    </Typography>
                  </CardContent>
                </Card>
              ) : comment.messageType === 'file' ? (
                <Card sx={{ borderRadius: 1.5, overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                    <Iconify
                      icon="eva:file-fill"
                      width={32}
                      height={32}
                      sx={{ color: 'primary.main', mr: 1 }}
                    />
                    <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                      {comment.message}
                    </Typography>
                    <IconButton size="small">
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
                  }}
                >
                  {comment.message}
                </Typography>
              )}
            </Stack>
          </Box>
        ))}
      </Stack>

      <Lightbox
        index={lightbox.selected}
        slides={slides}
        open={lightbox.open}
        close={lightbox.onClose}
      />
    </>
  );
}
