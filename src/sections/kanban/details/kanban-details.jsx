import dayjs from 'dayjs';
import { useState, useCallback, useEffect, useRef } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { useTabs, useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { useDateRangePicker, CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import { useGetBoard } from 'src/actions/kanban';

import { KanbanDetailsToolbar } from './kanban-details-toolbar';
import { KanbanInputName } from '../components/kanban-input-name';
import { KanbanDetailsPriority } from './kanban-details-priority';
import { KanbanDetailsAttachments } from './kanban-details-attachments';
import { KanbanDetailsCommentList } from './kanban-details-comment-list';
import { KanbanDetailsCommentInput } from './kanban-details-comment-input';
import { KanbanContactsDialog } from '../components/kanban-contacts-dialog';
import { KanbanDetailsLabels } from './kanban-details-labels';

// ----------------------------------------------------------------------

// Removing the hardcoded SUBTASKS array as we'll use data from Firebase
// const SUBTASKS = [
//   'Complete project proposal',
//   'Conduct market research',
//   'Design user interface mockups',
//   'Develop backend api',
//   'Implement authentication system',
// ];

const BlockLabel = styled('span')(({ theme }) => ({
  ...theme.typography.caption,
  width: 100,
  flexShrink: 0,
  color: theme.vars.palette.text.secondary,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

// ----------------------------------------------------------------------

export function KanbanDetails({ task, open, onUpdateTask, onDeleteTask, onClose }) {
  const tabs = useTabs('overview');
  const { board } = useGetBoard();

  const boardRef = useRef(board);
  const taskRef = useRef(task);

  const likeToggle = useBoolean();
  const contactsDialog = useBoolean();

  const [taskName, setTaskName] = useState(task.name);
  const [priority, setPriority] = useState(task.priority);
  const [taskDescription, setTaskDescription] = useState(task.description);
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [subtaskCompleted, setSubtaskCompleted] = useState(
    (task.subtasks || []).filter((subtask) => subtask.completed).map((subtask) => subtask.id)
  );
  const [assignees, setAssignees] = useState(task.assignee || []);
  const [labels, setLabels] = useState(task.labels || []);
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);

  const rangePicker = useDateRangePicker(dayjs(task.due[0]), dayjs(task.due[1]));

  useEffect(() => {
    boardRef.current = board;
    taskRef.current = task;
  }, [board, task]);

  useEffect(() => {
    if (!board.tasks) return;

    const columnId = Object.keys(board.tasks).find((colId) =>
      board.tasks[colId].some((t) => t.id === task.id)
    );

    if (!columnId) return;

    const updatedTask = board.tasks[columnId].find((t) => t.id === task.id);

    if (!updatedTask) return;

    if (updatedTask.priority !== priority) {
      setPriority(updatedTask.priority);
    }

    if (updatedTask.name !== taskName) {
      setTaskName(updatedTask.name);
    }

    if (updatedTask.description !== taskDescription) {
      setTaskDescription(updatedTask.description);
    }

    const updatedAssignees = updatedTask.assignee || [];
    if (JSON.stringify(updatedAssignees) !== JSON.stringify(assignees)) {
      setAssignees(updatedAssignees);
    }

    const updatedLabels = updatedTask.labels || [];
    if (JSON.stringify(updatedLabels) !== JSON.stringify(labels)) {
      setLabels(updatedLabels);
    }

    const updatedSubtasks = updatedTask.subtasks || [];
    if (JSON.stringify(updatedSubtasks) !== JSON.stringify(subtasks)) {
      setSubtasks(updatedSubtasks);
      setSubtaskCompleted(
        updatedSubtasks.filter((subtask) => subtask.completed).map((subtask) => subtask.id)
      );
    }
  }, [board]);

  const handleChangeTaskName = useCallback((event) => {
    setTaskName(event.target.value);
  }, []);

  const handleUpdateTask = useCallback(
    (event) => {
      try {
        if (event.key === 'Enter') {
          if (taskName) {
            onUpdateTask({ ...task, name: taskName });
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    [onUpdateTask, task, taskName]
  );

  const handleChangeTaskDescription = useCallback(
    (event) => {
      const newDescription = event.target.value;
      setTaskDescription(newDescription);

      // Mettre à jour immédiatement la tâche avec la nouvelle description
      onUpdateTask({ ...task, description: newDescription });
    },
    [onUpdateTask, task]
  );

  const handleChangePriority = useCallback(
    (newValue) => {
      setPriority(newValue);

      onUpdateTask({ ...task, priority: newValue });
    },
    [onUpdateTask, task]
  );

  const handleChangeAssignees = useCallback(
    (newAssignees) => {
      setAssignees(newAssignees);
      onUpdateTask({ ...task, assignee: newAssignees });
    },
    [onUpdateTask, task]
  );

  const handleChangeLabels = useCallback(
    (newLabels) => {
      setLabels(newLabels);
      onUpdateTask({ ...task, labels: newLabels });
    },
    [onUpdateTask, task]
  );

  const handleClickSubtaskComplete = (subtaskId) => {
    // Find the subtask by id
    const subtaskIndex = subtasks.findIndex((subtask) => subtask.id === subtaskId);
    if (subtaskIndex === -1) return;

    // Create a copy of the subtasks array
    const updatedSubtasks = [...subtasks];

    // Toggle the completed status
    updatedSubtasks[subtaskIndex] = {
      ...updatedSubtasks[subtaskIndex],
      completed: !updatedSubtasks[subtaskIndex].completed,
      updatedAt: new Date().toISOString(),
      updatedBy: task.updatedBy || task.createdBy,
    };

    // Update local state
    setSubtasks(updatedSubtasks);
    setSubtaskCompleted(
      updatedSubtasks.filter((subtask) => subtask.completed).map((subtask) => subtask.id)
    );

    // Update the task with the new subtasks
    onUpdateTask({ ...task, subtasks: updatedSubtasks });
  };

  const handleAddSubtask = () => {
    if (!newSubtaskName.trim()) return;

    // Create a new subtask object
    const newSubtask = {
      id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newSubtaskName.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: task.updatedBy || task.createdBy,
      updatedBy: task.updatedBy || task.createdBy,
      userId: task.updatedBy || task.createdBy,
    };

    // Add the new subtask to the existing subtasks
    const updatedSubtasks = [...subtasks, newSubtask];

    // Update local state
    setSubtasks(updatedSubtasks);
    setNewSubtaskName('');
    setShowSubtaskInput(false);

    // Update the task with the new subtasks
    onUpdateTask({ ...task, subtasks: updatedSubtasks });
  };

  const handleDeleteSubtask = (subtaskId) => {
    // Filter out the subtask to be deleted
    const updatedSubtasks = subtasks.filter((subtask) => subtask.id !== subtaskId);

    // Update local state
    setSubtasks(updatedSubtasks);
    setSubtaskCompleted(
      updatedSubtasks.filter((subtask) => subtask.completed).map((subtask) => subtask.id)
    );

    // Update the task with the new subtasks
    onUpdateTask({ ...task, subtasks: updatedSubtasks });
  };

  const handleSubtaskKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleAddSubtask();
    } else if (event.key === 'Escape') {
      setNewSubtaskName('');
      setShowSubtaskInput(false);
    }
  };

  const renderToolbar = () => (
    <KanbanDetailsToolbar
      taskName={task.name}
      onDelete={onDeleteTask}
      taskStatus={task.status}
      liked={likeToggle.value}
      onCloseDetails={onClose}
      onLikeToggle={likeToggle.onToggle}
      task={task}
      onUpdateTask={onUpdateTask}
    />
  );

  const renderTabs = () => (
    <CustomTabs
      value={tabs.value}
      onChange={tabs.onChange}
      variant="fullWidth"
      slotProps={{ tab: { px: 0 } }}
    >
      {[
        { value: 'overview', label: 'Overview' },
        { value: 'subTasks', label: 'Subtasks' },
        { value: 'comments', label: `Comments (${task.comments.length})` },
      ].map((tab) => (
        <Tab key={tab.value} value={tab.value} label={tab.label} />
      ))}
    </CustomTabs>
  );

  const renderTabOverview = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      {/* Task name */}
      <KanbanInputName
        placeholder="Task name"
        value={taskName}
        onChange={handleChangeTaskName}
        onKeyUp={handleUpdateTask}
        inputProps={{ id: `${taskName}-task-input` }}
      />

      {/* Reporter */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <BlockLabel>Reporter</BlockLabel>
        <Avatar alt={task.reporter.name} src={task.reporter.avatarUrl} />
      </Box>

      {/* Assignee */}
      <Box sx={{ display: 'flex' }}>
        <BlockLabel sx={{ height: 40, lineHeight: '40px' }}>Assignee</BlockLabel>

        <Box sx={{ gap: 1, display: 'flex', flexWrap: 'wrap' }}>
          {assignees.map((user) => (
            <Avatar key={user.id} alt={user.name} src={user.avatarUrl} />
          ))}

          <Tooltip title="Add assignee">
            <IconButton
              onClick={contactsDialog.onTrue}
              sx={[
                (theme) => ({
                  border: `dashed 1px ${theme.vars.palette.divider}`,
                  bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                }),
              ]}
            >
              <Iconify icon="mingcute:add-line" />
            </IconButton>
          </Tooltip>

          <KanbanContactsDialog
            assignee={assignees}
            open={contactsDialog.value}
            onClose={contactsDialog.onFalse}
            onAssignee={handleChangeAssignees}
          />
        </Box>
      </Box>

      {/* Label */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <BlockLabel>Labels</BlockLabel>
        <KanbanDetailsLabels taskLabels={labels} onUpdateLabels={handleChangeLabels} />
      </Box>

      {/* Due date */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <BlockLabel> Due date </BlockLabel>

        {rangePicker.selected ? (
          <Button size="small" onClick={rangePicker.onOpen}>
            {rangePicker.shortLabel}
          </Button>
        ) : (
          <Tooltip title="Add due date">
            <IconButton
              onClick={rangePicker.onOpen}
              sx={[
                (theme) => ({
                  border: `dashed 1px ${theme.vars.palette.divider}`,
                  bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                }),
              ]}
            >
              <Iconify icon="mingcute:add-line" />
            </IconButton>
          </Tooltip>
        )}

        <CustomDateRangePicker
          variant="calendar"
          title="Choose due date"
          startDate={rangePicker.startDate}
          endDate={rangePicker.endDate}
          onChangeStartDate={rangePicker.onChangeStartDate}
          onChangeEndDate={rangePicker.onChangeEndDate}
          open={rangePicker.open}
          onClose={rangePicker.onClose}
          selected={rangePicker.selected}
          error={rangePicker.error}
        />
      </Box>

      {/* Priority */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <BlockLabel>Priority</BlockLabel>
        <KanbanDetailsPriority priority={priority} onChangePriority={handleChangePriority} />
      </Box>

      {/* Description */}
      <Box sx={{ display: 'flex' }}>
        <BlockLabel> Description </BlockLabel>
        <TextField
          fullWidth
          multiline
          size="small"
          minRows={4}
          value={taskDescription}
          onChange={handleChangeTaskDescription}
          slotProps={{ input: { sx: { typography: 'body2' } } }}
        />
      </Box>

      {/* Attachments */}
      <Box sx={{ display: 'flex' }}>
        <BlockLabel>Attachments</BlockLabel>
        <KanbanDetailsAttachments attachments={task.attachments} />
      </Box>
    </Box>
  );

  const renderTabSubtasks = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <div>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {subtaskCompleted.length} of {subtasks.length}
        </Typography>

        <LinearProgress
          variant="determinate"
          value={(subtaskCompleted.length / subtasks.length) * 100}
        />
      </div>

      <FormGroup>
        {subtasks.map((subtask) => (
          <Box key={subtask.id} sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <FormControlLabel
              control={<Checkbox disableRipple name={subtask.name} checked={subtask.completed} />}
              label={subtask.name}
              onChange={() => handleClickSubtaskComplete(subtask.id)}
              sx={{ flexGrow: 1 }}
            />
            <Tooltip title="Delete subtask">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeleteSubtask(subtask.id)}
                sx={{ opacity: 0.72, '&:hover': { opacity: 1 } }}
              >
                <Iconify icon="eva:trash-2-outline" />
              </IconButton>
            </Tooltip>
          </Box>
        ))}
      </FormGroup>

      {showSubtaskInput ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            value={newSubtaskName}
            onChange={(e) => setNewSubtaskName(e.target.value)}
            onKeyDown={handleSubtaskKeyDown}
            placeholder="Enter subtask name"
            autoFocus
          />
          <Button variant="contained" onClick={handleAddSubtask} disabled={!newSubtaskName.trim()}>
            Add
          </Button>
          <IconButton onClick={() => setShowSubtaskInput(false)}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Box>
      ) : (
        <Button
          variant="outlined"
          startIcon={<Iconify icon="mingcute:add-line" />}
          sx={{ alignSelf: 'flex-start' }}
          onClick={() => setShowSubtaskInput(true)}
        >
          Subtask
        </Button>
      )}
    </Box>
  );

  const renderTabComments = () =>
    !!task.comments.length && <KanbanDetailsCommentList comments={task.comments} />;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor="right"
      slotProps={{ backdrop: { invisible: true } }}
      PaperProps={{ sx: { width: { xs: 1, sm: 480 } } }}
    >
      {renderToolbar()}
      {renderTabs()}

      <Scrollbar fillContent sx={{ py: 3, px: 2.5 }}>
        {tabs.value === 'overview' && renderTabOverview()}
        {tabs.value === 'subTasks' && renderTabSubtasks()}
        {tabs.value === 'comments' && renderTabComments()}
      </Scrollbar>

      {tabs.value === 'comments' && <KanbanDetailsCommentInput />}
    </Drawer>
  );
}
