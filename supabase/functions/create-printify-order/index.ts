import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to upload base64 image to storage and return public URL
async function uploadBase64ToStorage(
  supabase: any,
  base64Data: string,
  orderId: string,
  itemId: string
): Promise<string | null> {
  try {
    // Extract the base64 content (remove data:image/xxx;base64, prefix)
    const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      console.error('Invalid base64 image format');
      return null;
    }
    
    const imageType = matches[1]; // png, jpeg, etc.
    const base64Content = matches[2];
    
    // Decode base64 to binary
    const imageData = decode(base64Content);
    
    // Generate unique filename
    const fileName = `${orderId}/${itemId}-design.${imageType}`;
    
    console.log(`Uploading design image to storage: ${fileName}`);
    
    // Upload to storage
    const { data, error } = await supabase.storage
      .from('design-images')
      .upload(fileName, imageData, {
        contentType: `image/${imageType}`,
        upsert: true,
      });
    
    if (error) {
      console.error('Error uploading to storage:', error);
      return null;
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('design-images')
      .getPublicUrl(fileName);
    
    console.log(`Design image uploaded successfully: ${publicUrlData.publicUrl}`);
    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Error in uploadBase64ToStorage:', err);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();

    if (!orderId) {
      throw new Error('Order ID is required');
    }

    const printifyApiToken = Deno.env.get('PRINTIFY_API_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!printifyApiToken) {
      throw new Error('PRINTIFY_API_TOKEN not configured');
    }

    console.log('Creating Printify order for order:', orderId);

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    console.log('Order details:', order);

    // Get shop ID
    const shopsResponse = await fetch('https://api.printify.com/v1/shops.json', {
      headers: {
        'Authorization': `Bearer ${printifyApiToken}`,
        'Content-Type': 'application/json',
      },
    });

    const shops = await shopsResponse.json();
    const shopId = shops[0]?.id;

    if (!shopId) {
      throw new Error('No Printify shop found');
    }

    // Build line items with valid variant IDs and print areas
    const lineItems = [];
    
    for (const item of order.order_items) {
      let variantId = item.variant_id;
      
      // If variant_id is missing or "placeholder", look up a valid enabled variant
      if (!variantId || variantId === 'placeholder' || variantId === 'undefined') {
        console.log(`Item ${item.id} has invalid variant_id: ${variantId}, looking up default variant...`);
        
        // Fetch the product to get its variants
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('variants')
          .eq('id', item.product_id)
          .single();
        
        if (productError || !product) {
          console.error(`Could not find product ${item.product_id}:`, productError);
          throw new Error(`Product not found for item: ${item.product_id}`);
        }
        
        // Find the first enabled variant
        const variants = product.variants || [];
        const enabledVariant = variants.find((v: any) => v.is_enabled === true);
        
        if (!enabledVariant) {
          console.error(`No enabled variants found for product ${item.product_id}`);
          throw new Error(`No enabled variants available for product. Please configure variants in Printify.`);
        }
        
        variantId = enabledVariant.id;
        console.log(`Using default enabled variant: ${variantId} (${enabledVariant.title})`);
        
        // Update the order item with the correct variant ID for future reference
        await supabase
          .from('order_items')
          .update({ variant_id: String(variantId) })
          .eq('id', item.id);
      }
      
      // Build line item with print_areas if design image is available
      const lineItem: any = {
        product_id: item.printify_product_id,
        variant_id: Number(variantId),
        quantity: item.quantity,
      };
      
      // Handle design image URL - may be base64 or HTTPS URL
      let designUrl = item.design_image_url;
      
      // Check if it's a base64 data URL - upload to storage first
      if (designUrl && typeof designUrl === 'string' && designUrl.startsWith('data:image/')) {
        console.log(`Design image is base64, uploading to storage...`);
        const publicUrl = await uploadBase64ToStorage(supabase, designUrl, orderId, item.id);
        if (publicUrl) {
          designUrl = publicUrl;
          // Update the order item with the permanent URL
          await supabase
            .from('order_items')
            .update({ design_image_url: publicUrl })
            .eq('id', item.id);
        } else {
          console.error('Failed to upload base64 image to storage');
          designUrl = null;
        }
      }
      
      // Add print_areas with the design image URL for custom prints
      // Skip invalid values like "[object Object]" or empty strings
      if (designUrl && typeof designUrl === 'string' && 
          !designUrl.includes('[object') && 
          designUrl.startsWith('http')) {
        console.log(`Adding print_areas with design image: ${designUrl}`);
        lineItem.print_areas = {
          front: designUrl,
        };
      } else {
        console.log(`Invalid or missing design_image_url for item ${item.id}: "${designUrl}", order will use product's default print`);
      }
      
      lineItems.push(lineItem);
    }

    const shippingAddress = order.shipping_address;

    // Country name to ISO code mapping
    const countryCodeMap: Record<string, string> = {
      'philippines': 'PH',
      'united states': 'US',
      'usa': 'US',
      'united kingdom': 'GB',
      'uk': 'GB',
      'canada': 'CA',
      'australia': 'AU',
      'germany': 'DE',
      'france': 'FR',
      'japan': 'JP',
      'china': 'CN',
      'india': 'IN',
      'brazil': 'BR',
      'mexico': 'MX',
      'spain': 'ES',
      'italy': 'IT',
      'netherlands': 'NL',
      'singapore': 'SG',
      'south korea': 'KR',
      'new zealand': 'NZ',
    };

    // Convert country name to ISO code if needed
    let countryCode = shippingAddress.country;
    const countryLower = countryCode?.toLowerCase();
    if (countryLower && countryCodeMap[countryLower]) {
      countryCode = countryCodeMap[countryLower];
    } else if (countryCode && countryCode.length > 2) {
      // If it's still a full country name and not in our map, log warning
      console.warn(`Unknown country name: ${countryCode}, attempting to use as-is`);
    }

    // Create order in Printify
    const printifyOrderData = {
      external_id: orderId,
      label: `Order ${orderId}`,
      line_items: lineItems,
      shipping_method: 1, // Standard shipping
      send_shipping_notification: true,
      address_to: {
        first_name: shippingAddress.firstName,
        last_name: shippingAddress.lastName,
        email: order.email,
        phone: shippingAddress.phone,
        country: countryCode,
        region: shippingAddress.state,
        address1: shippingAddress.address1,
        address2: shippingAddress.address2 || '',
        city: shippingAddress.city,
        zip: shippingAddress.zip,
      },
    };

    console.log('Creating Printify order with data:', printifyOrderData);

    const createOrderResponse = await fetch(
      `https://api.printify.com/v1/shops/${shopId}/orders.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${printifyApiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(printifyOrderData),
      }
    );

    if (!createOrderResponse.ok) {
      const errorText = await createOrderResponse.text();
      console.error('Printify order creation failed:', errorText);
      throw new Error(`Failed to create Printify order: ${errorText}`);
    }

    const printifyOrder = await createOrderResponse.json();
    console.log('Printify order created:', printifyOrder);

    // Store Printify order mapping
    const { error: mappingError } = await supabase
      .from('printify_orders')
      .insert({
        order_id: orderId,
        printify_order_id: printifyOrder.id,
        printify_status: printifyOrder.status,
      });

    if (mappingError) {
      console.error('Error storing Printify order mapping:', mappingError);
    }

    // Update order status
    await supabase
      .from('orders')
      .update({ status: 'processing' })
      .eq('id', orderId);

    return new Response(
      JSON.stringify({
        success: true,
        printifyOrderId: printifyOrder.id,
        status: printifyOrder.status,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in create-printify-order:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
