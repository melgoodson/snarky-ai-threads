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
    const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      console.error('Invalid base64 image format');
      return null;
    }
    
    const imageType = matches[1];
    const base64Content = matches[2];
    const imageData = decode(base64Content);
    const fileName = `${orderId}/${itemId}-design.${imageType}`;
    
    console.log(`Uploading design image to storage: ${fileName}`);
    
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

// Helper function to upload image to Printify and get the IMAGE ID (not preview_url)
async function uploadImageToPrintify(
  imageUrl: string,
  printifyApiToken: string,
  fileName: string
): Promise<{ id: string; width: number; height: number } | null> {
  try {
    console.log(`Uploading image to Printify: ${imageUrl}`);
    
    const response = await fetch('https://api.printify.com/v1/uploads/images.json', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${printifyApiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_name: fileName,
        url: imageUrl,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Printify image upload failed:', errorText);
      return null;
    }
    
    const data = await response.json();
    console.log('Printify image uploaded successfully:', data);
    // Return the image ID and dimensions - needed for product creation
    return {
      id: data.id,
      width: data.width || 1024,
      height: data.height || 1024,
    };
  } catch (err) {
    console.error('Error uploading image to Printify:', err);
    return null;
  }
}

// Helper function to get blueprint details for a product
async function getBlueprintInfo(
  printifyProductId: string,
  shopId: string,
  printifyApiToken: string
): Promise<{ blueprintId: number; printProviderId: number } | null> {
  try {
    const response = await fetch(
      `https://api.printify.com/v1/shops/${shopId}/products/${printifyProductId}.json`,
      {
        headers: {
          'Authorization': `Bearer ${printifyApiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      console.error('Failed to fetch product details:', await response.text());
      return null;
    }
    
    const product = await response.json();
    return {
      blueprintId: product.blueprint_id,
      printProviderId: product.print_provider_id,
    };
  } catch (err) {
    console.error('Error getting blueprint info:', err);
    return null;
  }
}

// Helper function to create a new Printify product with custom design
async function createPrintifyProductWithDesign(
  shopId: string,
  printifyApiToken: string,
  blueprintId: number,
  printProviderId: number,
  variantId: number,
  imageId: string,
  imageWidth: number,
  imageHeight: number,
  orderId: string,
  itemId: string
): Promise<string | null> {
  try {
    console.log(`Creating custom Printify product for order ${orderId}, item ${itemId}`);
    console.log(`Blueprint: ${blueprintId}, Provider: ${printProviderId}, Variant: ${variantId}`);
    
    // First, get the blueprint's print areas to understand the proper placeholder structure
    const printAreasResponse = await fetch(
      `https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers/${printProviderId}/print_areas.json`,
      {
        headers: {
          'Authorization': `Bearer ${printifyApiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!printAreasResponse.ok) {
      console.error('Failed to fetch print areas:', await printAreasResponse.text());
      return null;
    }
    
    const printAreasData = await printAreasResponse.json();
    console.log('Blueprint print areas:', JSON.stringify(printAreasData, null, 2));
    
    // Find the front print area placeholder
    const frontPrintArea = printAreasData.print_areas?.find((pa: any) => pa.variant_ids.includes(variantId));
    
    if (!frontPrintArea) {
      console.error(`No print area found for variant ${variantId}`);
      return null;
    }
    
    const frontPlaceholder = frontPrintArea.placeholders?.find((p: any) => p.position === 'front');
    
    if (!frontPlaceholder) {
      console.error('No front placeholder found');
      return null;
    }
    
    console.log('Using placeholder:', frontPlaceholder);
    
    // Calculate proper positioning - center the image in the print area
    const placeholderWidth = frontPlaceholder.width || 1800;
    const placeholderHeight = frontPlaceholder.height || 2400;
    
    // Scale image to fit within placeholder while maintaining aspect ratio
    const scale = Math.min(
      placeholderWidth / imageWidth,
      placeholderHeight / imageHeight,
      1 // Don't scale up beyond 100%
    );
    
    const scaledWidth = imageWidth * scale;
    const scaledHeight = imageHeight * scale;
    
    // Center the image in the placeholder
    const x = (placeholderWidth - scaledWidth) / 2;
    const y = (placeholderHeight - scaledHeight) / 2;
    
    // Create the product with the custom design
    const productData = {
      title: `Custom Order ${orderId} - Item ${itemId.slice(0, 8)}`,
      description: 'Custom design product for order fulfillment',
      blueprint_id: blueprintId,
      print_provider_id: printProviderId,
      variants: [
        {
          id: variantId,
          price: 100, // Price in cents (doesn't matter for order)
          is_enabled: true,
        }
      ],
      print_areas: [
        {
          variant_ids: [variantId],
          placeholders: [
            {
              position: 'front',
              images: [
                {
                  id: imageId,
                  x: x,
                  y: y,
                  scale: scale,
                  angle: 0,
                }
              ]
            }
          ]
        }
      ]
    };
    
    console.log('Creating product with data:', JSON.stringify(productData, null, 2));
    
    const createResponse = await fetch(
      `https://api.printify.com/v1/shops/${shopId}/products.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${printifyApiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      }
    );
    
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Failed to create custom product:', errorText);
      return null;
    }
    
    const newProduct = await createResponse.json();
    console.log('Custom product created:', newProduct.id);
    
    return newProduct.id;
  } catch (err) {
    console.error('Error creating custom product:', err);
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

    console.log('Using shop ID:', shopId);

    // Build line items - for custom designs, create new products
    const lineItems = [];
    const createdProductIds: string[] = []; // Track products to clean up if needed
    
    for (const item of order.order_items) {
      let variantId = item.variant_id;
      
      // If variant_id is missing or "placeholder", look up a valid enabled variant
      if (!variantId || variantId === 'placeholder' || variantId === 'undefined') {
        console.log(`Item ${item.id} has invalid variant_id: ${variantId}, looking up default variant...`);
        
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('variants')
          .eq('id', item.product_id)
          .single();
        
        if (productError || !product) {
          console.error(`Could not find product ${item.product_id}:`, productError);
          throw new Error(`Product not found for item: ${item.product_id}`);
        }
        
        const variants = product.variants || [];
        const enabledVariant = variants.find((v: any) => v.is_enabled === true);
        
        if (!enabledVariant) {
          console.error(`No enabled variants found for product ${item.product_id}`);
          throw new Error(`No enabled variants available for product. Please configure variants in Printify.`);
        }
        
        variantId = enabledVariant.id;
        console.log(`Using default enabled variant: ${variantId} (${enabledVariant.title})`);
        
        await supabase
          .from('order_items')
          .update({ variant_id: String(variantId) })
          .eq('id', item.id);
      }
      
      // Handle design image URL
      let designUrl = item.design_image_url;
      
      // Check if it's a base64 data URL - upload to storage first
      if (designUrl && typeof designUrl === 'string' && designUrl.startsWith('data:image/')) {
        console.log(`Design image is base64, uploading to storage...`);
        const publicUrl = await uploadBase64ToStorage(supabase, designUrl, orderId, item.id);
        if (publicUrl) {
          designUrl = publicUrl;
          await supabase
            .from('order_items')
            .update({ design_image_url: publicUrl })
            .eq('id', item.id);
        } else {
          console.error('Failed to upload base64 image to storage');
          designUrl = null;
        }
      }
      
      // Check if we have a valid design URL to create a custom product
      let productIdToUse = item.printify_product_id;
      
      if (designUrl && typeof designUrl === 'string' && 
          !designUrl.includes('[object') && 
          designUrl.startsWith('http')) {
        
        // Step 1: Upload image to Printify and get the image ID
        const uploadResult = await uploadImageToPrintify(
          designUrl, 
          printifyApiToken,
          `order-${orderId}-item-${item.id}.png`
        );
        
        if (uploadResult) {
          console.log(`Image uploaded to Printify with ID: ${uploadResult.id}`);
          
          // Step 2: Get the blueprint info from the original product
          const blueprintInfo = await getBlueprintInfo(
            item.printify_product_id,
            shopId,
            printifyApiToken
          );
          
          if (blueprintInfo) {
            // Step 3: Create a new product with the custom design
            const customProductId = await createPrintifyProductWithDesign(
              shopId,
              printifyApiToken,
              blueprintInfo.blueprintId,
              blueprintInfo.printProviderId,
              Number(variantId),
              uploadResult.id,
              uploadResult.width,
              uploadResult.height,
              orderId,
              item.id
            );
            
            if (customProductId) {
              productIdToUse = customProductId;
              createdProductIds.push(customProductId);
              console.log(`Using custom product ${customProductId} for order`);
            } else {
              console.log('Failed to create custom product, falling back to original product');
            }
          } else {
            console.log('Failed to get blueprint info, falling back to original product');
          }
        } else {
          console.log(`Failed to upload design to Printify for item ${item.id}`);
        }
      } else {
        console.log(`No valid design URL for item ${item.id}, using original product`);
      }
      
      // Build line item - NO print_areas here, design is already on the product
      lineItems.push({
        product_id: productIdToUse,
        variant_id: Number(variantId),
        quantity: item.quantity,
      });
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

    let countryCode = shippingAddress.country;
    const countryLower = countryCode?.toLowerCase();
    if (countryLower && countryCodeMap[countryLower]) {
      countryCode = countryCodeMap[countryLower];
    }

    // Create order in Printify - NO print_areas, just product references
    const printifyOrderData = {
      external_id: orderId,
      label: `Order ${orderId}`,
      line_items: lineItems,
      shipping_method: 1,
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

    console.log('Creating Printify order with data:', JSON.stringify(printifyOrderData, null, 2));

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
        customProductsCreated: createdProductIds,
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
