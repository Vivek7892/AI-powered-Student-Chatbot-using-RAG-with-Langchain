import { useState, useCallback } from 'react';

export const useSearch = (data = [], searchFields = []) => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const performSearch = useCallback((query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results = data.filter(item => {
      return searchFields.some(field => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], item);
        return value?.toString().toLowerCase().includes(query.toLowerCase());
      });
    });

    setSearchResults(results);
  }, [data, searchFields]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  return {
    searchResults,
    searchQuery,
    performSearch,
    clearSearch
  };
};

// Mock search data for demonstration
export const getMockSearchData = () => [
  {
    id: 1,
    title: 'Machine Learning Fundamentals',
    type: 'Chat Session',
    date: '2 hours ago',
    content: 'Discussion about neural networks and deep learning concepts'
  },
  {
    id: 2,
    title: 'Data Structures Notes.pdf',
    type: 'Document',
    date: '1 day ago',
    content: 'Comprehensive notes on arrays, linked lists, and trees'
  },
  {
    id: 3,
    title: 'Algorithm Quiz - Sorting',
    type: 'Quiz',
    date: '3 days ago',
    content: 'Practice quiz on bubble sort, merge sort, and quick sort'
  },
  {
    id: 4,
    title: 'Study Plan - Week 5',
    type: 'Study Plan',
    date: '1 week ago',
    content: 'Personalized learning schedule for database concepts'
  },
  {
    id: 5,
    title: 'Python Programming Guide',
    type: 'Document',
    date: '2 weeks ago',
    content: 'Complete guide to Python syntax and best practices'
  }
];