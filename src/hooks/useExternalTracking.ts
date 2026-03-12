import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const TRACKING_ENDPOINT =
    'https://mhuxrnxajtiwxauhlhlv.supabase.co/functions/v1/track-analytics';
const ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1odXhybnhhanRpd3hhdWhsaGx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTM3MDcsImV4cCI6MjA4NzUyOTcwN30.aWETGhjGNrihD6OrKq-tctQnDFxu8XCjgsFmv77-m9E';
const CLIENT_ID = '297cbb3c-54b4-4bed-8206-25949a94fa62';
const VISITOR_KEY = 'sah_visitor_id';

// --- Helpers -----------------------------------------------------------

function getVisitorId(): string {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
}

function getUtmParams(): Record<string, string | null> {
    const params = new URLSearchParams(window.location.search);
    return {
        utmSource: params.get('utm_source'),
        utmMedium: params.get('utm_medium'),
        utmCampaign: params.get('utm_campaign'),
    };
}

const BOT_PATTERN =
    /bot|crawl|spider|slurp|mediapartners|facebookexternalhit|bingpreview|googlebot|yandex|baidu|duckduck|semrush|ahrefs|lighthouse|pagespeed|headless/i;

function isBot(): boolean {
    return BOT_PATTERN.test(navigator.userAgent);
}

// --- Core send ---------------------------------------------------------

function sendTrackingEvent(): void {
    if (isBot()) return;

    const utm = getUtmParams();
    const payload = JSON.stringify({
        clientId: CLIENT_ID,
        visitorId: getVisitorId(),
        pageUrl: window.location.href,
        pageTitle: document.title,
        referrer: document.referrer,
        utmSource: utm.utmSource,
        utmMedium: utm.utmMedium,
        utmCampaign: utm.utmCampaign,
    });

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ANON_KEY}`,
        apikey: ANON_KEY,
    };

    try {
        // sendBeacon doesn't support custom headers, so we use a Blob with type
        // and pass auth via query-string fallback handled by the edge function.
        // Prefer fetch with keepalive for full header support.
        if (typeof navigator.sendBeacon === 'function') {
            const blob = new Blob([payload], { type: 'application/json' });
            const sent = navigator.sendBeacon(
                `${TRACKING_ENDPOINT}?apikey=${ANON_KEY}`,
                blob,
            );
            if (sent) return;
        }

        // Fallback: non-blocking fetch
        fetch(TRACKING_ENDPOINT, {
            method: 'POST',
            headers,
            body: payload,
            keepalive: true,
        }).catch(() => {
            /* fail silently */
        });
    } catch {
        /* fail silently */
    }
}

// --- React hook --------------------------------------------------------

/**
 * Lightweight external analytics tracker.
 * Fires on initial mount and on every client-side route change.
 */
export function useExternalTracking(): void {
    const location = useLocation();
    const isFirstRender = useRef(true);

    useEffect(() => {
        // Small delay on route change to let document.title update
        if (isFirstRender.current) {
            isFirstRender.current = false;
            sendTrackingEvent();
            return;
        }

        const timer = setTimeout(sendTrackingEvent, 50);
        return () => clearTimeout(timer);
    }, [location.pathname, location.search]);
}
