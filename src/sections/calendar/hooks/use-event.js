import { useMemo } from 'react';

import { CALENDAR_COLOR_OPTIONS } from 'src/_mock/_calendar';

// ----------------------------------------------------------------------

export function useEvent(events, selectEventId, selectedRange, openForm) {
  const currentEvent = events.find((event) => event.id === selectEventId);

  const defaultValues = useMemo(
    () => {
      // Get current timestamp for default dates
      const now = Date.now();

      return {
        id: '',
        title: '',
        description: '',
        color: CALENDAR_COLOR_OPTIONS[1],
        allDay: false,
        start: selectedRange ? selectedRange.start : now,
        end: selectedRange ? selectedRange.end : now + (60 * 60 * 1000), // Default to 1 hour later
      };
    },
    [selectedRange]
  );

  if (!openForm) {
    return undefined;
  }

  if (currentEvent || selectedRange) {
    return { ...defaultValues, ...currentEvent };
  }

  return defaultValues;
}
