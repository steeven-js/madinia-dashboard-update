import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';

import { EventCommentItem } from './event-comment-item';

// ----------------------------------------------------------------------

export function EventCommentList({ comments = [] }) {
  return (
    <>
      {comments.map((comment) => {
        const hasReply = !!comment.replyComment.length;

        return (
          <Box key={comment.id}>
            <EventCommentItem
              name={comment.name}
              message={comment.message}
              postedAt={comment.postedAt}
              avatarUrl={comment.avatarUrl}
            />
            {hasReply &&
              comment.replyComment.map((reply) => {
                const userReply = comment.users.find((user) => user.id === reply.userId);

                return (
                  <EventCommentItem
                    key={reply.id}
                    name={userReply?.name || ''}
                    message={reply.message}
                    postedAt={reply.postedAt}
                    avatarUrl={userReply?.avatarUrl || ''}
                    tagUser={reply.tagUser}
                    hasReply
                  />
                );
              })}
          </Box>
        );
      })}

      <Pagination
        count={8}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          my: { xs: 5, md: 8 },
        }}
      />
    </>
  );
}
