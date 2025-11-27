import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X, Webhook, Database, ArrowLeft } from "lucide-react";

const PrintifyAdmin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [webhookResult, setWebhookResult] = useState<any>(null);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [linkResult, setLinkResult] = useState<any>(null);
  const { toast } = useToast();

  const setupWebhooks = async () => {
    setLoading(true);
    setWebhookResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('setup-printify-webhooks');
      
      if (error) throw error;
      
      setWebhookResult(data);
      
      if (data.success) {
        toast({
          title: "Webhooks registered!",
          description: `Successfully registered ${data.results.filter((r: any) => r.status === 'success').length} webhooks`,
        });
      } else {
        toast({
          title: "Partial success",
          description: "Some webhooks failed to register. Check results below.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Webhook setup error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to setup webhooks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const syncProducts = async () => {
    setLoading(true);
    setSyncResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('sync-printify-products');
      
      if (error) throw error;
      
      setSyncResult(data);
      
      if (data.success) {
        toast({
          title: "Products synced!",
          description: `Successfully synced ${data.syncedCount} out of ${data.totalProducts} products`,
        });
      } else {
        toast({
          title: "Sync failed",
          description: data.error || "Failed to sync products",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Product sync error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sync products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const linkProducts = async () => {
    setLoading(true);
    setLinkResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('link-printify-products');
      
      if (error) throw error;
      
      setLinkResult(data);
      
      if (data.success) {
        toast({
          title: "Products linked!",
          description: `Successfully linked ${data.summary.linked} out of ${data.summary.total} products`,
        });
      } else {
        toast({
          title: "Link failed",
          description: data.error || "Failed to link products",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Product linking error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to link products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin
        </Button>
        
        <div>
          <h1 className="text-4xl font-bold mb-2">Printify Integration Admin</h1>
          <p className="text-muted-foreground">
            Set up webhooks and sync products from your Printify store
          </p>
        </div>

        {/* Product Linking - MOST IMPORTANT STEP */}
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Database className="h-6 w-6" />
              Step 1: Detect & Link Products from Printify
            </CardTitle>
            <CardDescription className="text-base">
              This will find the products you manually created in Printify and link them to your database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">📋 Instructions:</p>
              <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                <li>Make sure you've created 5 products in Printify manually first</li>
                <li>Click the button below to automatically detect and link them</li>
                <li>Products are matched by title (flexible matching)</li>
              </ol>
            </div>

            <Button 
              onClick={linkProducts} 
              disabled={loading}
              size="lg"
              className="w-full sm:w-auto text-base h-12"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Detecting & Linking...
                </>
              ) : (
                "Detect & Link Products from Printify"
              )}
            </Button>

            {linkResult && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="mb-3">
                  <p className="text-sm font-semibold">
                    Linked {linkResult.summary?.linked || 0} of {linkResult.summary?.total || 0} products
                  </p>
                </div>
                <div className="space-y-3">
                  {linkResult.results?.map((result: any, index: number) => (
                    <div 
                      key={index}
                      className={`p-3 rounded ${
                        result.status === 'linked' 
                          ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800'
                          : 'bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{result.dbProductTitle}</p>
                          {result.status === 'linked' ? (
                            <p className="text-xs text-muted-foreground mt-1">
                              ✓ Linked to "{result.printifyProductTitle}" ({result.variantCount} variants)
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground mt-1">
                              ⚠ No matching Printify product found
                            </p>
                          )}
                        </div>
                        {result.status === 'linked' ? (
                          <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Webhook Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Step 2: Webhook Setup
            </CardTitle>
            <CardDescription>
              Register webhooks to receive order status updates (shipped, delivered, canceled)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={setupWebhooks} 
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Setup Webhooks"
              )}
            </Button>

            {webhookResult && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Shop ID: <code className="text-xs">{webhookResult.shop_id}</code>
                  </p>
                  <p className="text-sm font-medium">
                    Webhook URL: <code className="text-xs break-all">{webhookResult.webhook_url}</code>
                  </p>
                  
                  <div className="mt-4">
                    <p className="text-sm font-semibold mb-2">Results:</p>
                    <div className="space-y-2">
                      {webhookResult.results.map((result: any, index: number) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-2 bg-background rounded"
                        >
                          <span className="text-sm">{result.event}</span>
                          {result.status === 'success' || result.status === 'exists' ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <Check className="h-4 w-4" />
                              <span className="text-xs">{result.status === 'exists' ? 'Already exists' : 'Registered'}{result.note ? ` • ${result.note}` : ''}</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-600">
                              <X className="h-4 w-4" />
                              <span className="text-xs">{result.error}</span>
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Step 3: Product Sync
            </CardTitle>
            <CardDescription>
              After creating products, sync them to your database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={syncProducts} 
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                "Sync Products"
              )}
            </Button>

            {syncResult && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Total products:</span> {syncResult.totalProducts}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Synced:</span> {syncResult.syncedCount}
                  </p>
                  {syncResult.success ? (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <Check className="h-4 w-4" />
                      Sync completed successfully
                    </p>
                  ) : (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <X className="h-4 w-4" />
                      Sync failed: {syncResult.error}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="text-sm">Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <ol className="list-decimal list-inside space-y-2">
              <li><strong>Manually create products in Printify:</strong> Create your 5 products (T-Shirt, Hoodie, Mug, Tote Bag, Greeting Cards) in Printify first</li>
              <li><strong>Link Products:</strong> Click "Detect & Link Products from Printify" to automatically link them</li>
              <li><strong>Setup Webhooks:</strong> Register webhooks for order updates</li>
              <li><strong>Done!</strong> Your products are now linked and ready for orders</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrintifyAdmin;
