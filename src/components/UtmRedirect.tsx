import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface UtmRedirectProps {
  utmSource: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  targetPath?: string;
}

export const UtmRedirect = ({
  utmSource,
  utmMedium = "comment",
  utmCampaign = "mel_outreach",
  utmContent,
  targetPath = "/",
}: UtmRedirectProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("utm_source", utmSource);
    params.set("utm_medium", utmMedium);
    params.set("utm_campaign", utmCampaign);
    if (utmContent) {
      params.set("utm_content", utmContent);
    }

    const destination = `${targetPath}?${params.toString()}`;
    navigate(destination, { replace: true });
  }, [navigate, utmSource, utmMedium, utmCampaign, utmContent, targetPath]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-muted-foreground">Redirecting to Snarky Humans...</p>
      </div>
    </div>
  );
};

export default UtmRedirect;
