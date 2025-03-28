import { useMemo, useState, useEffect } from 'react';

import {
  useEvent,
  addEvent,
  updateEvent,
  deleteEvent,
  getAllEvents,
  useEventByTitle,
  searchEventByTitle,
  subscribeToEventsChanges
} from 'src/hooks/use-event';

// ----------------------------------------------------------------------

export function useGetEvents() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    // Use the real-time subscription instead of a one-time fetch
    const unsubscribe = subscribeToEventsChanges((eventsData) => {
      setEvents(eventsData);
      setIsLoading(false);
    });

    // Clean up the subscription when the component unmounts
    return () => {
      unsubscribe();
    };
  }, []);

  const memoizedValue = useMemo(
    () => ({
      events: events || [],
      eventsLoading: isLoading,
      eventsEmpty: !isLoading && !events.length,
    }),
    [events, isLoading]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetEvent(id) {
  const { event, loading, error } = useEvent(id);

  const memoizedValue = useMemo(
    () => ({
      event,
      eventLoading: loading,
      eventError: error,
    }),
    [event, error, loading]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetEventByTitle(title) {
  const { event, loading, error } = useEventByTitle(title);

  const memoizedValue = useMemo(
    () => ({
      event,
      eventLoading: loading,
      eventError: error,
    }),
    [event, error, loading]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetLatestEvents(limit = 5) {
  const [latestEvents, setLatestEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestEvents = async () => {
      try {
        setIsLoading(true);
        const allEvents = await getAllEvents();
        // Sort by createdAt in descending order and take only the specified limit
        const latest = allEvents
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, limit);
        setLatestEvents(latest);
      } catch (err) {
        console.error('Error fetching latest events:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestEvents();
  }, [limit]);

  const memoizedValue = useMemo(
    () => ({
      latestEvents: latestEvents || [],
      latestEventsLoading: isLoading,
      latestEventsError: error,
      latestEventsEmpty: !isLoading && !latestEvents.length,
    }),
    [latestEvents, error, isLoading]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useSearchEvents(query) {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const searchEvents = async () => {
      if (!query || query.trim() === '') {
        setSearchResults([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const results = await searchEventByTitle(query);
        // Limit the number of results to improve performance
        setSearchResults(results.slice(0, 10));
      } catch (err) {
        console.error('Error searching events:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    // Only search when query has at least 2 characters
    if (query && query.trim().length >= 2) {
      searchEvents();
    } else {
      setSearchResults([]);
    }
  }, [query]);

  const memoizedValue = useMemo(
    () => ({
      searchResults: searchResults || [],
      searchLoading: isLoading,
      searchError: error,
      searchEmpty: !isLoading && query && query.trim().length >= 2 && !searchResults.length,
    }),
    [searchResults, error, isLoading, query]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

// Utility functions for direct use (not hooks)
export { addEvent, updateEvent, deleteEvent };
