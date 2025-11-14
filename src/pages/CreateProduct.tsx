import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface Blueprint {
  id: number;
  title: string;
  description: string;
  brand: string;
  model: string;
}

interface PrintProvider {
  id: number;
  title: string;
}

interface Variant {
  id: number;
  title: string;
  options: Record<string, string>;
}

const CreateProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingBlueprints, setLoadingBlueprints] = useState(true);
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [selectedBlueprint, setSelectedBlueprint] = useState<string>("");
  const [blueprintDetails, setBlueprintDetails] = useState<any>(null);
  const [providers, setProviders] = useState<PrintProvider[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedVariants, setSelectedVariants] = useState<number[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    checkAdminAccess();
    fetchBlueprints();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (!roles?.some(r => r.role === 'admin')) {
      navigate('/');
      toast.error('Access denied');
    }
  };

  const fetchBlueprints = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-printify-blueprints');
      
      if (error) throw error;
      
      setBlueprints(data || []);
    } catch (error) {
      console.error('Error fetching blueprints:', error);
      toast.error('Failed to load blueprints');
    } finally {
      setLoadingBlueprints(false);
    }
  };

  const fetchBlueprintDetails = async (blueprintId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-printify-blueprint-details', {
        body: { blueprintId },
      });
      
      if (error) throw error;
      
      setBlueprintDetails(data.blueprint);
      setProviders(data.providers || []);
      setVariants(data.variants || []);
      
      if (data.providers?.length > 0) {
        setSelectedProvider(data.providers[0].id.toString());
      }
    } catch (error) {
      console.error('Error fetching blueprint details:', error);
      toast.error('Failed to load blueprint details');
    } finally {
      setLoading(false);
    }
  };

  const handleBlueprintChange = (blueprintId: string) => {
    setSelectedBlueprint(blueprintId);
    setSelectedVariants([]);
    if (blueprintId) {
      fetchBlueprintDetails(blueprintId);
    }
  };

  const toggleVariant = (variantId: number) => {
    setSelectedVariants(prev => 
      prev.includes(variantId) 
        ? prev.filter(id => id !== variantId)
        : [...prev, variantId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !selectedBlueprint || !selectedProvider || selectedVariants.length === 0) {
      toast.error('Please fill in all required fields and select at least one variant');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-printify-product', {
        body: {
          blueprintId: selectedBlueprint,
          title,
          description,
          printProviderId: selectedProvider,
          variantIds: selectedVariants,
          printAreas: blueprintDetails?.print_areas || [],
          tags: [blueprintDetails?.brand || 'Custom'],
        },
      });

      if (error) throw error;

      toast.success('Product created successfully!');
      navigate('/product-management');
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => navigate('/product-management')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Create New Product from Printify Blueprint</CardTitle>
            <CardDescription>
              Select a blueprint and configure your product
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Blueprint Selection */}
              <div className="space-y-2">
                <Label htmlFor="blueprint">Blueprint *</Label>
                {loadingBlueprints ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading blueprints...</span>
                  </div>
                ) : (
                  <Select value={selectedBlueprint} onValueChange={handleBlueprintChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a blueprint" />
                    </SelectTrigger>
                    <SelectContent>
                      {blueprints.map((blueprint) => (
                        <SelectItem key={blueprint.id} value={blueprint.id.toString()}>
                          {blueprint.brand} - {blueprint.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-2">
                <Label htmlFor="title">Product Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Custom Design T-Shirt"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Product description..."
                  rows={4}
                />
              </div>

              {/* Print Provider */}
              {providers.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="provider">Print Provider *</Label>
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a print provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id.toString()}>
                          {provider.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Variants */}
              {variants.length > 0 && (
                <div className="space-y-2">
                  <Label>Variants * (Select at least one)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-4 border rounded-lg">
                    {variants.map((variant) => (
                      <div key={variant.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`variant-${variant.id}`}
                          checked={selectedVariants.includes(variant.id)}
                          onCheckedChange={() => toggleVariant(variant.id)}
                        />
                        <label
                          htmlFor={`variant-${variant.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {variant.title}
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedVariants.length} variant(s) selected
                  </p>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Product...
                  </>
                ) : (
                  'Create Product'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default CreateProduct;
