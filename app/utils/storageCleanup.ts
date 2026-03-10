// Script to help clear potentially problematic localStorage data
// This can be run in the browser console if needed

const clearProblematicStorage = () => {
  try {
    console.log('Clearing potentially problematic localStorage data...');
    
    // Get all keys
    const allKeys = Object.keys(localStorage);
    let clearedCount = 0;
    
    // Look for keys that might contain objects instead of strings
    allKeys.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        
        // Check if the value looks like "[object Object]"
        if (value === '[object Object]' || value === '[object Array]') {
          console.log(`Removing problematic key: ${key} with value: ${value}`);
          localStorage.removeItem(key);
          clearedCount++;
        }
        
        // Try to parse as JSON - if it fails and it's not a simple string, remove it
        if (value && typeof value === 'string' && value.length > 0) {
          if (value.startsWith('{') || value.startsWith('[')) {
            try {
              JSON.parse(value);
            } catch (e) {
              console.log(`Removing unparseable JSON key: ${key}`);
              localStorage.removeItem(key);
              clearedCount++;
            }
          }
        }
      } catch (error) {
        console.log(`Error processing key ${key}:`, error);
        // If there's an error accessing a key, try to remove it
        try {
          localStorage.removeItem(key);
          clearedCount++;
        } catch (removeError) {
          console.log(`Failed to remove problematic key ${key}:`, removeError);
        }
      }
    });
    
    console.log(`Cleared ${clearedCount} problematic localStorage entries`);
    
    // Also clear any auth-related data that might be corrupted
    ['jwtToken', 'refreshToken', 'userData'].forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`Cleared auth key: ${key}`);
      }
    });
    
    console.log('Storage cleanup completed');
    return true;
  } catch (error) {
    console.error('Error during storage cleanup:', error);
    return false;
  }
};

// Export for use in development
if (typeof window !== 'undefined') {
  (window as any).clearProblematicStorage = clearProblematicStorage;
}

export { clearProblematicStorage };