import { useRef, useState, useCallback } from 'react';

import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// ----------------------------------------------------------------------

export function useCalendar() {
  const calendarRef = useRef(null);
  const calendarEl = calendarRef.current;

  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  const [date, setDate] = useState(new Date());

  const [openForm, setOpenForm] = useState(false);

  const [selectEventId, setSelectEventId] = useState('');

  const [selectedRange, setSelectedRange] = useState(null);

  const [view, setView] = useState(smUp ? 'dayGridMonth' : 'listWeek');

  const onOpenForm = useCallback(() => {
    setOpenForm(true);
  }, []);

  const onCloseForm = useCallback(() => {
    setOpenForm(false);
    setSelectedRange(null);
    setSelectEventId('');
  }, []);

  const onInitialView = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      const newView = smUp ? 'dayGridMonth' : 'listWeek';
      calendarApi.changeView(newView);
      setView(newView);
    }
  }, [calendarEl, smUp]);

  const onChangeView = useCallback(
    (newView) => {
      if (calendarEl) {
        const calendarApi = calendarEl.getApi();

        calendarApi.changeView(newView);
        setView(newView);
      }
    },
    [calendarEl]
  );

  const onDateToday = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.today();
      setDate(calendarApi.getDate());
    }
  }, [calendarEl]);

  const onDatePrev = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.prev();
      setDate(calendarApi.getDate());
    }
  }, [calendarEl]);

  const onDateNext = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.next();
      setDate(calendarApi.getDate());
    }
  }, [calendarEl]);

  const onSelectRange = useCallback(
    (arg) => {
      if (calendarEl) {
        const calendarApi = calendarEl.getApi();

        calendarApi.unselect();
      }

      onOpenForm();
      // Store dates as fixed timestamps
      const start = new Date(arg.startStr).getTime();
      const end = new Date(arg.endStr).getTime();
      setSelectedRange({ start, end });
    },
    [calendarEl, onOpenForm]
  );

  const onClickEvent = useCallback(
    (arg) => {
      const { event } = arg;

      onOpenForm();
      setSelectEventId(event.id);
    },
    [onOpenForm]
  );

  const onResizeEvent = useCallback(async (arg, updateEvent) => {
    try {
      await updateEvent();
      return Promise.resolve();
    } catch (error) {
      console.error("Error in onResizeEvent:", error);
      return Promise.reject(error);
    }
  }, []);

  const onDropEvent = useCallback(async (arg, updateEvent) => {
    try {
      await updateEvent();
      return Promise.resolve();
    } catch (error) {
      console.error("Error in onDropEvent:", error);
      return Promise.reject(error);
    }
  }, []);

  const onClickEventInFilters = useCallback(
    (eventId) => {
      if (eventId) {
        onOpenForm();
        setSelectEventId(eventId);
      }
    },
    [onOpenForm]
  );

  return {
    calendarRef,
    /********/
    view,
    date,
    /********/
    onDatePrev,
    onDateNext,
    onDateToday,
    onDropEvent,
    onClickEvent,
    onChangeView,
    onSelectRange,
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
  };
}
