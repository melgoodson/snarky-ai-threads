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
  const [bulkCreateResult, setBulkCreateResult] = useState<any>(null);
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

  const createBulkProducts = async () => {
    setLoading(true);
    setBulkCreateResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-bulk-printify-products');
      
      if (error) throw error;
      
      setBulkCreateResult(data);
      
      if (data.success) {
        const successCount = data.results.filter((r: any) => r.success).length;
        toast({
          title: "Products created!",
          description: `Successfully created ${successCount} out of ${data.results.length} products`,
        });
      } else {
        toast({
          title: "Creation failed",
          description: data.error || "Failed to create products",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Bulk product creation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create products",
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

        {/* Webhook Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Webhook Setup
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

        {/* Bulk Product Creation */}
        <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Create Your 5 Products
            </CardTitle>
            <CardDescription>
              Automatically create Tote Bag, T-Shirt (10 colors), Hoodie (10 colors), Mug, and Greeting Cards in Printify
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={createBulkProducts} 
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Products...
                </>
              ) : (
                "Create Products in Printify"
              )}
            </Button>

            {bulkCreateResult && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="space-y-3">
                  {bulkCreateResult.results.map((result: any, index: number) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-background rounded"
                    >
                      <div>
                        <p className="text-sm font-medium">{result.title}</p>
                        {result.success && (
                          <p className="text-xs text-muted-foreground">
                            {result.variantCount} variants created
                          </p>
                        )}
                      </div>
                      {result.success ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <Check className="h-4 w-4" />
                          <span className="text-xs">Created</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600">
                          <X className="h-4 w-4" />
                          <span className="text-xs">Failed</span>
                        </span>
                      )}
                    </div>
                  ))}
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
              Product Sync
            </CardTitle>
            <CardDescription>
              Sync published products from Printify to your database
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
            <ol className="list-decimal list-inside space-y-1">
              <li>Click "Setup Webhooks" to register all webhooks</li>
              <li>Click "Sync Products" to import your Printify products</li>
              <li>Check the results to verify everything worked</li>
              <li>Your store is ready to display real products!</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrintifyAdmin;
