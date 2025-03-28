import { uuidv4 } from 'minimal-shared/utils';
import { useMemo, useState, useCallback } from 'react';

import Paper from '@mui/material/Paper';
import FormHelperText from '@mui/material/FormHelperText';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import InputBase, { inputBaseClasses } from '@mui/material/InputBase';

import { useAuth } from 'src/hooks/use-auth';

import { fAdd, today } from 'src/utils/format-time';


// ----------------------------------------------------------------------

export function KanbanTaskAdd({ status, openAddTask, onAddTask, onCloseAddTask }) {
  const [taskName, setTaskName] = useState('');
  const { userProfile } = useAuth();

  const defaultTask = useMemo(
    () => ({
      id: uuidv4(),
      status,
      name: taskName.trim() ? taskName : 'Untitled',
      priority: 'medium',
      attachments: [],
      labels: [],
      comments: [],
      assignee: [],
      due: [today(), fAdd({ days: 1 })],
      reporter: {
        id: userProfile?.id || null,
        name:
          userProfile?.displayName ||
          userProfile?.firstName + ' ' + userProfile?.lastName ||
          'Anonymous',
        avatarUrl: userProfile?.avatarUrl || null,
        email: userProfile?.email || null,
        role: userProfile?.role || null,
        roleLevel: userProfile?.roleLevel || 0,
        isVerified: userProfile?.isVerified || false,
      },
    }),
    [status, taskName, userProfile]
  );

  const handleChangeName = useCallback((event) => {
    setTaskName(event.target.value);
  }, []);

  const handleKeyUpAddTask = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        onAddTask(defaultTask);
        setTaskName('');
      }
    },
    [defaultTask, onAddTask]
  );

  const handleCancel = useCallback(() => {
    setTaskName('');
    onCloseAddTask();
  }, [onCloseAddTask]);

  if (!openAddTask) {
    return null;
  }

  return (
    <ClickAwayListener onClickAway={handleCancel}>
      <div>
        <Paper
          sx={[
            (theme) => ({
              borderRadius: 1.5,
              bgcolor: 'background.default',
              boxShadow: theme.vars.customShadows.z1,
            }),
          ]}
        >
          <InputBase
            autoFocus
            fullWidth
            placeholder="Untitled"
            value={taskName}
            onChange={handleChangeName}
            onKeyUp={handleKeyUpAddTask}
            sx={{
              px: 2,
              height: 56,
              [`& .${inputBaseClasses.input}`]: { p: 0, typography: 'subtitle2' },
            }}
          />
        </Paper>

        <FormHelperText sx={{ mx: 1 }}>Press Enter to create the task.</FormHelperText>
      </div>
    </ClickAwayListener>
  );
}
