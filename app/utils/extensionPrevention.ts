// Utility to help prevent browser extension conflicts
// This should be imported early in the app initialization

export const preventExtensionConflicts = () => {
  if (typeof window === 'undefined') return;

  // Override console methods to filter out extension noise
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  console.error = (...args: any[]) => {
    const message = args.join(' ');
    
    // Filter out known extension-related errors
    if (
      message.includes('content.js') ||
      message.includes('viewBox: Expected number') ||
      message.includes('[object Object]') ||
      message.includes('extension') ||
      message.includes('chrome-extension://')
    ) {
      // Still log to help with debugging, but less prominently
      console.debug('Filtered extension error:', ...args);
      return;
    }
    
    originalConsoleError.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    
    // Filter out known extension-related warnings
    if (
      message.includes('content.js') ||
      message.includes('extension') ||
      message.includes('chrome-extension://')
    ) {
      console.debug('Filtered extension warning:', ...args);
      return;
    }
    
    originalConsoleWarn.apply(console, args);
  };

  // Add meta tags to help prevent extension interference
  const meta1 = document.createElement('meta');
  meta1.name = 'survey-app';
  meta1.content = 'true';
  document.head.appendChild(meta1);

  const meta2 = document.createElement('meta');
  meta2.name = 'disable-extensions';
  meta2.content = 'localStorage,dom';
  document.head.appendChild(meta2);

  // Wrap localStorage to prevent extension conflicts
  const originalSetItem = localStorage.setItem;
  const originalGetItem = localStorage.getItem;

  localStorage.setItem = function(key: string, value: string) {
    try {
      // Ensure we're storing a string, not an object
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      originalSetItem.call(this, key, stringValue);
    } catch (error) {
      console.debug('localStorage setItem error:', error);
    }
  };

  localStorage.getItem = function(key: string) {
    try {
      const value = originalGetItem.call(this, key);
      
      // Check for the problematic "[object Object]" string
      if (value === '[object Object]' || value === '[object Array]') {
        console.debug('Removing corrupted localStorage entry:', key);
        localStorage.removeItem(key);
        return null;
      }
      
      return value;
    } catch (error) {
      console.debug('localStorage getItem error:', error);
      return null;
    }
  };

  // Prevent extensions from modifying our DOM elements
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          
          // Remove extension-injected elements
          if (
            element.classList.contains('extension-') ||
            element.id?.includes('extension') ||
            element.getAttribute('data-extension')
          ) {
            console.debug('Removing extension element:', element);
            element.remove();
          }

          // Fix SVG viewBox issues
          if (element.tagName === 'SVG') {
            const viewBox = element.getAttribute('viewBox');
            if (viewBox && viewBox.includes('%')) {
              console.debug('Fixing SVG viewBox:', viewBox);
              element.setAttribute('viewBox', '0 0 100 100'); // Default fallback
            }
          }

          // Check child SVGs too
          const svgs = element.querySelectorAll('svg[viewBox*="%"]');
          svgs.forEach((svg) => {
            const viewBox = svg.getAttribute('viewBox');
            console.debug('Fixing child SVG viewBox:', viewBox);
            svg.setAttribute('viewBox', '0 0 100 100');
          });
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log('Extension conflict prevention initialized');
};

// Call this as early as possible
if (typeof window !== 'undefined') {
  preventExtensionConflicts();
}