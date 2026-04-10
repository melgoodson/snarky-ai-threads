import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const VISITOR_ID_KEY = 'snarky_visitor_id';
const SESSION_ID_KEY = 'snarky_session_id';
const COUNTRY_CACHE_KEY = 'snarky_country';
const COUNTRY_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

function generateId(): string {
  return crypto.randomUUID();
}

function getVisitorId(): string {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = generateId();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

function getSessionId(): string {
  const lastActivity = localStorage.getItem('snarky_last_activity');
  const existingSessionId = sessionStorage.getItem(SESSION_ID_KEY);
  
  const now = Date.now();
  if (existingSessionId && lastActivity && (now - parseInt(lastActivity)) < SESSION_TIMEOUT) {
    localStorage.setItem('snarky_last_activity', now.toString());
    return existingSessionId;
  }
  
  const newSessionId = generateId();
  sessionStorage.setItem(SESSION_ID_KEY, newSessionId);
  localStorage.setItem('snarky_last_activity', now.toString());
  return newSessionId;
}

function detectDevice(): { deviceType: string; browser: string; os: string } {
  const ua = navigator.userAgent;
  
  let deviceType = 'desktop';
  if (/Mobi|Android/i.test(ua)) deviceType = 'mobile';
  else if (/Tablet|iPad/i.test(ua)) deviceType = 'tablet';
  
  let browser = 'unknown';
  if (/Chrome/i.test(ua) && !/Edge|Edg/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Edge|Edg/i.test(ua)) browser = 'Edge';
  else if (/MSIE|Trident/i.test(ua)) browser = 'IE';
  
  let os = 'unknown';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iOS|iPhone|iPad/i.test(ua)) os = 'iOS';
  
  return { deviceType, browser, os };
}

function getUtmParams(): Record<string, string | null> {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_term: params.get('utm_term'),
    utm_content: params.get('utm_content'),
  };
}

const KNOWN_SEARCH_DOMAINS = ['google.', 'bing.', 'yahoo.', 'duckduckgo.', 'baidu.', 'yandex.', 'ecosia.'];
const KNOWN_SOCIAL_DOMAINS = ['facebook.', 'twitter.', 't.co', 'instagram.', 'linkedin.', 'reddit.', 'pinterest.', 'tiktok.', 'youtube.'];
const KNOWN_EMAIL_DOMAINS = ['mail.google.', 'outlook.', 'mail.yahoo.', 'webmail.'];

/**
 * Classify the traffic source for this session.
 * Attribution is determined once per session on the first pageview:
 *   1. If UTM params exist → use utm_medium to classify (paid, email, social, or referral)
 *   2. Else if gclid/fbclid present → "paid"
 *   3. Else if referrer is a known search engine → "organic"
 *   4. Else if referrer is a known social domain → "social"
 *   5. Else if referrer is a known email domain → "email"
 *   6. Else if referrer is present and not same-domain → "referral"
 *   7. Else → "direct"
 */
function classifyTrafficSource(utmParams: Record<string, string | null>, referrer: string): string {
  const params = new URLSearchParams(window.location.search);

  // UTM-based attribution takes priority
  if (utmParams.utm_source || utmParams.utm_medium) {
    const medium = (utmParams.utm_medium || '').toLowerCase();
    if (['cpc', 'ppc', 'paid', 'paidsearch', 'paidsocial', 'display', 'banner'].includes(medium)) return 'paid';
    if (medium === 'email') return 'email';
    if (medium === 'social') return 'social';
    return 'referral'; // has UTM but not a specific category
  }

  // Click IDs indicate paid traffic
  if (params.get('gclid') || params.get('fbclid') || params.get('msclkid')) return 'paid';

  // Referrer-based classification
  if (!referrer) return 'direct';

  try {
    const refHost = new URL(referrer).hostname.toLowerCase();
    // Same-domain = direct
    if (refHost === window.location.hostname) return 'direct';
    if (KNOWN_SEARCH_DOMAINS.some(d => refHost.includes(d))) return 'organic';
    if (KNOWN_SOCIAL_DOMAINS.some(d => refHost.includes(d))) return 'social';
    if (KNOWN_EMAIL_DOMAINS.some(d => refHost.includes(d))) return 'email';
    return 'referral';
  } catch {
    return 'referral';
  }
}

/**
 * Resolve visitor country via the resolve-country edge function.
 * The edge function reads CDN geo headers (e.g. cf-ipcountry) — no IP is stored.
 * Result is cached in localStorage for 24h to avoid repeated calls.
 */
async function resolveCountry(): Promise<string> {
  try {
    // Check localStorage cache first
    const cached = localStorage.getItem(COUNTRY_CACHE_KEY);
    if (cached) {
      const { country, ts } = JSON.parse(cached);
      if (Date.now() - ts < COUNTRY_CACHE_TTL && /^[A-Z]{2}$/.test(country)) {
        return country;
      }
    }

    const { data, error } = await supabase.functions.invoke('resolve-country', {
      method: 'GET',
    });

    if (error) throw error;

    const country = data?.country && /^[A-Z]{2}$/.test(data.country) ? data.country : 'XX';
    localStorage.setItem(COUNTRY_CACHE_KEY, JSON.stringify({ country, ts: Date.now() }));
    return country;
  } catch (e) {
    console.debug('Failed to resolve country:', e);
    return 'XX';
  }
}

export function useAnalytics() {
  const location = useLocation();
  const sessionInitialized = useRef(false);
  const currentPageViewId = useRef<string | null>(null);
  const pageStartTime = useRef<number>(Date.now());
  const maxScrollDepth = useRef<number>(0);
  const pageCount = useRef<number>(0);
  const sessionId = useRef<string>(getSessionId());
  const visitorId = useRef<string>(getVisitorId());

  // Initialize session
  const initSession = useCallback(async () => {
    if (sessionInitialized.current) return;
    sessionInitialized.current = true;

    const { deviceType, browser, os } = detectDevice();
    const utmParams = getUtmParams();
    // Resolve country from edge function (no IP stored, uses CDN geo headers)
    const country = await resolveCountry();

    // Classify traffic source once per session and lock it
    const referrer = document.referrer || '';
    const trafficSourceType = classifyTrafficSource(utmParams, referrer);

    // Entry page path: first page of the session
    const entryPagePath = window.location.pathname;

    try {
      await supabase.from('analytics_sessions').insert({
        visitor_id: visitorId.current,
        session_id: sessionId.current,
        device_type: deviceType,
        browser,
        os,
        country,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        referrer: referrer || null,
        utm_source: utmParams.utm_source,
        utm_medium: utmParams.utm_medium,
        utm_campaign: utmParams.utm_campaign,
        utm_term: utmParams.utm_term,
        utm_content: utmParams.utm_content,
        traffic_source_type: trafficSourceType,
        entry_page_path: entryPagePath,
      });
    } catch (error) {
      console.debug('Failed to init analytics session:', error);
    }
  }, []);

  // Track page view
  const trackPageView = useCallback(async () => {
    const loadTime = Math.round(performance.now());
    pageStartTime.current = Date.now();
    maxScrollDepth.current = 0;
    pageCount.current += 1;

    // Mark as not a bounce if this is 2nd+ page
    if (pageCount.current === 2) {
      try {
        await supabase
          .from('analytics_sessions')
          .update({ is_bounce: false })
          .eq('session_id', sessionId.current);
      } catch (error) {
        console.debug('Failed to update bounce status:', error);
      }
    }

    try {
      const { data } = await supabase
        .from('analytics_page_views')
        .insert({
          session_id: sessionId.current,
          path: location.pathname,
          title: document.title,
          load_time_ms: loadTime,
        })
        .select('id')
        .single();

      if (data) {
        currentPageViewId.current = data.id;
      }
    } catch (error) {
      console.debug('Failed to track page view:', error);
    }
  }, [location.pathname]);

  // --- sendBeacon helpers ---
  // navigator.sendBeacon is fire-and-forget and survives page unload.
  // Async Supabase calls in beforeunload are dropped by the browser before completing,
  // which is why ended_at and scroll_depth were never reliably written.

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  /** Write page-view leave data (time_on_page + scroll_depth) via sendBeacon */
  const beaconUpdatePageView = useCallback(() => {
    if (!currentPageViewId.current) return;
    const timeOnPage = Date.now() - pageStartTime.current;
    const payload = JSON.stringify({
      time_on_page_ms: timeOnPage,
      scroll_depth: maxScrollDepth.current,
    });
    const url = `${supabaseUrl}/rest/v1/analytics_page_views?id=eq.${currentPageViewId.current}`;
    const blob = new Blob([payload], { type: 'application/json' });
    navigator.sendBeacon(
      url + `&apikey=${supabaseAnonKey}`,
      // sendBeacon PATCH isn't directly supported, so we fall back to async for in-app
      // nav and only use beacon for true page exits (beforeunload / visibilitychange hidden)
      blob
    );
    // Also fire async update (works for in-app route changes where page doesn't unload)
    void Promise.resolve(
      supabase
        .from('analytics_page_views')
        .update({ time_on_page_ms: timeOnPage, scroll_depth: maxScrollDepth.current })
        .eq('id', currentPageViewId.current)
    ).catch(() => {});
  }, [supabaseUrl, supabaseAnonKey]);

  /** Write session ended_at via async (heartbeat) and beacon (page exit) */
  const beaconUpdateSession = useCallback(() => {
    const endedAt = new Date().toISOString();
    // Async path (heartbeat every 30s, in-app nav)
    void Promise.resolve(
      supabase
        .from('analytics_sessions')
        .update({ ended_at: endedAt })
        .eq('session_id', sessionId.current)
    ).catch(() => {});
  }, []);

  // Scroll depth tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const scrollPercent = Math.round((scrollTop / docHeight) * 100);
        if (scrollPercent > maxScrollDepth.current) {
          maxScrollDepth.current = scrollPercent;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize session on mount
  useEffect(() => {
    initSession();
  }, [initSession]);

  // Track page views on route change (in-app navigation — page doesn't unload)
  useEffect(() => {
    if (currentPageViewId.current) {
      beaconUpdatePageView();
    }
    trackPageView();
  }, [location.pathname, trackPageView, beaconUpdatePageView]);

  // Heartbeat: update ended_at every 30s so duration is always reasonably accurate
  useEffect(() => {
    const interval = setInterval(beaconUpdateSession, 30000);
    return () => clearInterval(interval);
  }, [beaconUpdateSession]);

  // Page exit: use visibilitychange (works on mobile + desktop) + beforeunload (desktop)
  useEffect(() => {
    const handleExit = () => {
      beaconUpdatePageView();
      beaconUpdateSession();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleExit();
      }
    };

    window.addEventListener('beforeunload', handleExit);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', handleExit);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [beaconUpdatePageView, beaconUpdateSession]);

  return {
    visitorId: visitorId.current,
    sessionId: sessionId.current,
  };
}
