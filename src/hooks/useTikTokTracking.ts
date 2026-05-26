import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const TTP_COOKIE_KEY = '_ttp';
const TTCLID_PARAM_KEY = 'ttclid';
const STORED_TTCLID_KEY = 'sah_ttclid';
const STORED_USER_EMAIL = 'sah_user_email';
const STORED_USER_PHONE = 'sah_user_phone';

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

  // Store ttclid in session storage if present in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ttclid = params.get(TTCLID_PARAM_KEY);
    if (ttclid) {
      sessionStorage.setItem(STORED_TTCLID_KEY, ttclid);
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
      let email = customerInfo.email || localStorage.getItem(STORED_USER_EMAIL);
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

      const payload = {
        event: eventName,
        event_id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
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

      // Fire async request to Supabase edge function
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

  // Track standard page views (ViewContent)
  useEffect(() => {
    // Small delay to allow page elements (like document.title) to settle
    const sendViewContent = () => {
      // Don't track admin pages or thank you pages as standard ViewContent
      if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/order-confirmation')) {
        return;
      }

      // ViewContent tracking
      trackTikTokEvent('ViewContent', {
        value: 0,
        currency: 'USD',
      });
    };

    if (isFirstRender.current) {
      isFirstRender.current = false;
      sendViewContent();
      return;
    }

    const timer = setTimeout(sendViewContent, 100);
    return () => clearTimeout(timer);
  }, [location.pathname, trackTikTokEvent]);

  return {
    trackTikTokEvent,
  };
}
