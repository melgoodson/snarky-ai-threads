-- ============================================================
-- Admin Order Dashboard: Schema Enhancements
-- ============================================================

-- 1. New columns on orders for payment tracking, tags, and lifecycle
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
  ADD COLUMN IF NOT EXISTS admin_tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS customer_note TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;

-- 2. Create order_notes table for admin notes and activity timeline
CREATE TABLE public.order_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note_type TEXT NOT NULL DEFAULT 'admin_note'
    CHECK (note_type IN ('admin_note', 'status_change', 'fulfillment_update', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.order_notes ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for order_notes (admin-only)
CREATE POLICY "Admins can view all order notes"
  ON public.order_notes FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert order notes"
  ON public.order_notes FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update order notes"
  ON public.order_notes FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete order notes"
  ON public.order_notes FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_email ON public.orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON public.orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_order_notes_order_id ON public.order_notes(order_id);
CREATE INDEX IF NOT EXISTS idx_order_notes_created_at ON public.order_notes(created_at DESC);
