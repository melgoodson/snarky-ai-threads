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

    // Support both GET (query params) and POST (JSON body)
    let startDate: string | null = null;
    let endDate: string | null = null;

    if (req.method === 'GET') {
      const url = new URL(req.url);
      startDate = url.searchParams.get('startDate');
      endDate = url.searchParams.get('endDate');
    } else {
      const body = await req.json();
      startDate = body.startDate;
      endDate = body.endDate;
    }

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

    // Average scroll depth from page views
    const scrollViews = pageViews?.filter(pv => pv.scroll_depth && pv.scroll_depth > 0) || [];
    const avgScrollDepth = scrollViews.length > 0
      ? Math.round(scrollViews.reduce((acc: number, pv: any) => acc + (pv.scroll_depth || 0), 0) / scrollViews.length)
      : 0;

    // --- Daily time-series breakdown ---
    const dailySessionsMap: Record<string, Set<string>> = {};   // date → unique visitor_ids
    const dailyPageViewsMap: Record<string, number> = {};        // date → count
    const dailySessionCountMap: Record<string, number> = {};     // date → session count

    sessions?.forEach(session => {
      if (session.started_at) {
        const day = session.started_at.substring(0, 10); // YYYY-MM-DD
        if (!dailySessionsMap[day]) dailySessionsMap[day] = new Set();
        dailySessionsMap[day].add(session.visitor_id);
        dailySessionCountMap[day] = (dailySessionCountMap[day] || 0) + 1;
      }
    });

    pageViews?.forEach(pv => {
      if (pv.viewed_at) {
        const day = pv.viewed_at.substring(0, 10);
        dailyPageViewsMap[day] = (dailyPageViewsMap[day] || 0) + 1;
      }
    });

    // Merge all dates and sort chronologically
    const allDates = new Set([
      ...Object.keys(dailySessionsMap),
      ...Object.keys(dailyPageViewsMap),
    ]);
    const dailyTimeSeries = Array.from(allDates)
      .sort()
      .map(date => ({
        date,
        visitors: dailySessionsMap[date]?.size || 0,
        pageViews: dailyPageViewsMap[date] || 0,
        sessions: dailySessionCountMap[date] || 0,
      }));

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
          avgScrollDepth,
          totalSessions,
          countries: countryMap,
          dailyTimeSeries,
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
