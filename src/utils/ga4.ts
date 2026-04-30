export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag: (...args: any[]) => void;
  }
}

export const initGA4 = () => {
  if (!GA_MEASUREMENT_ID) {
    console.warn('GA4 Measurement ID is missing. Analytics will not be loaded.');
    return;
  }

  // Prevent multiple injections
  if (document.getElementById('ga4-script')) return;

  const script = document.createElement('script');
  script.id = 'ga4-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  // Ensure we don't overwrite an existing gtag function (e.g. from Google Ads)
  if (!window.gtag) {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
  }

  window.gtag('js', new Date());
  
  // We disable the initial pageview here so that our router hook controls it exclusively
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false,
  });
};

export const trackPageView = (path: string) => {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;
  
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
  });
};
