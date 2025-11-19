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
  Calendar
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
}

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  completedOrders: number;
  pendingOrders: number;
  failedOrders: number;
  revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
  ordersByStatus: Array<{ name: string; value: number }>;
}

interface TrafficAnalytics {
  totalPageViews: number;
  uniqueVisitors: number;
  totalSessions: number;
  averageSessionDuration: number;
  topPages: Array<{ page: string; views: number }>;
  deviceBreakdown: Array<{ name: string; value: number }>;
  browserBreakdown: Array<{ name: string; value: number }>;
  avgScrollDepth: number;
  clickEvents: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
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

      // Fetch analytics events
      const { data: events, error: eventsError } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', cutoffDate.toISOString());

      if (eventsError) throw eventsError;

      // Fetch sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('analytics_sessions')
        .select('*')
        .gte('started_at', cutoffDate.toISOString());

      if (sessionsError) throw sessionsError;

      // Calculate metrics
      const pageViews = events?.filter(e => e.event_type === 'page_view') || [];
      const uniqueVisitors = new Set(pageViews.map(e => e.session_id)).size;
      const totalSessions = sessions?.length || 0;
      const avgDuration = sessions?.reduce((acc, s) => acc + (s.duration || 0), 0) / totalSessions || 0;

      // Top pages
      const pageViewCounts: Record<string, number> = {};
      pageViews.forEach(e => {
        pageViewCounts[e.page_url] = (pageViewCounts[e.page_url] || 0) + 1;
      });
      const topPages = Object.entries(pageViewCounts)
        .map(([page, views]) => ({ page, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Device breakdown
      const deviceCounts: Record<string, number> = {};
      events?.forEach(e => {
        if (e.device_type) {
          deviceCounts[e.device_type] = (deviceCounts[e.device_type] || 0) + 1;
        }
      });
      const deviceBreakdown = Object.entries(deviceCounts).map(([name, value]) => ({ name, value }));

      // Browser breakdown
      const browserCounts: Record<string, number> = {};
      events?.forEach(e => {
        if (e.browser) {
          browserCounts[e.browser] = (browserCounts[e.browser] || 0) + 1;
        }
      });
      const browserBreakdown = Object.entries(browserCounts).map(([name, value]) => ({ name, value }));

      // Average scroll depth
      const scrollEvents = events?.filter(e => e.scroll_depth && e.scroll_depth > 0) || [];
      const avgScrollDepth = scrollEvents.reduce((acc, e) => acc + (e.scroll_depth || 0), 0) / scrollEvents.length || 0;

      // Click events
      const clickEvents = events?.filter(e => e.event_type === 'click').length || 0;

      setTrafficAnalytics({
        totalPageViews: pageViews.length,
        uniqueVisitors,
        totalSessions,
        averageSessionDuration: Math.round(avgDuration),
        topPages,
        deviceBreakdown,
        browserBreakdown,
        avgScrollDepth: Math.round(avgScrollDepth),
        clickEvents,
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
        navigate("/auth");
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
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data as any) || []);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
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
      (o) => o.status === "completed"
    ).length;
    const pendingOrders = recentOrders.filter(
      (o) => o.status === "pending"
    ).length;
    const failedOrders = recentOrders.filter(
      (o) => o.status === "failed"
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
      { name: "Pending", value: pendingOrders },
      { name: "Failed", value: failedOrders },
    ];

    setAnalytics({
      totalRevenue,
      totalOrders: recentOrders.length,
      averageOrderValue: recentOrders.length > 0 ? totalRevenue / recentOrders.length : 0,
      completedOrders,
      pendingOrders,
      failedOrders,
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
      pending: "secondary",
      processing: "default",
      completed: "default",
      failed: "destructive",
    };

    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
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
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate("/product-management")}
              >
                <Package className="h-4 w-4 mr-2" />
                Products
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/printify-admin")}
              >
                <Warehouse className="h-4 w-4 mr-2" />
                Printify
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/teeinblue-admin")}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Teeinblue
              </Button>
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
                    <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics?.pendingOrders || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Needs attention
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
                    <p className="text-3xl font-bold">{trafficAnalytics?.averageSessionDuration || 0}s</p>
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
                      <span className="text-sm font-medium">Total Click Events</span>
                      <Badge variant="secondary">{trafficAnalytics?.clickEvents || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Clicks per Session</span>
                      <Badge variant="secondary">
                        {trafficAnalytics && trafficAnalytics.totalSessions > 0
                          ? (trafficAnalytics.clickEvents / trafficAnalytics.totalSessions).toFixed(1)
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
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-yellow-600">
                      {orders.filter((o) => o.status === "pending").length}
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
                    <CardTitle className="text-sm font-medium">Failed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-red-600">
                      {orders.filter((o) => o.status === "failed").length}
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
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
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
                                <Badge variant="outline">{order.fulfillment_status}</Badge>
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
