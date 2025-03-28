import { useState, useEffect } from 'react';
import { doc, getDoc, addDoc, getDocs, updateDoc, deleteDoc, collection, onSnapshot } from 'firebase/firestore';

import { FIRESTORE } from 'src/lib/firebase';

// ----------------------------------------------------------------------

/**
 * Hook pour gérer un événement individuel
 * @param {string} id - L'identifiant de l'événement
 * @returns {Object} - Objet contenant l'événement, l'état de chargement et les erreurs
 */
export function useEvent(id) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const eventData = await getEvent(id);
        setEvent(eventData);
      } catch (err) {
        console.error('Erreur lors de la récupération de l\'événement:', err);
        setError('Impossible de charger les détails de l\'événement');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  return { event, loading, error };
}

/**
 * Hook pour gérer un article de blog par son titre
 * @param {string} title - Le titre de l'article de blog
 * @returns {Object} - Objet contenant l'article de blog, l'état de chargement et les erreurs
 */
export function useEventByTitle(title) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventByTitle = async () => {
      try {
        setLoading(true);
        const decodedTitle = decodeURIComponent(title);
        const events = await searchEventByTitle(decodedTitle);

        if (events && events.length > 0) {
          setEvent(events[0]);
        } else {
          // Try to find by kebab case match
          const allEvents = await getAllEvents();
          const foundEvent = allEvents.find(e =>
            e.title.toLowerCase().replace(/\s+/g, '-') === decodedTitle.toLowerCase()
          );

          if (foundEvent) {
            setEvent(foundEvent);
          } else {
            setError('Event not found');
          }
        }
      } catch (err) {
        console.error('Error fetching event by title:', err);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    if (title) {
      fetchEventByTitle();
    }
  }, [title]);

  return { event, loading, error };
}

// ----------------------------------------------------------------------

/**
 * Récupère un événement spécifique par son ID
 * @param {string} eventId - L'identifiant de l'événement
 * @returns {Object|null} - Les données de l'événement ou null si non trouvé
 */
export const getEvent = async (eventId) => {
  const eventDoc = await getDoc(doc(FIRESTORE, 'events', eventId));

  if (eventDoc.exists()) {
    return { id: eventDoc.id, ...eventDoc.data() };
  }

  return null;
};

/**
 * Récupère tous les événements de la base de données
 * @returns {Array} - Tableau contenant tous les événements
 */
export const getAllEvents = async () => {
  const eventsSnapshot = await getDocs(collection(FIRESTORE, 'events'));
  const events = [];

  eventsSnapshot.forEach((docSnapshot) => {
    events.push({ id: docSnapshot.id, ...docSnapshot.data() });
  });

  return events;
};

/**
 * Met à jour un événement existant
 * @param {string} eventId - L'identifiant de l'événement à mettre à jour
 * @param {Object} eventData - Les nouvelles données de l'événement
 */
export const updateEvent = async (eventId, eventData) => {
  const eventDocRef = doc(FIRESTORE, 'events', eventId);
  await updateDoc(eventDocRef, eventData);
};


/**
 * Supprime un événement existant
 * @param {string} eventId - L'identifiant de l'événement à supprimer
 */
export const deleteEvent = async (eventId) => {
  const eventDocRef = doc(FIRESTORE, 'events', eventId);
  await deleteDoc(eventDocRef);
};

/**
 * Ajoute un nouvel événement à la base de données
 * @param {Object} eventData - Les données de l'événement à ajouter
 * @returns {string} - L'identifiant de l'événement créé
 */
export const addEvent = async (eventData) => {
  const eventRef = await addDoc(collection(FIRESTORE, 'events'), eventData);
  return eventRef.id;
};

/**
 * Recherche un événement par son titre
 * @param {string} title - Le titre de l'événement à rechercher
 * @returns {Array} - Tableau des événements correspondants au titre
 */
export const searchEventByTitle = async (title) => {
  if (!title || title.trim() === '') {
    return [];
  }

  // Get all posts
  const eventsSnapshot = await getDocs(collection(FIRESTORE, 'events'));
  const events = [];

  // Filter posts that contain the search term in their title (case insensitive)
  eventsSnapshot.forEach((docSnapshot) => {
    const event = { id: docSnapshot.id, ...docSnapshot.data() };
    if (event.title && event.title.toLowerCase().includes(title.toLowerCase())) {
      events.push(event);
    }
  });

  return events;
};

/**
 * Subscribe to events collection changes with real-time updates
 * @param {function} callback - A callback function that will be called with the latest posts data
 * @returns {function} - Unsubscribe function to stop listening to changes
 */
export const subscribeToEventsChanges = (callback) => {
  const eventsCollection = collection(FIRESTORE, 'events');

  // Setting up the real-time listener
  const unsubscribe = onSnapshot(eventsCollection, (snapshot) => {
    const events = [];
    snapshot.forEach((docSnapshot) => {
      events.push({ id: docSnapshot.id, ...docSnapshot.data() });
    });
    callback(events);
  }, (error) => {
    console.error('Error listening to events collection:', error);
  });

  // Return the unsubscribe function to be called when we want to stop listening
  return unsubscribe;
};
