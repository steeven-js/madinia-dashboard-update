import { useMemo, useState, useEffect } from 'react';

import {
  usePost,
  addPost,
  updatePost,
  deletePost,
  getAllPosts,
  usePostByTitle,
  searchPostByTitle,
  subscribeToPostsChanges
} from 'src/hooks/use-post';

// ----------------------------------------------------------------------

export function useGetPosts() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    // Use the real-time subscription instead of a one-time fetch
    const unsubscribe = subscribeToPostsChanges((postsData) => {
      setPosts(postsData);
      setIsLoading(false);
    });

    // Clean up the subscription when the component unmounts
    return () => {
      unsubscribe();
    };
  }, []);

  const memoizedValue = useMemo(
    () => ({
      posts: posts || [],
      postsLoading: isLoading,
      postsEmpty: !isLoading && !posts.length,
    }),
    [posts, isLoading]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetPost(id) {
  const { post, loading, error } = usePost(id);

  const memoizedValue = useMemo(
    () => ({
      post,
      postLoading: loading,
      postError: error,
    }),
    [post, error, loading]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetPostByTitle(title) {
  const { post, loading, error } = usePostByTitle(title);

  const memoizedValue = useMemo(
    () => ({
      post,
      postLoading: loading,
      postError: error,
    }),
    [post, error, loading]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetLatestPosts(limit = 5) {
  const [latestPosts, setLatestPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestPosts = async () => {
      try {
        setIsLoading(true);
        const allPosts = await getAllPosts();
        // Sort by createdAt in descending order and take only the specified limit
        const latest = allPosts
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, limit);
        setLatestPosts(latest);
      } catch (err) {
        console.error('Error fetching latest posts:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestPosts();
  }, [limit]);

  const memoizedValue = useMemo(
    () => ({
      latestPosts: latestPosts || [],
      latestPostsLoading: isLoading,
      latestPostsError: error,
      latestPostsEmpty: !isLoading && !latestPosts.length,
    }),
    [latestPosts, error, isLoading]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useSearchPosts(query) {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const searchPosts = async () => {
      if (!query || query.trim() === '') {
        setSearchResults([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const results = await searchPostByTitle(query);
        // Limit the number of results to improve performance
        setSearchResults(results.slice(0, 10));
      } catch (err) {
        console.error('Error searching posts:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    // Only search when query has at least 2 characters
    if (query && query.trim().length >= 2) {
      searchPosts();
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
export { addPost, updatePost, deletePost };
