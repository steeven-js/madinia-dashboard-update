import { useState, useEffect } from 'react';
import { doc, getDoc, addDoc, getDocs, updateDoc, deleteDoc, collection, onSnapshot } from 'firebase/firestore';

import { FIRESTORE } from 'src/lib/firebase';

// ----------------------------------------------------------------------

/**
 * Hook pour gérer un article de blog individuel
 * @param {string} id - L'identifiant de l'article de blog
 * @returns {Object} - Objet contenant l'article de blog, l'état de chargement et les erreurs
 */
export function usePost(id) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const postData = await getPost(id);
        setPost(postData);
      } catch (err) {
        console.error('Erreur lors de la récupération de l\'article de blog:', err);
        setError('Impossible de charger les détails de l\'article de blog');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  return { post, loading, error };
}

/**
 * Hook pour gérer un article de blog par son titre
 * @param {string} title - Le titre de l'article de blog
 * @returns {Object} - Objet contenant l'article de blog, l'état de chargement et les erreurs
 */
export function usePostByTitle(title) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPostByTitle = async () => {
      try {
        setLoading(true);
        const decodedTitle = decodeURIComponent(title);
        const posts = await searchPostByTitle(decodedTitle);

        if (posts && posts.length > 0) {
          setPost(posts[0]);
        } else {
          // Try to find by kebab case match
          const allPosts = await getAllPosts();
          const foundPost = allPosts.find(p =>
            p.title.toLowerCase().replace(/\s+/g, '-') === decodedTitle.toLowerCase()
          );

          if (foundPost) {
            setPost(foundPost);
          } else {
            setError('Post not found');
          }
        }
      } catch (err) {
        console.error('Error fetching post by title:', err);
        setError('Failed to load post details');
      } finally {
        setLoading(false);
      }
    };

    if (title) {
      fetchPostByTitle();
    }
  }, [title]);

  return { post, loading, error };
}

// ----------------------------------------------------------------------

/**
 * Récupère un article de blog spécifique par son ID
 * @param {string} postId - L'identifiant de l'article de blog
 * @returns {Object|null} - Les données de l'article de blog ou null si non trouvé
 */
export const getPost = async (postId) => {
  const postDoc = await getDoc(doc(FIRESTORE, 'posts', postId));

  if (postDoc.exists()) {
    return { id: postDoc.id, ...postDoc.data() };
  }

  return null;
};

/**
 * Récupère tous les articles de blog de la base de données
 * @returns {Array} - Tableau contenant tous les articles de blog
 */
export const getAllPosts = async () => {
  const postsSnapshot = await getDocs(collection(FIRESTORE, 'posts'));
  const posts = [];

  postsSnapshot.forEach((docSnapshot) => {
    posts.push({ id: docSnapshot.id, ...docSnapshot.data() });
  });

  return posts;
};

/**
 * Met à jour un article de blog existant
 * @param {string} postId - L'identifiant de l'article de blog à mettre à jour
 * @param {Object} postData - Les nouvelles données de l'article de blog
 */
export const updatePost = async (postId, postData) => {
  const postDocRef = doc(FIRESTORE, 'posts', postId);
  await updateDoc(postDocRef, postData);
};


/**
 * Supprime un article de blog existant
 * @param {string} postId - L'identifiant de l'article de blog à supprimer
 */
export const deletePost = async (postId) => {
  const postDocRef = doc(FIRESTORE, 'posts', postId);
  await deleteDoc(postDocRef);
};

/**
 * Ajoute un nouvel article de blog à la base de données
 * @param {Object} postData - Les données de l'article de blog à ajouter
 * @returns {string} - L'identifiant de l'article de blog créé
 */
export const addPost = async (postData) => {
  const postRef = await addDoc(collection(FIRESTORE, 'posts'), postData);
  return postRef.id;
};

/**
 * Recherche un article de blog par son titre
 * @param {string} title - Le titre de l'article de blog à rechercher
 * @returns {Array} - Tableau des articles de blog correspondants au titre
 */
export const searchPostByTitle = async (title) => {
  if (!title || title.trim() === '') {
    return [];
  }

  // Get all posts
  const postsSnapshot = await getDocs(collection(FIRESTORE, 'posts'));
  const posts = [];

  // Filter posts that contain the search term in their title (case insensitive)
  postsSnapshot.forEach((docSnapshot) => {
    const post = { id: docSnapshot.id, ...docSnapshot.data() };
    if (post.title && post.title.toLowerCase().includes(title.toLowerCase())) {
      posts.push(post);
    }
  });

  return posts;
};

/**
 * Subscribe to posts collection changes with real-time updates
 * @param {function} callback - A callback function that will be called with the latest posts data
 * @returns {function} - Unsubscribe function to stop listening to changes
 */
export const subscribeToPostsChanges = (callback) => {
  const postsCollection = collection(FIRESTORE, 'posts');

  // Setting up the real-time listener
  const unsubscribe = onSnapshot(postsCollection, (snapshot) => {
    const posts = [];
    snapshot.forEach((docSnapshot) => {
      posts.push({ id: docSnapshot.id, ...docSnapshot.data() });
    });
    callback(posts);
  }, (error) => {
    console.error('Error listening to posts collection:', error);
  });

  // Return the unsubscribe function to be called when we want to stop listening
  return unsubscribe;
};
