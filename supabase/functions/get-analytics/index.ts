import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API key
    const apiKey = req.headers.get('x-api-key');
    const expectedApiKey = Deno.env.get('ANALYTICS_API_KEY');
    
    if (expectedApiKey && apiKey !== expectedApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { startDate, endDate } = await req.json();

    if (!startDate || !endDate) {
      return new Response(
        JSON.stringify({ success: false, error: 'startDate and endDate are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get sessions in date range
    const { data: sessions, error: sessionsError } = await supabase
      .from('analytics_sessions')
      .select('*')
      .gte('started_at', startDate)
      .lte('started_at', endDate);

    if (sessionsError) throw sessionsError;

    // Get page views in date range
    const { data: pageViews, error: pageViewsError } = await supabase
      .from('analytics_page_views')
      .select('*')
      .gte('viewed_at', startDate)
      .lte('viewed_at', endDate);

    if (pageViewsError) throw pageViewsError;

    const totalSessions = sessions?.length || 0;
    const uniqueVisitors = new Set(sessions?.map(s => s.visitor_id)).size;
    const totalPageViews = pageViews?.length || 0;
    const bounces = sessions?.filter(s => s.is_bounce).length || 0;
    const bounceRate = totalSessions > 0 ? Math.round((bounces / totalSessions) * 1000) / 10 : 0;
    const pagesPerVisit = totalSessions > 0 ? Math.round((totalPageViews / totalSessions) * 10) / 10 : 0;

    // Calculate average session duration
    let totalDuration = 0;
    let sessionsWithDuration = 0;
    sessions?.forEach(session => {
      if (session.started_at && session.ended_at) {
        const duration = new Date(session.ended_at).getTime() - new Date(session.started_at).getTime();
        if (duration > 0) {
          totalDuration += duration;
          sessionsWithDuration++;
        }
      }
    });
    const avgDuration = sessionsWithDuration > 0 ? Math.round(totalDuration / sessionsWithDuration / 1000) : 0;

    // Country breakdown
    const countryMap: Record<string, number> = {};
    sessions?.forEach(session => {
      const c = session.country || 'XX';
      countryMap[c] = (countryMap[c] || 0) + 1;
    });

    // OS breakdown
    const osMap: Record<string, number> = {};
    sessions?.forEach(session => {
      const o = session.os || 'Unknown';
      osMap[o] = (osMap[o] || 0) + 1;
    });

    // Browser breakdown
    const browserMap: Record<string, number> = {};
    sessions?.forEach(session => {
      const b = session.browser || 'Unknown';
      browserMap[b] = (browserMap[b] || 0) + 1;
    });

    // Device breakdown
    const deviceMap: Record<string, number> = {};
    sessions?.forEach(session => {
      const d = session.device_type || 'unknown';
      deviceMap[d] = (deviceMap[d] || 0) + 1;
    });

    // Traffic sources
    const sourceMap: Record<string, number> = {};
    sessions?.forEach(session => {
      const s = (session as any).traffic_source_type || 'unknown';
      sourceMap[s] = (sourceMap[s] || 0) + 1;
    });

    // Top pages
    const pageMap: Record<string, number> = {};
    pageViews?.forEach(pv => {
      const p = (pv as any).path || '(not set)';
      pageMap[p] = (pageMap[p] || 0) + 1;
    });
    const topPages = Object.entries(pageMap)
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 25);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          visitors: uniqueVisitors,
          pageViews: totalPageViews,
          avgDuration,
          bounceRate,
          pagesPerVisit,
          totalSessions,
          countries: countryMap,
          breakdowns: {
            countries: Object.entries(countryMap).map(([key, value]) => ({ key, value })),
            devices: Object.entries(deviceMap).map(([key, value]) => ({ key, value })),
            os: Object.entries(osMap).map(([key, value]) => ({ key, value })),
            browsers: Object.entries(browserMap).map(([key, value]) => ({ key, value })),
            sources: Object.entries(sourceMap).map(([key, value]) => ({ key, value })),
            top_pages: topPages,
          },
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Analytics error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
