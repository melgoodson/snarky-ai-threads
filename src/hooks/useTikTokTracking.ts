import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const TTP_COOKIE_KEY = '_ttp';
const TTCLID_PARAM_KEY = 'ttclid';
const STORED_TTCLID_KEY = 'sah_ttclid';
const STORED_USER_EMAIL = 'sah_user_email';
const STORED_USER_PHONE = 'sah_user_phone';
const STORED_TEST_CODE_KEY = 'sah_tiktok_test_code';

// Helper to SHA-256 hash text client-side for ttq.identify
async function sha256(text: string): Promise<string> {
  const normalized = text.trim().toLowerCase();
  const msgBuffer = new TextEncoder().encode(normalized);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Helper to get cookies in the browser
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export interface TikTokEventProperties {
  value?: number;
  currency?: string;
  query?: string;
  contents?: Array<{
    price?: number;
    quantity?: number;
    content_id?: string;
    content_type?: string;
    content_name?: string;
  }>;
}

export interface TikTokCustomerInfo {
  email?: string | null;
  phone_number?: string | null;
  external_id?: string | null;
}

export function useTikTokTracking() {
  const location = useLocation();
  const isFirstRender = useRef(true);

  // Store ttclid & test_event_code in session storage if present in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ttclid = params.get(TTCLID_PARAM_KEY);
    if (ttclid) {
      sessionStorage.setItem(STORED_TTCLID_KEY, ttclid);
    }
    const testCode = params.get('test_event_code');
    if (testCode) {
      sessionStorage.setItem(STORED_TEST_CODE_KEY, testCode);
    }
  }, [location.search]);

  // Core event tracking dispatcher
  const trackTikTokEvent = useCallback(async (
    eventName: string,
    properties: TikTokEventProperties = {},
    customerInfo: TikTokCustomerInfo = {}
  ) => {
    try {
      // 1. Get TikTok specific parameters
      const ttp = getCookie(TTP_COOKIE_KEY);
      const ttclid = sessionStorage.getItem(STORED_TTCLID_KEY);

      // 2. Fetch logged in user details if not explicitly provided
      let email = customerInfo.email;
      // If email is masked (contains asterisks), ignore it and fall back to stored email
      if (email && email.includes('***')) {
        email = null;
      }
      email = email || localStorage.getItem(STORED_USER_EMAIL);
      
      let phone = customerInfo.phone_number || localStorage.getItem(STORED_USER_PHONE);
      let externalId = customerInfo.external_id;

      if (!email || !externalId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          email = email || user.email;
          externalId = externalId || user.id;
        }
      }

      // Cache email and phone locally for subsequent events
      if (email) localStorage.setItem(STORED_USER_EMAIL, email);
      if (phone) localStorage.setItem(STORED_USER_PHONE, phone);

      const testCode = sessionStorage.getItem(STORED_TEST_CODE_KEY);
      const eventId = crypto.randomUUID();

      const payload = {
        event: eventName,
        event_id: eventId,
        timestamp: new Date().toISOString(),
        test_event_code: testCode || undefined,
        context: {
          ad: {
            callback: ttclid || null,
          },
          user: {
            email: email || null,
            phone_number: phone || null,
            external_id: externalId || null,
            ttp: ttp || null,
          },
          page: {
            url: window.location.href,
            referrer: document.referrer || null,
          },
        },
        properties: {
          value: properties.value !== undefined ? Number(properties.value) : undefined,
          currency: properties.currency || 'USD',
          query: properties.query || undefined,
          contents: properties.contents || [],
        },
      };

      console.log(`[TikTok Event Triggered] ${eventName}`, payload);

      // 1. Browser-side hybrid pixel tracking (standard client pixel)
      if (typeof window !== 'undefined' && (window as any).ttq) {
        try {
          const identifyObj: Record<string, string> = {};
          if (email) identifyObj.email = await sha256(email);
          if (phone) identifyObj.phone_number = await sha256(phone);
          if (externalId) identifyObj.external_id = await sha256(externalId);

          if (Object.keys(identifyObj).length > 0) {
            (window as any).ttq.identify(identifyObj);
            console.log(`[TikTok Browser Identify] Hashed matching PII sent:`, Object.keys(identifyObj));
          }

          (window as any).ttq.track(eventName, {
            value: properties.value !== undefined ? Number(properties.value) : undefined,
            currency: properties.currency || 'USD',
            contents: properties.contents || [],
          }, {
            event_id: eventId,
          });
          console.log(`[TikTok Browser Event] ${eventName} tracked with event_id: ${eventId}`);
        } catch (sdkError) {
          console.debug('Error in browser-side ttq tracking:', sdkError);
        }
      }

      // 2. Server-side hybrid Events API tracking (Supabase Edge Function)
      const { error } = await supabase.functions.invoke('tiktok-events', {
        body: payload,
      });

      if (error) {
        console.debug('Failed to send TikTok event via Edge Function:', error);
      }
    } catch (e) {
      console.debug('Error dispatching TikTok event:', e);
    }
  }, []);

  // Track standard page views (PageView) in browser for SPA navigation
  useEffect(() => {
    // Don't track admin pages as standard PageView
    if (location.pathname.startsWith('/admin')) {
      return;
    }

    const sendPageView = () => {
      // Trigger browser-side page view for SPA routing
      if (typeof window !== 'undefined' && (window as any).ttq) {
        try {
          (window as any).ttq.page();
          console.debug('[TikTok SPA PageView] Tracked path:', location.pathname);
        } catch (e) {
          console.debug('Error triggering browser TikTok page view:', e);
        }
      }
    };

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(sendPageView, 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return {
    trackTikTokEvent,
  };
}
