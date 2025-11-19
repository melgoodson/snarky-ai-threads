import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Generate or retrieve session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Detect device type
const getDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

// Detect browser
const getBrowser = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  if (ua.includes('Opera')) return 'Opera';
  return 'Unknown';
};

// Detect OS
const getOS = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Win')) return 'Windows';
  if (ua.includes('Mac')) return 'MacOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Unknown';
};

// Get screen resolution
const getScreenResolution = (): string => {
  return `${window.screen.width}x${window.screen.height}`;
};

export const useAnalytics = () => {
  const location = useLocation();
  const sessionId = getSessionId();
  const pageStartTime = useRef<number>(Date.now());
  const maxScrollDepth = useRef<number>(0);
  const isFirstPage = useRef<boolean>(!sessionStorage.getItem('analytics_page_visited'));

  // Track page view
  const trackPageView = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('analytics_events').insert({
        event_type: 'page_view',
        page_url: location.pathname,
        user_id: user?.id || null,
        session_id: sessionId,
        device_type: getDeviceType(),
        browser: getBrowser(),
        os: getOS(),
        screen_resolution: getScreenResolution(),
        referrer: document.referrer || null,
        entry_page: isFirstPage.current,
      });

      // Update session
      const { data: existingSession } = await supabase
        .from('analytics_sessions')
        .select('id, page_count')
        .eq('session_id', sessionId)
        .single();

      if (existingSession) {
        await supabase
          .from('analytics_sessions')
          .update({
            page_count: (existingSession.page_count || 0) + 1,
            exit_page: location.pathname,
          })
          .eq('session_id', sessionId);
      } else {
        await supabase.from('analytics_sessions').insert({
          session_id: sessionId,
          user_id: user?.id || null,
          device_type: getDeviceType(),
          browser: getBrowser(),
          os: getOS(),
          entry_page: location.pathname,
          referrer: document.referrer || null,
          page_count: 1,
        });
      }

      sessionStorage.setItem('analytics_page_visited', 'true');
      isFirstPage.current = false;
    } catch (error) {
      console.debug('Analytics tracking failed:', error);
    }
  }, [location.pathname, sessionId]);

  // Track page exit (time on page, scroll depth)
  const trackPageExit = useCallback(async () => {
    try {
      const timeOnPage = Math.floor((Date.now() - pageStartTime.current) / 1000);
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from('analytics_events').insert({
        event_type: 'page_exit',
        page_url: location.pathname,
        user_id: user?.id || null,
        session_id: sessionId,
        time_on_page: timeOnPage,
        scroll_depth: maxScrollDepth.current,
        exit_page: true,
      });
    } catch (error) {
      console.debug('Page exit tracking failed:', error);
    }
  }, [location.pathname, sessionId]);

  // Track clicks
  const trackClick = useCallback(async (element: HTMLElement) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from('analytics_events').insert({
        event_type: 'click',
        page_url: location.pathname,
        user_id: user?.id || null,
        session_id: sessionId,
        element_id: element.id || null,
        element_class: element.className || null,
        element_text: element.textContent?.slice(0, 100) || null,
      });
    } catch (error) {
      console.debug('Click tracking failed:', error);
    }
  }, [location.pathname, sessionId]);

  // Track scroll depth
  const updateScrollDepth = useCallback(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
    
    if (scrollPercent > maxScrollDepth.current) {
      maxScrollDepth.current = scrollPercent;
    }
  }, []);

  // Track custom event
  const trackEvent = useCallback(async (eventType: string, eventData?: Record<string, any>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from('analytics_events').insert({
        event_type: eventType,
        page_url: location.pathname,
        user_id: user?.id || null,
        session_id: sessionId,
        event_data: eventData || {},
      });
    } catch (error) {
      console.debug('Custom event tracking failed:', error);
    }
  }, [location.pathname, sessionId]);

  // Initialize tracking on page load
  useEffect(() => {
    pageStartTime.current = Date.now();
    maxScrollDepth.current = 0;
    trackPageView();

    // Track scroll
    const handleScroll = () => updateScrollDepth();
    window.addEventListener('scroll', handleScroll);

    // Track page exit
    return () => {
      window.removeEventListener('scroll', handleScroll);
      trackPageExit();
    };
  }, [location.pathname, trackPageView, trackPageExit, updateScrollDepth]);

  // End session on page unload
  useEffect(() => {
    const handleUnload = async () => {
      const sessionStart = sessionStorage.getItem('analytics_session_start');
      if (sessionStart) {
        const duration = Math.floor((Date.now() - parseInt(sessionStart)) / 1000);
        
        await supabase
          .from('analytics_sessions')
          .update({
            ended_at: new Date().toISOString(),
            duration,
            is_active: false,
          })
          .eq('session_id', sessionId);
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [sessionId]);

  return {
    trackClick,
    trackEvent,
  };
};
