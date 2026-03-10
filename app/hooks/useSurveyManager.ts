import { useState, useEffect } from 'react';
import { CreateSurveyResponse } from '../services/api';
import { safeLocalStorage } from '../utils/storageUtils';

interface UseSurveyManagerReturn {
  surveys: CreateSurveyResponse[];
  loading: boolean;
  error: string | null;
  currentView: 'dashboard' | 'create';
  addSurvey: (survey: CreateSurveyResponse) => void;
  setCurrentView: (view: 'dashboard' | 'create') => void;
  refreshSurveys: () => void;
}

export const useSurveyManager = (): UseSurveyManagerReturn => {
  const [surveys, setSurveys] = useState<CreateSurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'create'>('create');

  // Load surveys from localStorage on mount
  useEffect(() => {
    refreshSurveys();
  }, []);

  const refreshSurveys = () => {
    setLoading(true);
    setError(null);
    
    try {
      const storedSurveys = safeLocalStorage.getJSONItem('user_surveys');
      const surveysArray = Array.isArray(storedSurveys) ? storedSurveys as CreateSurveyResponse[] : [];
      setSurveys(surveysArray);
      
      // If user has surveys, show dashboard by default
      if (surveysArray.length > 0) {
        setCurrentView('dashboard');
      }
    } catch (err) {
      console.error('Error loading surveys:', err);
      setError('Failed to load surveys');
      setSurveys([]);
    } finally {
      setLoading(false);
    }
  };

  const addSurvey = (survey: CreateSurveyResponse) => {
    try {
      const updatedSurveys = [survey, ...surveys];
      setSurveys(updatedSurveys);
      
      // Store in localStorage
      safeLocalStorage.setItem('user_surveys', JSON.stringify(updatedSurveys));
      
      // Switch to dashboard after creating a survey
      setCurrentView('dashboard');
    } catch (err) {
      console.error('Error adding survey:', err);
      setError('Failed to save survey');
    }
  };

  return {
    surveys,
    loading,
    error,
    currentView,
    addSurvey,
    setCurrentView,
    refreshSurveys
  };
};