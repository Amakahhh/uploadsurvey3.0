// Storage utilities to prevent JSON parsing errors and extension conflicts

export const safeLocalStorage = {
  setItem: (key: string, value: string): boolean => {
    try {
      // Ensure the value is a string
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, stringValue);
      return true;
    } catch (error) {
      console.error('Error setting localStorage item:', error);
      return false;
    }
  },

  getItem: (key: string): string | null => {
    try {
      const item = localStorage.getItem(key);
      return item;
    } catch (error) {
      console.error('Error getting localStorage item:', error);
      return null;
    }
  },

  getJSONItem: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      // Check if it's already an object (to prevent "[object Object]" errors)
      if (typeof item === 'object') {
        console.warn('localStorage item is already an object, returning as is:', item);
        return item as T;
      }

      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Error parsing JSON from localStorage:', error);
      // Clean up corrupted data
      try {
        localStorage.removeItem(key);
      } catch (removeError) {
        console.error('Error removing corrupted localStorage item:', removeError);
      }
      return null;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing localStorage item:', error);
      return false;
    }
  },

  clear: (): boolean => {
    try {
      // Only clear app-specific keys to avoid interfering with other apps/extensions
      const keysToKeep = ['theme', 'language']; // Add any keys you want to preserve
      const allKeys = Object.keys(localStorage);
      
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  },

  // Method to prevent extension conflicts by prefixing keys
  setAppItem: (key: string, value: string): boolean => {
    return safeLocalStorage.setItem(`surveyhustler_${key}`, value);
  },

  getAppItem: (key: string): string | null => {
    return safeLocalStorage.getItem(`surveyhustler_${key}`);
  },

  getAppJSONItem: <T>(key: string): T | null => {
    return safeLocalStorage.getJSONItem<T>(`surveyhustler_${key}`);
  },

  removeAppItem: (key: string): boolean => {
    return safeLocalStorage.removeItem(`surveyhustler_${key}`);
  }
};

// Prevent extension interference by wrapping storage access
export const protectedStorage = {
  // Create a safe wrapper that won't trigger extension events
  setUserData: (userData: any): boolean => {
    try {
      // Use a unique key format that extensions are less likely to monitor
      const key = `__SH_USER_${Date.now()}__`;
      const success = safeLocalStorage.setItem(key, JSON.stringify(userData));
      
      // Also set the regular key for compatibility
      if (success) {
        safeLocalStorage.removeItem('userData'); // Remove old one first
        safeLocalStorage.setItem('userData', JSON.stringify(userData));
      }
      
      return success;
    } catch (error) {
      console.error('Error setting protected user data:', error);
      return false;
    }
  },

  getUserData: (): any | null => {
    try {
      // Try regular key first
      let userData = safeLocalStorage.getJSONItem('userData');
      
      // If not found or corrupted, try protected keys
      if (!userData) {
        const allKeys = Object.keys(localStorage);
        const protectedKeys = allKeys.filter(key => key.startsWith('__SH_USER_') && key.endsWith('__'));
        
        if (protectedKeys.length > 0) {
          // Get the most recent one
          const latestKey = protectedKeys.sort().pop();
          if (latestKey) {
            userData = safeLocalStorage.getJSONItem(latestKey);
          }
        }
      }
      
      return userData;
    } catch (error) {
      console.error('Error getting protected user data:', error);
      return null;
    }
  },

  clearUserData: (): boolean => {
    try {
      // Clear regular keys
      safeLocalStorage.removeItem('userData');
      safeLocalStorage.removeItem('jwtToken');
      safeLocalStorage.removeItem('refreshToken');
      
      // Clear protected keys
      const allKeys = Object.keys(localStorage);
      const protectedKeys = allKeys.filter(key => key.startsWith('__SH_USER_') && key.endsWith('__'));
      protectedKeys.forEach(key => {
        safeLocalStorage.removeItem(key);
      });
      
      return true;
    } catch (error) {
      console.error('Error clearing protected user data:', error);
      return false;
    }
  }
};