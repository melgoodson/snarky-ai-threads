import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  Search,
  Package,
  Loader2,
  ShoppingCart,
  DollarSign,
  Users,
  Clock,
  Truck,
  MapPin,
  ExternalLink,
  Copy,
  Tag,
  MessageSquare,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  StickyNote,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Order {
  id: string;
  user_id: string | null;
  email: string;
  total_amount: number;
  status: string;
  fulfillment_status: string;
  created_at: string;
  updated_at: string;
  shipping_address: any;
  mockup_url?: string;
  artwork_url?: string;
  teeinblue_order_id?: string;
  stripe_payment_intent_id?: string;
  stripe_session_id?: string;
  admin_tags?: string[];
  customer_note?: string;
  cancelled_at?: string;
  refunded_at?: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  printify_product_id: string;
  variant_id: string;
  quantity: number;
  price: number;
  design_image_url?: string;
  products: {
    title: string;
    images: any;
    category?: string;
  } | null;
}

interface PrintifyOrder {
  printify_order_id: string;
  printify_status: string;
  tracking_number: string;
  tracking_url: string;
  created_at: string;
  updated_at: string;
}

interface OrderNote {
  id: string;
  order_id: string;
  author_id: string | null;
  note_type: string;
  content: string;
  metadata: any;
  created_at: string;
}

interface CustomerStats {
  totalOrders: number;
  totalSpend: number;
  name: string;
  phone: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ORDERS_PER_PAGE = 25;

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const FULFILLMENT_OPTIONS = [
  { value: "all", label: "All Fulfillment" },
  { value: "pending", label: "Unfulfilled" },
  { value: "processing", label: "In Production" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "paid": return "default";
    case "completed": return "default";
    case "processing": return "secondary";
    case "pending": return "outline";
    case "cancelled": return "destructive";
    case "failed": return "destructive";
    case "refunded": return "secondary";
    default: return "outline";
  }
}

function getFulfillmentVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "delivered": return "default";
    case "shipped": return "default";
    case "processing": return "secondary";
    case "pending": return "outline";
    default: return "outline";
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case "paid": return "bg-green-500/10 text-green-700 border-green-200";
    case "completed": return "bg-green-500/10 text-green-700 border-green-200";
    case "processing": return "bg-blue-500/10 text-blue-700 border-blue-200";
    case "pending": return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
    case "cancelled": return "bg-red-500/10 text-red-700 border-red-200";
    case "failed": return "bg-red-500/10 text-red-700 border-red-200";
    case "refunded": return "bg-purple-500/10 text-purple-700 border-purple-200";
    default: return "bg-muted text-muted-foreground";
  }
}

function getFulfillmentColor(status: string): string {
  switch (status) {
    case "delivered": return "bg-green-500/10 text-green-700 border-green-200";
    case "shipped": return "bg-blue-500/10 text-blue-700 border-blue-200";
    case "processing": return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
    case "pending": return "bg-orange-500/10 text-orange-700 border-orange-200";
    default: return "bg-muted text-muted-foreground";
  }
}

function formatShortId(id: string): string {
  return `#${id.slice(0, 8).toUpperCase()}`;
}

function formatAddress(addr: any): string {
  if (!addr) return "No address";
  const parts = [
    addr.firstName || addr.first_name ? `${addr.firstName || addr.first_name} ${addr.lastName || addr.last_name}` : addr.name,
    addr.address1,
    addr.address2,
    `${addr.city || ""}, ${addr.state || ""} ${addr.zip || ""}`.trim(),
    addr.country,
  ].filter(Boolean);
  return parts.join("\n");
}

function formatCurrency(amount: number): string {
  return `$${Number(amount).toFixed(2)}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getCustomerName(order: Order): string {
  const addr = order.shipping_address;
  if (!addr) return order.email;
  const first = addr.firstName || addr.first_name || "";
  const last = addr.lastName || addr.last_name || "";
  const name = `${first} ${last}`.trim();
  return name || addr.name || order.email;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminOrders() {
  const navigate = useNavigate();

  // Auth
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Order list state
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fulfillmentFilter, setFulfillmentFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  // Detail panel state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [printifyOrder, setPrintifyOrder] = useState<PrintifyOrder | null>(null);
  const [orderNotes, setOrderNotes] = useState<OrderNote[]>([]);
  const [customerStats, setCustomerStats] = useState<CustomerStats | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Note form
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // Status update
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // ─── Auth Check ──────────────────────────────────────────────────────────

  useEffect(() => {
    checkAdminAccess();
  }, []);

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
    } catch {
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  // ─── Fetch Orders ────────────────────────────────────────────────────────

  const fetchOrders = useCallback(async () => {
    setRefreshing(true);
    try {
      let query = supabase
        .from("orders")
        .select("*", { count: "exact" });

      // Filters
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      if (fulfillmentFilter !== "all") {
        query = query.eq("fulfillment_status", fulfillmentFilter);
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        query = query.or(`email.ilike.%${q}%,id.ilike.%${q}%`);
      }

      // Sorting
      switch (sortBy) {
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "oldest":
          query = query.order("created_at", { ascending: true });
          break;
        case "highest":
          query = query.order("total_amount", { ascending: false });
          break;
        case "lowest":
          query = query.order("total_amount", { ascending: true });
          break;
      }

      // Pagination
      const from = (currentPage - 1) * ORDERS_PER_PAGE;
      const to = from + ORDERS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;
      setOrders((data as any) || []);
      setTotalCount(count || 0);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setRefreshing(false);
    }
  }, [statusFilter, fulfillmentFilter, searchQuery, sortBy, currentPage]);

  useEffect(() => {
    if (isAdmin) fetchOrders();
  }, [isAdmin, fetchOrders]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, fulfillmentFilter, searchQuery, sortBy]);

  // ─── Fetch Order Detail ──────────────────────────────────────────────────

  const openOrderDetail = async (order: Order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
    setDetailLoading(true);
    setOrderItems([]);
    setPrintifyOrder(null);
    setOrderNotes([]);
    setCustomerStats(null);
    setNewNote("");

    try {
      // Fetch order items with product info
      const { data: items } = await supabase
        .from("order_items")
        .select("*, products(title, images, category)")
        .eq("order_id", order.id);
      setOrderItems((items as any) || []);

      // Fetch printify order
      const { data: pOrder } = await supabase
        .from("printify_orders")
        .select("*")
        .eq("order_id", order.id)
        .maybeSingle();
      if (pOrder) setPrintifyOrder(pOrder as any);

      // Fetch order notes
      try {
        const { data: notes } = await (supabase as any)
          .from("order_notes")
          .select("*")
          .eq("order_id", order.id)
          .order("created_at", { ascending: false });
        setOrderNotes(notes || []);
      } catch {
        // Table may not exist yet
        setOrderNotes([]);
      }

      // Fetch customer stats
      if (order.email) {
        const { data: custOrders } = await supabase
          .from("orders")
          .select("total_amount")
          .eq("email", order.email);
        
        const totalSpend = (custOrders || []).reduce((sum, o: any) => sum + Number(o.total_amount), 0);
        const addr = order.shipping_address;
        setCustomerStats({
          totalOrders: custOrders?.length || 0,
          totalSpend,
          name: getCustomerName(order),
          phone: addr?.phone || "N/A",
        });
      }
    } catch (error) {
      console.error("Error loading order detail:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  // ─── Update Order Status ─────────────────────────────────────────────────

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === "cancelled") updateData.cancelled_at = new Date().toISOString();

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

      if (error) throw error;

      // Add a timeline note
      try {
        await (supabase as any)
          .from("order_notes")
          .insert({
            order_id: orderId,
            note_type: "status_change",
            content: `Order status changed to ${newStatus}`,
            metadata: { new_status: newStatus },
          });
      } catch {
        // Table may not exist yet
      }

      toast.success(`Order status updated to ${newStatus}`);

      // Refresh
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus, ...updateData } : null);
      }
      fetchOrders();
      if (selectedOrder) openOrderDetail({ ...selectedOrder, status: newStatus });
    } catch (error: any) {
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ─── Update Fulfillment Status ────────────────────────────────────────────

  const updateFulfillmentStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ fulfillment_status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      try {
        await (supabase as any)
          .from("order_notes")
          .insert({
            order_id: orderId,
            note_type: "fulfillment_update",
            content: `Fulfillment status changed to ${newStatus}`,
            metadata: { new_fulfillment_status: newStatus },
          });
      } catch {
        // Table may not exist yet
      }

      toast.success(`Fulfillment status updated to ${newStatus}`);
      fetchOrders();
      if (selectedOrder) openOrderDetail({ ...selectedOrder, fulfillment_status: newStatus });
    } catch {
      toast.error("Failed to update fulfillment status");
    }
  };

  // ─── Add Note ────────────────────────────────────────────────────────────

  const addNote = async () => {
    if (!newNote.trim() || !selectedOrder) return;
    setAddingNote(true);
    try {
      const { error } = await (supabase as any)
        .from("order_notes")
        .insert({
          order_id: selectedOrder.id,
          note_type: "admin_note",
          content: newNote.trim(),
        });

      if (error) throw error;
      toast.success("Note added");
      setNewNote("");
      // Re-fetch notes
      const { data: notes } = await (supabase as any)
        .from("order_notes")
        .select("*")
        .eq("order_id", selectedOrder.id)
        .order("created_at", { ascending: false });
      setOrderNotes(notes || []);
    } catch {
      toast.error("Failed to add note");
    } finally {
      setAddingNote(false);
    }
  };

  // ─── Bulk Actions ────────────────────────────────────────────────────────

  const toggleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map(o => o.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedOrders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ─── CSV Export ──────────────────────────────────────────────────────────

  const exportToCSV = () => {
    const exportOrders = selectedOrders.size > 0
      ? orders.filter(o => selectedOrders.has(o.id))
      : orders;

    const headers = [
      "Order ID", "Date", "Customer", "Email", "Total", "Payment Status",
      "Fulfillment Status", "Shipping Address", "Printify Order ID",
    ];
    const csvData = exportOrders.map(order => [
      order.id,
      formatDateTime(order.created_at),
      getCustomerName(order),
      order.email,
      order.total_amount,
      order.status,
      order.fulfillment_status,
      formatAddress(order.shipping_address).replace(/\n/g, ", "),
      order.teeinblue_order_id || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(`Exported ${exportOrders.length} orders`);
  };

  // ─── Copy to Clipboard ──────────────────────────────────────────────────

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // ─── Pagination ──────────────────────────────────────────────────────────

  const totalPages = Math.ceil(totalCount / ORDERS_PER_PAGE);

  // ─── Summary Stats ──────────────────────────────────────────────────────

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const pendingCount = orders.filter(o => o.fulfillment_status === "pending").length;
  const paidUnfulfilled = orders.filter(o => o.status === "paid" && o.fulfillment_status === "pending").length;

  // ─── Render ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container px-4 py-8">
        <div className="space-y-6">
          {/* ─── Page Header ─────────────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-black tracking-tight">Orders</h1>
                <p className="text-sm text-muted-foreground">
                  {totalCount} total orders
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchOrders} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-1" />
                {selectedOrders.size > 0 ? `Export ${selectedOrders.size}` : "Export All"}
              </Button>
            </div>
          </div>

          {/* ─── Summary Cards ────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{totalCount}</p>
                  </div>
                  <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Page Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                  </div>
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Unfulfilled</p>
                    <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
                  </div>
                  <Package className="h-5 w-5 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Paid & Awaiting</p>
                    <p className="text-2xl font-bold text-yellow-600">{paidUnfulfilled}</p>
                  </div>
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ─── Filters ──────────────────────────────────────────────────── */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email or order ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={fulfillmentFilter} onValueChange={setFulfillmentFilter}>
                  <SelectTrigger className="w-full md:w-[170px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FULFILLMENT_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="highest">Highest $</SelectItem>
                    <SelectItem value="lowest">Lowest $</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* ─── Orders Table ─────────────────────────────────────────────── */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-10">
                        <Checkbox
                          checked={orders.length > 0 && selectedOrders.size === orders.length}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="font-semibold">Order</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Customer</TableHead>
                      <TableHead className="font-semibold">Total</TableHead>
                      <TableHead className="font-semibold">Payment</TableHead>
                      <TableHead className="font-semibold">Fulfillment</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                          {refreshing ? (
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Loading orders...
                            </div>
                          ) : (
                            "No orders found"
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow
                          key={order.id}
                          className="cursor-pointer hover:bg-muted/30 transition-colors"
                          onClick={() => openOrderDetail(order)}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedOrders.has(order.id)}
                              onCheckedChange={() => toggleSelect(order.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm font-medium text-primary">
                              {formatShortId(order.id)}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {formatDate(order.created_at)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium truncate max-w-[180px]">
                                {getCustomerName(order)}
                              </p>
                              <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                                {order.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(order.total_amount)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getStatusVariant(order.status)}
                              className={`text-xs ${getStatusColor(order.status)}`}
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getFulfillmentVariant(order.fulfillment_status)}
                              className={`text-xs ${getFulfillmentColor(order.fulfillment_status)}`}
                            >
                              {order.fulfillment_status || "pending"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openOrderDetail(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * ORDERS_PER_PAGE + 1}–
                    {Math.min(currentPage * ORDERS_PER_PAGE, totalCount)} of {totalCount}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium px-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />

      {/* ─── Order Detail Sheet ─────────────────────────────────────────────── */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl overflow-y-auto p-0"
        >
          <SheetHeader className="p-6 pb-4 border-b sticky top-0 bg-background z-10">
            <div className="flex items-center justify-between pr-8">
              <div>
                <SheetTitle className="text-xl font-black">
                  Order {selectedOrder ? formatShortId(selectedOrder.id) : ""}
                </SheetTitle>
                <SheetDescription className="text-sm">
                  {selectedOrder ? formatDateTime(selectedOrder.created_at) : ""}
                </SheetDescription>
              </div>
              {selectedOrder && (
                <div className="flex gap-2">
                  <Badge
                    variant={getStatusVariant(selectedOrder.status)}
                    className={getStatusColor(selectedOrder.status)}
                  >
                    {selectedOrder.status}
                  </Badge>
                  <Badge
                    variant={getFulfillmentVariant(selectedOrder.fulfillment_status)}
                    className={getFulfillmentColor(selectedOrder.fulfillment_status)}
                  >
                    {selectedOrder.fulfillment_status || "pending"}
                  </Badge>
                </div>
              )}
            </div>
          </SheetHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : selectedOrder ? (
            <div className="p-6 space-y-6">
              {/* ─── Admin Actions ─────────────────────────────────────── */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Payment Status</p>
                      <Select
                        value={selectedOrder.status}
                        onValueChange={(val) => updateOrderStatus(selectedOrder.id, val)}
                        disabled={updatingStatus}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Fulfillment</p>
                      <Select
                        value={selectedOrder.fulfillment_status || "pending"}
                        onValueChange={(val) => updateFulfillmentStatus(selectedOrder.id, val)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Unfulfilled</SelectItem>
                          <SelectItem value="processing">In Production</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ─── Line Items ────────────────────────────────────────── */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Items ({orderItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {orderItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No items found</p>
                  ) : (
                    <div className="space-y-3">
                      {orderItems.map((item) => {
                        const img = item.design_image_url
                          || item.products?.images?.[0]?.src
                          || null;
                        return (
                          <div key={item.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                            {img && (
                              <div className="w-14 h-14 rounded-md overflow-hidden bg-background flex-shrink-0 border">
                                <img src={img} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {item.products?.title || "Custom Product"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Variant: {item.variant_id} · Qty: {item.quantity}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-medium">
                                {formatCurrency(item.price * item.quantity)}
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-xs text-muted-foreground">
                                  {formatCurrency(item.price)} each
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      <Separator className="my-2" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold">Total</span>
                        <span className="text-lg font-black">
                          {formatCurrency(selectedOrder.total_amount)}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ─── Payment Info ──────────────────────────────────────── */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(selectedOrder.total_amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-muted-foreground">Included in Printify</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(selectedOrder.total_amount)}</span>
                  </div>
                  {selectedOrder.stripe_payment_intent_id && (
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() =>
                          window.open(
                            `https://dashboard.stripe.com/payments/${selectedOrder.stripe_payment_intent_id}`,
                            "_blank"
                          )
                        }
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View in Stripe
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ─── Customer ─────────────────────────────────────────── */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Customer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{customerStats?.name || getCustomerName(selectedOrder)}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <p className="text-xs text-muted-foreground">{selectedOrder.email}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() => copyToClipboard(selectedOrder.email)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  {customerStats && (
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="text-center p-2 bg-muted/50 rounded-md">
                        <p className="text-lg font-bold">{customerStats.totalOrders}</p>
                        <p className="text-xs text-muted-foreground">Orders</p>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded-md">
                        <p className="text-lg font-bold">{formatCurrency(customerStats.totalSpend)}</p>
                        <p className="text-xs text-muted-foreground">Total Spend</p>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded-md">
                        <p className="text-sm font-medium">{customerStats.phone}</p>
                        <p className="text-xs text-muted-foreground">Phone</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ─── Shipping ─────────────────────────────────────────── */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedOrder.shipping_address ? (
                    <div className="flex items-start justify-between">
                      <div className="text-sm space-y-0.5">
                        {formatAddress(selectedOrder.shipping_address).split("\n").map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0"
                        onClick={() =>
                          copyToClipboard(formatAddress(selectedOrder.shipping_address).replace(/\n/g, ", "))
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No shipping address</p>
                  )}
                </CardContent>
              </Card>

              {/* ─── Fulfillment / Tracking ────────────────────────────── */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Fulfillment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {printifyOrder ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Printify Order</span>
                        <span className="font-mono text-xs">{printifyOrder.printify_order_id}</span>
                      </div>
                      {printifyOrder.printify_status && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Printify Status</span>
                          <Badge variant="outline" className="capitalize">
                            {printifyOrder.printify_status.replace(/_/g, " ")}
                          </Badge>
                        </div>
                      )}
                      {printifyOrder.tracking_number && (
                        <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Tracking #</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-xs">{printifyOrder.tracking_number}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0"
                                onClick={() => copyToClipboard(printifyOrder.tracking_number)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {printifyOrder.tracking_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-xs"
                              onClick={() => window.open(printifyOrder.tracking_url, "_blank")}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Track Package
                            </Button>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No fulfillment record yet
                    </p>
                  )}
                  {selectedOrder.teeinblue_order_id && (
                    <div className="flex justify-between text-sm pt-2">
                      <span className="text-muted-foreground">Teeinblue Order</span>
                      <span className="font-mono text-xs">{selectedOrder.teeinblue_order_id}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ─── Design Artwork ────────────────────────────────────── */}
              {(selectedOrder.artwork_url || selectedOrder.mockup_url) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Design Assets
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedOrder.mockup_url && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Mockup</p>
                          <div className="rounded-lg overflow-hidden border bg-muted">
                            <img
                              src={selectedOrder.mockup_url}
                              alt="Product mockup"
                              className="w-full h-auto object-contain"
                            />
                          </div>
                        </div>
                      )}
                      {selectedOrder.artwork_url && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Artwork</p>
                          <div className="rounded-lg overflow-hidden border bg-muted">
                            <img
                              src={selectedOrder.artwork_url}
                              alt="Design artwork"
                              className="w-full h-auto object-contain"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ─── Order Notes / Timeline ────────────────────────────── */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <StickyNote className="h-4 w-4" />
                    Notes & Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Add Note */}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Add a note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="min-h-[60px] text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={addNote}
                      disabled={!newNote.trim() || addingNote}
                      className="self-end"
                    >
                      {addingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                    </Button>
                  </div>

                  <Separator />

                  {/* Timeline */}
                  {orderNotes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No notes yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {orderNotes.map((note) => (
                        <div key={note.id} className="flex gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {note.note_type === "admin_note" && (
                              <MessageSquare className="h-4 w-4 text-blue-500" />
                            )}
                            {note.note_type === "status_change" && (
                              <RefreshCw className="h-4 w-4 text-yellow-500" />
                            )}
                            {note.note_type === "fulfillment_update" && (
                              <Truck className="h-4 w-4 text-green-500" />
                            )}
                            {note.note_type === "system" && (
                              <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">{note.content}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDateTime(note.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ─── Raw Order ID ──────────────────────────────────────── */}
              <div className="text-center pb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={() => copyToClipboard(selectedOrder.id)}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {selectedOrder.id}
                </Button>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
