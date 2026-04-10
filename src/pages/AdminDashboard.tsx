import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Download, 
  Search, 
  Package, 
  AlertCircle, 
  Loader2, 
  Settings, 
  Warehouse, 
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart,
  BarChart3,
  Calendar,
  FileText,
  HelpCircle,
  RefreshCw
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

// ISO 3166-1 alpha-2 → full country name
const ISO_COUNTRY_NAMES: Record<string, string> = {
  AF: 'Afghanistan', AL: 'Albania', DZ: 'Algeria', AD: 'Andorra', AO: 'Angola',
  AG: 'Antigua & Barbuda', AR: 'Argentina', AM: 'Armenia', AU: 'Australia',
  AT: 'Austria', AZ: 'Azerbaijan', BS: 'Bahamas', BH: 'Bahrain', BD: 'Bangladesh',
  BB: 'Barbados', BY: 'Belarus', BE: 'Belgium', BZ: 'Belize', BJ: 'Benin',
  BT: 'Bhutan', BO: 'Bolivia', BA: 'Bosnia & Herzegovina', BW: 'Botswana',
  BR: 'Brazil', BN: 'Brunei', BG: 'Bulgaria', BF: 'Burkina Faso', BI: 'Burundi',
  CV: 'Cabo Verde', KH: 'Cambodia', CM: 'Cameroon', CA: 'Canada',
  CF: 'Central African Rep.', TD: 'Chad', CL: 'Chile', CN: 'China',
  CO: 'Colombia', KM: 'Comoros', CD: 'Congo (DRC)', CG: 'Congo (Rep.)',
  CR: 'Costa Rica', CI: "Côte d'Ivoire", HR: 'Croatia', CU: 'Cuba',
  CY: 'Cyprus', CZ: 'Czech Republic', DK: 'Denmark', DJ: 'Djibouti',
  DM: 'Dominica', DO: 'Dominican Republic', EC: 'Ecuador', EG: 'Egypt',
  SV: 'El Salvador', GQ: 'Equatorial Guinea', ER: 'Eritrea', EE: 'Estonia',
  SZ: 'Eswatini', ET: 'Ethiopia', FJ: 'Fiji', FI: 'Finland', FR: 'France',
  GA: 'Gabon', GM: 'Gambia', GE: 'Georgia', DE: 'Germany', GH: 'Ghana',
  GR: 'Greece', GD: 'Grenada', GT: 'Guatemala', GN: 'Guinea',
  GW: 'Guinea-Bissau', GY: 'Guyana', HT: 'Haiti', HN: 'Honduras',
  HU: 'Hungary', IS: 'Iceland', IN: 'India', ID: 'Indonesia', IR: 'Iran',
  IQ: 'Iraq', IE: 'Ireland', IL: 'Israel', IT: 'Italy', JM: 'Jamaica',
  JP: 'Japan', JO: 'Jordan', KZ: 'Kazakhstan', KE: 'Kenya', KI: 'Kiribati',
  KW: 'Kuwait', KG: 'Kyrgyzstan', LA: 'Laos', LV: 'Latvia', LB: 'Lebanon',
  LS: 'Lesotho', LR: 'Liberia', LY: 'Libya', LI: 'Liechtenstein',
  LT: 'Lithuania', LU: 'Luxembourg', MG: 'Madagascar', MW: 'Malawi',
  MY: 'Malaysia', MV: 'Maldives', ML: 'Mali', MT: 'Malta', MH: 'Marshall Islands',
  MR: 'Mauritania', MU: 'Mauritius', MX: 'Mexico', FM: 'Micronesia',
  MD: 'Moldova', MC: 'Monaco', MN: 'Mongolia', ME: 'Montenegro', MA: 'Morocco',
  MZ: 'Mozambique', MM: 'Myanmar', NA: 'Namibia', NR: 'Nauru', NP: 'Nepal',
  NL: 'Netherlands', NZ: 'New Zealand', NI: 'Nicaragua', NE: 'Niger',
  NG: 'Nigeria', NO: 'Norway', OM: 'Oman', PK: 'Pakistan', PW: 'Palau',
  PA: 'Panama', PG: 'Papua New Guinea', PY: 'Paraguay', PE: 'Peru',
  PH: 'Philippines', PL: 'Poland', PT: 'Portugal', QA: 'Qatar', RO: 'Romania',
  RU: 'Russia', RW: 'Rwanda', KN: 'Saint Kitts & Nevis', LC: 'Saint Lucia',
  VC: 'Saint Vincent', WS: 'Samoa', SM: 'San Marino', ST: 'São Tomé & Príncipe',
  SA: 'Saudi Arabia', SN: 'Senegal', RS: 'Serbia', SC: 'Seychelles',
  SL: 'Sierra Leone', SG: 'Singapore', SK: 'Slovakia', SI: 'Slovenia',
  SB: 'Solomon Islands', SO: 'Somalia', ZA: 'South Africa', SS: 'South Sudan',
  ES: 'Spain', LK: 'Sri Lanka', SD: 'Sudan', SR: 'Suriname', SE: 'Sweden',
  CH: 'Switzerland', SY: 'Syria', TW: 'Taiwan', TJ: 'Tajikistan',
  TZ: 'Tanzania', TH: 'Thailand', TL: 'Timor-Leste', TG: 'Togo',
  TO: 'Tonga', TT: 'Trinidad & Tobago', TN: 'Tunisia', TR: 'Turkey',
  TM: 'Turkmenistan', TV: 'Tuvalu', UG: 'Uganda', UA: 'Ukraine',
  AE: 'United Arab Emirates', GB: 'United Kingdom', US: 'United States',
  UY: 'Uruguay', UZ: 'Uzbekistan', VU: 'Vanuatu', VE: 'Venezuela',
  VN: 'Vietnam', YE: 'Yemen', ZM: 'Zambia', ZW: 'Zimbabwe',
  XX: 'Unknown',
};

function isoToCountryName(code: string): string {
  return ISO_COUNTRY_NAMES[code.toUpperCase()] || code;
}

interface Order {
  id: string;
  email: string;
  total_amount: number;
  status: string;
  fulfillment_status: string;
  created_at: string;
  shipping_address: any;
  mockup_url?: string;
  artwork_url?: string;
  printify_order_id?: string;
  printify_orders?: any;
}

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  completedOrders: number;
  processingOrders: number;
  paidOrders: number;
  revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
  ordersByStatus: Array<{ name: string; value: number }>;
}

interface TrafficAnalytics {
  totalPageViews: number;
  uniqueVisitors: number;
  totalSessions: number;
  averageSessionDuration: number;
  bounceRate: number;
  topPages: Array<{ page: string; views: number }>;
  deviceBreakdown: Array<{ name: string; value: number }>;
  browserBreakdown: Array<{ name: string; value: number }>;
  countryBreakdown: Array<{ name: string; value: number }>;
  osBreakdown: Array<{ name: string; value: number }>;
  trafficSources: Array<{ name: string; value: number }>;
  avgScrollDepth: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [trafficAnalytics, setTrafficAnalytics] = useState<TrafficAnalytics | null>(null);
  const [dateRange, setDateRange] = useState<string>("30");

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchOrders();
    }
  }, [isAdmin]);

  useEffect(() => {
    filterOrders();
  }, [orders, statusFilter, searchQuery]);

  useEffect(() => {
    if (orders.length > 0) {
      calculateAnalytics();
    }
  }, [orders, dateRange]);

  useEffect(() => {
    if (isAdmin) {
      fetchTrafficAnalytics();
    }
  }, [isAdmin, dateRange]);

  const fetchTrafficAnalytics = async () => {
    try {
      const daysAgo = parseInt(dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

      // Fetch sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('analytics_sessions')
        .select('*')
        .gte('started_at', cutoffDate.toISOString());

      if (sessionsError) throw sessionsError;

      // Fetch page views
      const { data: pageViews, error: pageViewsError } = await supabase
        .from('analytics_page_views')
        .select('*')
        .gte('viewed_at', cutoffDate.toISOString());

      if (pageViewsError) throw pageViewsError;

      // Calculate metrics
      const totalSessions = sessions?.length || 0;
      const uniqueVisitors = new Set(sessions?.map(s => s.visitor_id)).size;
      // Only count bounce rate on sessions that have ended — active/incomplete sessions
      // all default to is_bounce=true, which would inflate the rate to ~100%.
      const completedSessions = sessions?.filter(s => s.ended_at) || [];
      const completedBounces = completedSessions.filter(s => s.is_bounce).length;
      const bounceRate = completedSessions.length > 0
        ? Math.round((completedBounces / completedSessions.length) * 100)
        : 0;

      // Average session duration
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

      // Top pages
      const pageViewCounts: Record<string, number> = {};
      pageViews?.forEach(pv => {
        pageViewCounts[pv.path] = (pageViewCounts[pv.path] || 0) + 1;
      });
      const topPages = Object.entries(pageViewCounts)
        .map(([page, views]) => ({ page, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Device breakdown from sessions
      const deviceCounts: Record<string, number> = {};
      sessions?.forEach(s => {
        if (s.device_type) {
          deviceCounts[s.device_type] = (deviceCounts[s.device_type] || 0) + 1;
        }
      });
      const deviceBreakdown = Object.entries(deviceCounts).map(([name, value]) => ({ name, value }));

      // Browser breakdown from sessions
      const browserCounts: Record<string, number> = {};
      sessions?.forEach(s => {
        if (s.browser) {
          browserCounts[s.browser] = (browserCounts[s.browser] || 0) + 1;
        }
      });
      const browserBreakdown = Object.entries(browserCounts).map(([name, value]) => ({ name, value }));

      // Country breakdown from sessions
      const countryCounts: Record<string, number> = {};
      sessions?.forEach(s => {
        const country = s.country || 'XX';
        countryCounts[country] = (countryCounts[country] || 0) + 1;
      });
      const countryBreakdown = Object.entries(countryCounts)
        .map(([code, value]) => ({ name: isoToCountryName(code), value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      // OS breakdown from sessions
      const osCounts: Record<string, number> = {};
      sessions?.forEach(s => {
        const os = s.os || 'Unknown';
        osCounts[os] = (osCounts[os] || 0) + 1;
      });
      const osBreakdown = Object.entries(osCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

      // Traffic sources from sessions — map null/unknown → 'Direct'
      const SOURCE_LABELS: Record<string, string> = {
        direct: 'Direct', organic: 'Organic', paid: 'Paid', social: 'Social',
        email: 'Email', referral: 'Referral', unknown: 'Direct',
      };
      const sourceCounts: Record<string, number> = {};
      sessions?.forEach(s => {
        const raw = (s as any).traffic_source_type || 'direct';
        const label = SOURCE_LABELS[raw] || 'Direct';
        sourceCounts[label] = (sourceCounts[label] || 0) + 1;
      });
      const trafficSources = Object.entries(sourceCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

      // Average scroll depth from page views
      const scrollViews = pageViews?.filter(pv => pv.scroll_depth && pv.scroll_depth > 0) || [];
      const avgScrollDepth = scrollViews.length > 0 
        ? Math.round(scrollViews.reduce((acc, pv) => acc + (pv.scroll_depth || 0), 0) / scrollViews.length)
        : 0;

      setTrafficAnalytics({
        totalPageViews: pageViews?.length || 0,
        uniqueVisitors,
        totalSessions,
        averageSessionDuration: avgDuration,
        bounceRate,
        topPages,
        deviceBreakdown,
        browserBreakdown,
        countryBreakdown,
        osBreakdown,
        trafficSources,
        avgScrollDepth,
      });
    } catch (error) {
      console.error('Error fetching traffic analytics:', error);
      toast.error('Failed to load traffic analytics');
    }
  };

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please log in to access admin dashboard");
        navigate("/admin");
        return;
      }

      const { data: roles } = await (supabase as any)
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roles) {
        toast.error("Access denied: Admin privileges required");
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Admin check error:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, printify_orders(*)")
        .in("status", ["paid", "processing", "completed", "shipped", "delivered", "canceled"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data as any) || []);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    }
  };

  const syncPrintifyOrders = async () => {
    try {
      setIsSyncing(true);
      toast.info("Syncing Printify orders...");
      const { data, error } = await supabase.functions.invoke('sync-printify-orders', {
        method: 'POST'
      });

      if (error) throw error;
      
      toast.success(data?.message || "Printify orders fully synced!");
      await fetchOrders(); // Refetch after updating
    } catch (error: any) {
      console.error("Error syncing printify:", error);
      toast.error("Failed to sync Printify orders");
    } finally {
      setIsSyncing(false);
    }
  };

  const calculateAnalytics = () => {
    const daysAgo = parseInt(dateRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    const recentOrders = orders.filter(
      (order) => new Date(order.created_at) >= cutoffDate
    );

    const totalRevenue = recentOrders.reduce(
      (sum, order) => sum + Number(order.total_amount),
      0
    );

    const completedOrders = recentOrders.filter(
      (o) => o.status === "completed" || o.status === "delivered"
    ).length;
    const processingOrders = recentOrders.filter(
      (o) => o.status === "processing" || o.status === "shipped"
    ).length;
    const paidOrders = recentOrders.filter(
      (o) => o.status === "paid"
    ).length;

    // Revenue by day
    const revenueByDay: { [key: string]: { revenue: number; orders: number } } = {};
    recentOrders.forEach((order) => {
      const date = new Date(order.created_at).toLocaleDateString();
      if (!revenueByDay[date]) {
        revenueByDay[date] = { revenue: 0, orders: 0 };
      }
      revenueByDay[date].revenue += Number(order.total_amount);
      revenueByDay[date].orders += 1;
    });

    const revenueByDayArray = Object.entries(revenueByDay)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14); // Last 14 days for cleaner chart

    const ordersByStatus = [
      { name: "Completed", value: completedOrders },
      { name: "Processing", value: processingOrders },
      { name: "Paid/New", value: paidOrders },
    ];

    setAnalytics({
      totalRevenue,
      totalOrders: recentOrders.length,
      averageOrderValue: recentOrders.length > 0 ? totalRevenue / recentOrders.length : 0,
      completedOrders,
      processingOrders,
      paidOrders,
      revenueByDay: revenueByDayArray,
      ordersByStatus,
    });
  };

  const filterOrders = () => {
    let filtered = orders;

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const exportToCSV = () => {
    const headers = ["Order ID", "Email", "Total Amount", "Status", "Fulfillment Status", "Created At"];
    const csvData = filteredOrders.map((order) => [
      order.id,
      order.email,
      order.total_amount,
      order.status,
      order.fulfillment_status,
      new Date(order.created_at).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${new Date().toISOString()}.csv`;
    a.click();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      paid: "default",
      processing: "secondary",
      shipped: "default",
      delivered: "default",
      completed: "default",
      canceled: "destructive",
    };

    return (
      <Badge 
        variant={variants[status] || "default"}
        className={status === "paid" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
      >
        {status}
      </Badge>
    );
  };

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container px-4 py-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-black tracking-tighter">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Analytics and order management for Snarky A$$ Threads
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={syncPrintifyOrders} 
                disabled={isSyncing}
                className="border-blue-500/20 hover:bg-blue-500/10 hover:text-blue-500 text-foreground transition-all"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Syncing..." : "Sync Printify"}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-red-500/20 hover:bg-red-500/10 hover:text-red-500 text-foreground transition-all">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Store
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Store Content</DropdownMenuLabel>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/product-management")}>
                    <Package className="mr-2 h-4 w-4" /> Products
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/admin/blog")}>
                    <FileText className="mr-2 h-4 w-4" /> Website SEAL
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/admin/faq")}>
                    <HelpCircle className="mr-2 h-4 w-4" /> FAQ
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuLabel>Integrations</DropdownMenuLabel>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/printify-admin")}>
                    <Warehouse className="mr-2 h-4 w-4" /> Printify
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/teeinblue-admin")}>
                    <ShoppingBag className="mr-2 h-4 w-4" /> Teeinblue
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList>
              <TabsTrigger value="analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="traffic">
                <TrendingUp className="h-4 w-4 mr-2" />
                Traffic
              </TabsTrigger>
              <TabsTrigger value="orders">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Orders
              </TabsTrigger>
            </TabsList>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              {/* Date Range Selector */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Date Range
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                      <SelectItem value="365">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${analytics?.totalRevenue.toFixed(2) || "0.00"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last {dateRange} days
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics?.totalOrders || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {analytics?.completedOrders || 0} completed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${analytics?.averageOrderValue.toFixed(2) || "0.00"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Per order
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Processing Orders</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics?.processingOrders || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Being fulfilled
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trend</CardTitle>
                    <CardDescription>Daily revenue over the last 14 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analytics?.revenueByDay || []}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="date" 
                          className="text-xs"
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis 
                          className="text-xs"
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          name="Revenue ($)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Orders by Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Orders by Status</CardTitle>
                    <CardDescription>Distribution of order statuses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analytics?.ordersByStatus || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analytics?.ordersByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Order Volume */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Order Volume</CardTitle>
                    <CardDescription>Number of orders per day</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics?.revenueByDay || []}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="date" 
                          className="text-xs"
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis 
                          className="text-xs"
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Bar 
                          dataKey="orders" 
                          fill="hsl(var(--primary))" 
                          name="Orders"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Traffic Analytics Tab */}
            <TabsContent value="traffic" className="space-y-6">
              {/* Key Traffic Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4" />
                      Page Views
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{trafficAnalytics?.totalPageViews || 0}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4" />
                      Unique Visitors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{trafficAnalytics?.uniqueVisitors || 0}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <BarChart3 className="h-4 w-4" />
                      Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{trafficAnalytics?.totalSessions || 0}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      Avg Session
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {(() => {
                        const s = trafficAnalytics?.averageSessionDuration || 0;
                        if (s === 0) return '—';
                        const m = Math.floor(s / 60);
                        const sec = s % 60;
                        return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
                      })()}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Device Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Device Breakdown</CardTitle>
                    <CardDescription>Traffic by device type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={trafficAnalytics?.deviceBreakdown || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="hsl(var(--primary))"
                          dataKey="value"
                        >
                          {trafficAnalytics?.deviceBreakdown?.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Browser Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Browser Breakdown</CardTitle>
                    <CardDescription>Traffic by browser</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={trafficAnalytics?.browserBreakdown || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* OS Breakdown & Traffic Sources */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* OS Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>OS Breakdown</CardTitle>
                    <CardDescription>Traffic by operating system</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {trafficAnalytics?.osBreakdown && trafficAnalytics.osBreakdown.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={trafficAnalytics.osBreakdown}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="hsl(var(--primary))"
                            dataKey="value"
                          >
                            {trafficAnalytics.osBreakdown.map((_, index) => (
                              <Cell key={`os-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-sm text-muted-foreground">No OS data yet</p>
                    )}
                  </CardContent>
                </Card>

                {/* Traffic Sources */}
                <Card>
                  <CardHeader>
                    <CardTitle>Traffic Sources</CardTitle>
                    <CardDescription>How visitors find your site</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {trafficAnalytics?.trafficSources && trafficAnalytics.trafficSources.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={trafficAnalytics.trafficSources}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="hsl(var(--primary))"
                            dataKey="value"
                          >
                            {trafficAnalytics.trafficSources.map((_, index) => (
                              <Cell key={`src-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-sm text-muted-foreground">No traffic source data yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Country Breakdown */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Top Countries</CardTitle>
                  <CardDescription>Geographic distribution of sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  {trafficAnalytics?.countryBreakdown && trafficAnalytics.countryBreakdown.length > 0 ? (
                    <div className="space-y-3">
                      {(() => {
                        const maxVal = trafficAnalytics.countryBreakdown[0]?.value || 1;
                        return trafficAnalytics.countryBreakdown.map((entry, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground w-4 text-right">{index + 1}</span>
                            <span className="text-sm font-medium w-40 shrink-0 truncate">{entry.name}</span>
                            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                              <div
                                className="h-2 rounded-full bg-[hsl(var(--chart-3))]"
                                style={{ width: `${Math.round((entry.value / maxVal) * 100)}%` }}
                              />
                            </div>
                            <Badge variant="secondary" className="shrink-0">{entry.value}</Badge>
                          </div>
                        ));
                      })()}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No country data yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Top Pages & Engagement Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Pages */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Pages</CardTitle>
                    <CardDescription>Most visited pages</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {trafficAnalytics?.topPages?.slice(0, 5).map((page, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm font-medium truncate">{page.page}</span>
                          <Badge variant="secondary">{page.views} views</Badge>
                        </div>
                      ))}
                      {(!trafficAnalytics?.topPages || trafficAnalytics.topPages.length === 0) && (
                        <p className="text-sm text-muted-foreground">No page view data yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Engagement Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Engagement Metrics</CardTitle>
                    <CardDescription>User interaction data</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Scroll Depth</span>
                      <Badge variant="secondary">{trafficAnalytics?.avgScrollDepth || 0}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Bounce Rate</span>
                      <Badge variant="secondary">{trafficAnalytics?.bounceRate || 0}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Pages per Session</span>
                      <Badge variant="secondary">
                        {trafficAnalytics && trafficAnalytics.totalSessions > 0
                          ? (trafficAnalytics.totalPageViews / trafficAnalytics.totalSessions).toFixed(1)
                          : '0'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{orders.length}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600">
                      {orders.filter((o) => o.status === "completed").length}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Processing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-blue-600">
                      {orders.filter((o) => o.status === "processing").length}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Paid (New)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-emerald-600">
                      {orders.filter((o) => o.status === "paid").length}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Filters and Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Management</CardTitle>
                  <CardDescription>
                    Search, filter, and export your orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by email or order ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Orders</SelectItem>
                        <SelectItem value="paid">Paid (New)</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed/Delivered</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button onClick={exportToCSV} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Orders Table */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Fulfillment</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              No orders found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredOrders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-mono text-xs">
                                {order.id.slice(0, 8)}...
                              </TableCell>
                              <TableCell>{order.email}</TableCell>
                              <TableCell>${Number(order.total_amount).toFixed(2)}</TableCell>
                              <TableCell>{getStatusBadge(order.status)}</TableCell>
                              <TableCell>
                                {(() => {
                                  const pData = Array.isArray(order.printify_orders) 
                                    ? order.printify_orders[0] 
                                    : order.printify_orders;
                                  
                                  return pData?.printify_status ? (
                                    pData.tracking_url ? (
                                      <a href={pData.tracking_url} target="_blank" rel="noreferrer" className="hover:underline text-blue-600">
                                        <Badge variant="outline" className="capitalize bg-blue-50 border-blue-200">
                                          {pData.printify_status}
                                        </Badge>
                                      </a>
                                    ) : (
                                      <Badge variant="outline" className="capitalize">
                                        {pData.printify_status}
                                      </Badge>
                                    )
                                  ) : order.fulfillment_status && order.fulfillment_status !== "pending" ? (
                                    <Badge variant="outline" className="capitalize">{order.fulfillment_status}</Badge>
                                  ) : (
                                      <span className="text-xs text-muted-foreground italic">Processing via Printify</span>
                                  );
                                })()}
                              </TableCell>
                              <TableCell>
                                {new Date(order.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/order-tracking/${order.id}`)}
                                >
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
