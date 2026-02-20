import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

const TeeinblueAdmin = () => {
  const navigate = useNavigate();
  const [syncingProducts, setSyncingProducts] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);

  const syncProducts = async () => {
    setSyncingProducts(true);
    setSyncResult(null);

    try {
      const { data, error } = await supabase.functions.invoke(
        "sync-teeinblue-products"
      );

      if (error) throw error;

      setSyncResult(data);
      toast.success(data.message || "Products synced successfully!");
    } catch (error: any) {
      console.error("Error syncing products:", error);
      toast.error(error.message || "Failed to sync products");
    } finally {
      setSyncingProducts(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background p-8">
        <div className="container mx-auto max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin
          </Button>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Teeinblue Integration</h1>
              <p className="text-muted-foreground mt-2">
                Manage your Teeinblue product catalog and order fulfillment
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Product Sync</CardTitle>
                <CardDescription>
                  Sync your products from Teeinblue to your store. This will import all
                  products with their variants, images, and pricing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={syncProducts}
                  disabled={syncingProducts}
                  className="w-full"
                >
                  {syncingProducts ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Syncing Products...
                    </>
                  ) : (
                    "Sync Products"
                  )}
                </Button>

                {syncResult && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2">Sync Results</h3>
                    <pre className="text-sm overflow-auto">
                      {JSON.stringify(syncResult, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Fulfillment</CardTitle>
                <CardDescription>
                  Orders are automatically sent to Teeinblue when customers checkout.
                  You'll receive webhook updates for order status changes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>✅ Automatic order creation in Teeinblue</p>
                  <p>✅ Real-time order status updates via webhooks</p>
                  <p>✅ Tracking information synced to your database</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Webhook URL</CardTitle>
                <CardDescription>
                  Configure this URL in your Teeinblue dashboard to receive order updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <code className="block p-3 bg-muted rounded text-sm break-all">
                  {import.meta.env.VITE_SUPABASE_URL}/functions/v1/teeinblue-webhook
                </code>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TeeinblueAdmin;
