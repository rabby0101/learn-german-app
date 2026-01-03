import { useEffect, useCallback } from 'react';

export const usePerformanceOptimization = () => {
  // Debounce utility
  const debounce = useCallback((fn: Function, ms: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), ms);
    };
  }, []);

  useEffect(() => {
    // Enable Chrome-specific performance optimizations
    const optimizeForChrome = () => {
      // Optimize font rendering
      document.body.style.cssText += `
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
      `;

      // Preconnect to external resources
      const preconnectUrls = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://api.deepseek.com'
      ];

      preconnectUrls.forEach(url => {
        if (!document.querySelector(`link[href="${url}"]`)) {
          const link = document.createElement('link');
          link.rel = 'preconnect';
          link.href = url;
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);
        }
      });
    };

    // Optimize images with lazy loading
    const optimizeImages = () => {
      document.querySelectorAll('img:not([loading])').forEach(img => {
        img.setAttribute('loading', 'lazy');
        img.setAttribute('decoding', 'async');
      });
    };

    // Use Intersection Observer for lazy rendering hints
    const setupIntersectionObserver = () => {
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach(entry => {
              const target = entry.target as HTMLElement;
              if (entry.isIntersecting) {
                // Element is visible - prioritize rendering
                target.style.setProperty('content-visibility', 'auto');
              } else {
                // Element is not visible - skip rendering
                target.style.setProperty('content-visibility', 'hidden');
              }
            });
          },
          { rootMargin: '100px' } // Start loading slightly before visible
        );

        // Observe heavy content sections
        document.querySelectorAll('.lazy-section').forEach(el => {
          observer.observe(el);
        });

        return () => observer.disconnect();
      }
    };

    // Apply optimizations after initial render
    const timeoutId = setTimeout(() => {
      optimizeForChrome();
      optimizeImages();
      setupIntersectionObserver();
    }, 100);

    // Optimized scroll handler using passive listener and RAF
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Trigger any scroll-based optimizations here
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Optimize resize events
    const handleResize = debounce(() => {
      // Trigger any resize-based optimizations
    }, 150);

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [debounce]);

  // Reduce re-renders by monitoring performance only in development
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    if ('performance' in window && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.duration > 100) { // Only log slow operations
            console.log(`⚠️ Performance: ${entry.name} - ${entry.duration.toFixed(2)}ms`);
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['measure', 'longtask'] });
      } catch (e) {
        // longtask may not be supported in all browsers
        observer.observe({ entryTypes: ['measure'] });
      }

      return () => observer.disconnect();
    }
  }, []);
};

// Export a utility for marking performance-critical sections
export const startMeasure = (name: string) => {
  if (process.env.NODE_ENV === 'development' && 'performance' in window) {
    performance.mark(`${name}-start`);
  }
};

export const endMeasure = (name: string) => {
  if (process.env.NODE_ENV === 'development' && 'performance' in window) {
    performance.mark(`${name}-end`);
    try {
      performance.measure(name, `${name}-start`, `${name}-end`);
    } catch (e) {
      // Marks may not exist
    }
  }
};