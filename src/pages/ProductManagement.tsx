import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Plus, Edit, Trash2, ArrowLeft, Package } from 'lucide-react';

interface Product {
  id: string;
  printify_product_id: string;
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  is_active: boolean;
  images: any;
  variants: any;
  created_at: string;
  updated_at: string;
}

const ProductManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please log in to access product management');
        navigate('/auth');
        return;
      }

      const { data: roles } = await (supabase as any)
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roles) {
        toast.error('Access denied: Admin privileges required');
        navigate('/');
        return;
      }

      fetchProducts();
    } catch (error) {
      console.error('Admin check error:', error);
      navigate('/');
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId);

      if (error) throw error;

      toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchProducts();
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product status');
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
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-between items-center mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Button>
            <Button onClick={() => navigate('/create-product')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Product from Blueprint
            </Button>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Product Management</h1>
              <p className="text-muted-foreground">Manage your product catalog</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Sync from Printify
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Sync Products</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    To add products, use the Printify Admin page to sync products from your Printify store.
                  </p>
                  <Button
                    onClick={() => {
                      setDialogOpen(false);
                      navigate('/printify-admin');
                    }}
                    className="w-full"
                  >
                    Go to Printify Admin
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {products.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-bold mb-2">No Products Yet</h3>
              <p className="text-muted-foreground mb-4">
                Sync products from Printify to get started
              </p>
              <Button onClick={() => navigate('/printify-admin')}>
                Go to Printify Admin
              </Button>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {Array.isArray(product.images) && product.images[0] ? (
                          <img
                            src={product.images[0].src}
                            alt={product.title}
                            className="h-12 w-12 object-cover rounded"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{product.title}</TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category || 'Uncategorized'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={product.is_active}
                          onCheckedChange={() => toggleProductStatus(product.id, product.is_active)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/product/${product.printify_product_id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductManagement;
