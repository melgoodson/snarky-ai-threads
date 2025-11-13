import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, User, Package, Palette, LogOut, Save } from 'lucide-react';

interface Profile {
  id: string;
  username: string;
  preferences: any;
  created_at: string;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  fulfillment_status: string;
  created_at: string;
}

interface Design {
  id: string;
  prompt_text: string;
  image_url: string;
  created_at: string;
  selected: boolean;
}

const UserProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please log in to view your profile');
        navigate('/auth');
        return;
      }

      setEmail(user.email || '');
      await fetchProfile(user.id);
      await fetchOrders(user.id);
      await fetchDesigns(user.id);
    } catch (error) {
      console.error('Auth check error:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setUsername(data.username);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    }
  };

  const fetchOrders = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchDesigns = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_generated_images')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) throw error;
      setDesigns(data || []);
    } catch (error: any) {
      console.error('Error fetching designs:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', profile.id);

      if (error) throw error;
      
      toast.success('Profile updated successfully!');
      setProfile({ ...profile, username });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      if (error.code === '23505') {
        toast.error('This username is already taken');
      } else {
        toast.error('Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500';
      case 'shipped':
        return 'bg-blue-500';
      case 'processing':
        return 'bg-yellow-500';
      default:
        return 'bg-muted';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background p-8">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">My Profile</h1>
              <p className="text-muted-foreground">Manage your account and view your activity</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="orders">
                <Package className="mr-2 h-4 w-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="designs">
                <Palette className="mr-2 h-4 w-4" />
                Designs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Update your profile details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      minLength={3}
                      maxLength={20}
                    />
                  </div>

                  <Button onClick={handleUpdateProfile} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {profile && (
                <Card>
                  <CardHeader>
                    <CardTitle>Account Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="text-2xl font-bold">{orders.length}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Designs Created</p>
                      <p className="text-2xl font-bold">{designs.length}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>View all your past orders</CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No orders yet</p>
                      <Button className="mt-4" onClick={() => navigate('/')}>
                        Start Shopping
                      </Button>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono">
                              {order.id.slice(0, 8).toUpperCase()}
                            </TableCell>
                            <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(order.fulfillment_status)} variant="secondary">
                                {order.fulfillment_status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(order.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/order-tracking/${order.id}`)}
                              >
                                Track
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="designs">
              <Card>
                <CardHeader>
                  <CardTitle>Your Designs</CardTitle>
                  <CardDescription>AI-generated designs you've created</CardDescription>
                </CardHeader>
                <CardContent>
                  {designs.length === 0 ? (
                    <div className="text-center py-8">
                      <Palette className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No designs yet</p>
                      <Button className="mt-4" onClick={() => navigate('/custom-design')}>
                        Create Design
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {designs.map((design) => (
                        <div key={design.id} className="relative group">
                          <img
                            src={design.image_url}
                            alt={design.prompt_text}
                            className="w-full aspect-square object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <p className="text-white text-sm text-center px-2">
                              {design.prompt_text}
                            </p>
                          </div>
                          {design.selected && (
                            <Badge className="absolute top-2 right-2" variant="secondary">
                              Selected
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;
