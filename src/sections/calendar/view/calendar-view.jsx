import Calendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useEffect, startTransition } from 'react';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import interactionPlugin from '@fullcalendar/interaction';
import { useBoolean, useSetState } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';

import { useAuth } from 'src/hooks/use-auth';

import { fDate, fIsAfter, fIsBetween } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';
import { CALENDAR_COLOR_OPTIONS } from 'src/_mock/_calendar';
import { updateEvent, useGetEvents } from 'src/actions/calendar';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { CalendarRoot } from '../styles';
import { useEvent } from '../hooks/use-event';
import { CalendarForm } from '../calendar-form';
import { useCalendar } from '../hooks/use-calendar';
import { CalendarToolbar } from '../calendar-toolbar';
import { CalendarFilters } from '../calendar-filters';
import { CalendarFiltersResult } from '../calendar-filters-result';

// ----------------------------------------------------------------------

export function CalendarView() {
  const theme = useTheme();
  const { userProfile: currentAuthUser } = useAuth();

  const openFilters = useBoolean();

  const { events, eventsLoading } = useGetEvents();

  const filters = useSetState({ colors: [], startDate: null, endDate: null });
  const { state: currentFilters } = filters;

  const dateError = fIsAfter(currentFilters.startDate, currentFilters.endDate);

  const {
    calendarRef,
    /********/
    view,
    date,
    /********/
    onDatePrev,
    onDateNext,
    onDateToday,
    onDropEvent,
    onChangeView,
    onSelectRange,
    onClickEvent,
    onResizeEvent,
    onInitialView,
    /********/
    openForm,
    onOpenForm,
    onCloseForm,
    /********/
    selectEventId,
    selectedRange,
    /********/
    onClickEventInFilters,
  } = useCalendar();

  const currentEvent = useEvent(events, selectEventId, selectedRange, openForm);

  useEffect(() => {
    onInitialView();
  }, [onInitialView]);

  const canReset =
    currentFilters.colors.length > 0 || (!!currentFilters.startDate && !!currentFilters.endDate);

  const dataFiltered = applyFilter({
    inputData: events,
    filters: currentFilters,
    dateError,
  });

  const renderResults = () => (
    <CalendarFiltersResult
      filters={filters}
      totalResults={dataFiltered.length}
      sx={{ mb: { xs: 3, md: 5 } }}
    />
  );

  const flexStyles = {
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
  };

  // Check if user can modify the given event (creator or super_admin)
  const canModifyEvent = (eventId) => {
    if (!eventId || !events.length) return false;
    if (!currentAuthUser) return false;

    const event = events.find((e) => e.id === eventId);
    if (!event) return false;

    // Déterminer l'ID de l'utilisateur courant pour la comparaison
    const currentUserId = currentAuthUser.userId || currentAuthUser.uid || currentAuthUser.id || '';

    // Vérifier si l'utilisateur est super_admin ou le créateur
    return currentAuthUser?.role === 'super_admin' || event.userId === currentUserId;
  };

  return (
    <>
      <DashboardContent maxWidth="xl" sx={{ ...flexStyles }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: { xs: 3, md: 5 },
          }}
        >
          <Typography variant="h4">Calendar</Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={onOpenForm}
          >
            New event
          </Button>
        </Box>

        {canReset && renderResults()}

        <Card
          sx={{
            ...flexStyles,
            minHeight: '50vh',
          }}
        >
          <CalendarRoot
            sx={{
              ...flexStyles,
              '.fc.fc-media-screen': { flex: '1 1 auto' },
            }}
          >
            <CalendarToolbar
              date={fDate(date)}
              view={view}
              canReset={canReset}
              loading={eventsLoading}
              onNextDate={onDateNext}
              onPrevDate={onDatePrev}
              onToday={onDateToday}
              onChangeView={onChangeView}
              onOpenFilters={openFilters.onTrue}
            />

            <Calendar
              weekends
              editable
              droppable
              selectable
              rerenderDelay={10}
              allDayMaintainDuration
              eventResizableFromStart
              ref={calendarRef}
              initialDate={date}
              initialView={view}
              dayMaxEventRows={3}
              eventDisplay="block"
              events={dataFiltered}
              headerToolbar={false}
              select={onSelectRange}
              eventClick={onClickEvent}
              aspectRatio={3}
              eventContent={(arg) => {
                const event = arg.event;
                const eventData = event.extendedProps;
                return (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      height: '100%',
                      width: '100%',
                      p: 0.5,
                    }}
                  >
                    {eventData.photoURL && (
                      <Box
                        component="img"
                        src={eventData.photoURL}
                        alt={eventData.userDisplayName || ''}
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          mr: 0.5,
                          objectFit: 'cover',
                          border: (t) => `solid 1px ${t.palette.background.paper}`,
                        }}
                      />
                    )}
                    <Box
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        width: 'calc(100% - 30px)',
                      }}
                    >
                      {event.title}
                    </Box>
                  </Box>
                );
              }}
              eventDrop={(arg) => {
                if (!canModifyEvent(arg.event.id)) {
                  arg.revert();
                  toast.error('Unauthorized: You do not have permission to modify this event');
                  return;
                }

                startTransition(() => {
                  // Récupérer l'événement complet
                  const eventId = arg.event.id;
                  const originalEvent = events.find((e) => e.id === eventId);

                  if (!originalEvent) {
                    arg.revert();
                    toast.error('Event not found');
                    return;
                  }

                  // Mettre à jour seulement les dates modifiées
                  const updatedEvent = {
                    ...originalEvent,
                    allDay: arg.event.allDay,
                    start: arg.event.startStr,
                    end: arg.event.endStr,
                  };

                  onDropEvent(arg, (eventData) => updateEvent(updatedEvent, currentAuthUser)).catch(
                    (error) => {
                      arg.revert();
                      toast.error(error.message || 'Error updating event');
                    }
                  );
                });
              }}
              eventResize={(arg) => {
                if (!canModifyEvent(arg.event.id)) {
                  arg.revert();
                  toast.error('Unauthorized: You do not have permission to modify this event');
                  return;
                }

                startTransition(() => {
                  // Récupérer l'événement complet
                  const eventId = arg.event.id;
                  const originalEvent = events.find((e) => e.id === eventId);

                  if (!originalEvent) {
                    arg.revert();
                    toast.error('Event not found');
                    return;
                  }

                  // Mettre à jour seulement les dates modifiées
                  const updatedEvent = {
                    ...originalEvent,
                    allDay: arg.event.allDay,
                    start: arg.event.startStr,
                    end: arg.event.endStr,
                  };

                  onResizeEvent(arg, (eventData) =>
                    updateEvent(updatedEvent, currentAuthUser)
                  ).catch((error) => {
                    arg.revert();
                    toast.error(error.message || 'Error updating event');
                  });
                });
              }}
              plugins={[
                listPlugin,
                dayGridPlugin,
                timelinePlugin,
                timeGridPlugin,
                interactionPlugin,
              ]}
            />
          </CalendarRoot>
        </Card>
      </DashboardContent>

      <Dialog
        fullWidth
        maxWidth="xs"
        open={openForm}
        onClose={onCloseForm}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: theme.transitions.duration.shortest - 80,
        }}
        PaperProps={{
          sx: {
            display: 'flex',
            overflow: 'hidden',
            flexDirection: 'column',
            '& form': {
              ...flexStyles,
              minHeight: 0,
            },
          },
        }}
      >
        <DialogTitle sx={{ minHeight: 76 }}>
          {openForm && <> {currentEvent?.id ? 'Edit' : 'Add'} event</>}
        </DialogTitle>

        <CalendarForm
          currentEvent={currentEvent}
          colorOptions={CALENDAR_COLOR_OPTIONS}
          onClose={onCloseForm}
        />
      </Dialog>

      <CalendarFilters
        events={events}
        filters={filters}
        canReset={canReset}
        dateError={dateError}
        open={openFilters.value}
        onClose={openFilters.onFalse}
        onClickEvent={onClickEventInFilters}
        colorOptions={CALENDAR_COLOR_OPTIONS}
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, filters, dateError }) {
  const { colors, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  inputData = stabilizedThis.map((el) => el[0]);

  if (colors.length) {
    inputData = inputData.filter((event) => colors.includes(event.color));
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter((event) => fIsBetween(event.start, startDate, endDate));
    }
  }

  return inputData;
}
