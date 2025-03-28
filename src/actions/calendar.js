import { useMemo, useState, useEffect } from 'react';
import {
  query,
  addDoc,
  getDoc,
  orderBy,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  doc as firestoreDoc,
} from 'firebase/firestore';

import { db } from 'src/utils/firebase';

// ----------------------------------------------------------------------

export function useGetEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const eventsRef = collection(db, 'calendar-events');
    const q = query(eventsRef, orderBy('start'));

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const fetchedEvents = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          textColor: doc.data().color // Ensure the color is set as textColor
        }));
        setEvents(fetchedEvents);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const memoizedValue = useMemo(() => ({
    events: events || [],
    eventsLoading: loading,
    eventsError: error,
    eventsValidating: false,
    eventsEmpty: !loading && events.length === 0,
  }), [events, loading, error]);

  return memoizedValue;
}

// ----------------------------------------------------------------------

export async function createEvent(eventData, currentAuthUser) {
  try {
    if (!currentAuthUser) {
      throw new Error('No authenticated user found');
    }

    const eventsRef = collection(db, 'calendar-events');

    // Exclure l'id du client qui sera remplacé par l'id généré par Firestore
    // eslint-disable-next-line no-unused-vars
    const { id, ...dataToSave } = eventData;

    // Déterminer l'ID de l'utilisateur
    const userId = currentAuthUser.userId || currentAuthUser.uid || currentAuthUser.id || '';

    // Ensure dates are stored as fixed timestamps regardless of timezone
    const start = new Date(dataToSave.start).getTime();
    const end = new Date(dataToSave.end).getTime();

    const enrichedData = {
      ...dataToSave,
      start,
      end,
      userId,
      userDisplayName: currentAuthUser.displayName || 'Anonymous',
      photoURL: currentAuthUser.avatarUrl || '',
      userEmail: currentAuthUser.email || '',
      userRole: currentAuthUser.role || 'user',
      createdAt: Date.now(),
    };

    const docRef = await addDoc(eventsRef, enrichedData);

    return {
      ...enrichedData,
      id: docRef.id,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error("Error creating event: ", error);
    throw error;
  }
}

// ----------------------------------------------------------------------

export async function updateEvent(eventData, currentAuthUser) {
  try {
    // Extract event properties
    const { id: eventId, ...dataToUpdate } = eventData;

    if (!eventId) {
      throw new Error("Event ID is missing");
    }

    if (!currentAuthUser) {
      throw new Error('No authenticated user found');
    }

    // Retrieve the event to check permissions and get original data
    const eventRef = firestoreDoc(db, 'calendar-events', eventId);
    const eventDoc = await getDoc(eventRef);

    if (!eventDoc.exists()) {
      throw new Error('Event not found');
    }

    const originalEvent = eventDoc.data();

    // Déterminer l'ID de l'utilisateur pour les permissions et les modifications
    // Nous cherchons toutes les variations possibles de l'ID dans l'objet currentAuthUser
    const currentUserId = currentAuthUser.userId || currentAuthUser.uid || currentAuthUser.id || '';

    // Check if the user is the creator or a super_admin
    const isSuperAdmin = currentAuthUser.role === 'super_admin';
    const isCreator = originalEvent.userId === currentUserId;

    if (!isSuperAdmin && !isCreator) {
      throw new Error('Unauthorized: You do not have permission to update this event');
    }

    // Ensure dates are stored as fixed timestamps regardless of timezone
    const start = dataToUpdate.start ? new Date(dataToUpdate.start).getTime() : originalEvent.start;
    const end = dataToUpdate.end ? new Date(dataToUpdate.end).getTime() : originalEvent.end;

    // Make sure we preserve creator information
    const userId = originalEvent.userId || currentUserId;
    const userDisplayName = originalEvent.userDisplayName || currentAuthUser.displayName || 'Anonymous';
    const photoURL = originalEvent.photoURL || currentAuthUser.avatarUrl || '';
    const userEmail = originalEvent.userEmail || currentAuthUser.email;
    const userRole = originalEvent.userRole || currentAuthUser.role;
    const createdAt = originalEvent.createdAt || Date.now();

    // Valeurs pour les modifications
    const lastModifiedBy = currentUserId || userId || '';
    const lastModifiedByName = currentAuthUser.displayName || 'Anonymous';
    const lastModifiedByRole = currentAuthUser.role || 'user';

    // Preserve the creator's information and update only what changed
    const enrichedData = {
      ...originalEvent,
      ...dataToUpdate,
      start,
      end,
      // Keep original creator information
      userId,
      userDisplayName,
      photoURL,
      userEmail,
      userRole,
      createdAt,
      // Add modification information
      updatedAt: Date.now(),
      lastModifiedBy,
      lastModifiedByName,
      lastModifiedByRole,
    };

    await updateDoc(eventRef, enrichedData);

    return {
      ...enrichedData,
      id: eventId,
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error("Error updating event: ", error);
    throw error;
  }
}

// ----------------------------------------------------------------------

export async function deleteEvent(eventId, currentAuthUser) {
  try {
    if (!eventId) {
      throw new Error("Event ID is missing");
    }

    if (!currentAuthUser) {
      throw new Error('No authenticated user found');
    }

    // Déterminer l'ID de l'utilisateur
    const currentUserId = currentAuthUser.userId || currentAuthUser.uid || currentAuthUser.id || '';

    // Retrieve the event to check permissions
    const eventRef = firestoreDoc(db, 'calendar-events', eventId);
    const eventDoc = await getDoc(eventRef);

    if (!eventDoc.exists()) {
      throw new Error('Event not found');
    }

    const eventData = eventDoc.data();

    // Check if the user is the creator or a super_admin
    const isSuperAdmin = currentAuthUser.role === 'super_admin';
    const isCreator = eventData.userId === currentUserId;

    if (!isSuperAdmin && !isCreator) {
      throw new Error('Unauthorized: You do not have permission to delete this event');
    }

    await deleteDoc(eventRef);
  } catch (error) {
    console.error("Error deleting event: ", error);
    throw error;
  }
}
