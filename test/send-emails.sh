# One‑liner curl commands to test all live email edge functions
# Replace <PROJECT_REF> with your Supabase project reference
curl -X POST https://<PROJECT_REF>.supabase.co/functions/v1/send-welcome-email   -H "Content-Type: application/json" -d "{\"email\":\"ivllnv.000@gmail.com\",\"name\":\"Test User\"}"
curl -X POST https://<PROJECT_REF>.supabase.co/functions/v1/send-shipping-notification -H "Content-Type: application/json" -d "{\"email\":\"ivllnv.000@gmail.com\",\"orderId\":\"TEST12345\",\"trackingNumber\":\"TRACK123\",\"trackingUrl\":\"https://track.example.com/TRACK123\"}"
curl -X POST https://<PROJECT_REF>.supabase.co/functions/v1/send-order-confirmation   -H "Content-Type: application/json" -d "{\"email\":\"ivllnv.000@gmail.com\",\"orderId\":\"TEST12345\",\"totalAmount\":99.99}"
curl -X POST https://<PROJECT_REF>.supabase.co/functions/v1/send-delivery-notification -H "Content-Type: application/json" -d "{\"email\":\"ivllnv.000@gmail.com\",\"orderId\":\"TEST12345\"}"
