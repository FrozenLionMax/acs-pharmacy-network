-- ====================================================================
-- ACS UTTAR PRADESH PHARMACY NETWORK — SUPABASE POSTGRESQL MASTER SCHEMA
-- Production database definition for licensed retail pharmacies,
-- live medicine inventory, UPPC pharmacist roster & POS ledger
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. STORES TABLE
CREATE TABLE IF NOT EXISTS public.stores (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    slug_aliases TEXT[] DEFAULT '{}',
    name TEXT NOT NULL,
    district TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    maps_url TEXT,
    phone TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    email TEXT,
    owner_name TEXT NOT NULL,
    license20 TEXT NOT NULL,
    license21 TEXT NOT NULL,
    gstin TEXT NOT NULL,
    established_year TEXT DEFAULT '2000',
    operating_hours TEXT DEFAULT '08:00 AM - 10:30 PM',
    is_24x7 BOOLEAN DEFAULT FALSE,
    photo_url TEXT,
    gallery_photos JSONB DEFAULT '[]'::jsonb,
    pin TEXT DEFAULT '1998',
    status TEXT DEFAULT 'Active',
    rating NUMERIC(3, 2) DEFAULT 4.90,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MEDICINE STOCKS TABLE
CREATE TABLE IF NOT EXISTS public.medicine_stocks (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    salt_name TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    batch_no TEXT NOT NULL,
    expiry_date TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit TEXT DEFAULT '10 Tablets / Strip',
    purchase_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    mrp NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    free_scheme TEXT DEFAULT '',
    schedule TEXT DEFAULT 'Non-Schedule / OTC',
    rack_location TEXT DEFAULT 'Rack A-01',
    min_alert_threshold INTEGER DEFAULT 15,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STAFF MEMBERS TABLE (UPPC Pharmacists & Attendants)
CREATE TABLE IF NOT EXISTS public.staff_members (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    uppc_reg_no TEXT,
    qualification TEXT NOT NULL,
    reg_date TEXT,
    valid_upto TEXT,
    phone TEXT,
    shift TEXT DEFAULT 'Day Shift (08:00 AM - 04:00 PM)',
    is_registered_pharmacist BOOLEAN DEFAULT TRUE,
    is_aadhaar_verified BOOLEAN DEFAULT TRUE,
    is_on_duty BOOLEAN DEFAULT TRUE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PRESCRIPTIONS & VERIFICATION QUEUE
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    notes TEXT,
    file_name TEXT,
    file_data TEXT,
    matched_medicines JSONB DEFAULT '[]'::jsonb,
    total_estimate NUMERIC(10, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. POS TRANSACTIONS & REVENUE LEDGER
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    invoice_no TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'cash_memo',
    patient_name TEXT,
    doctor_name TEXT,
    items_summary TEXT,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_mode TEXT DEFAULT 'Cash',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_stores_slug ON public.stores(slug);
CREATE INDEX IF NOT EXISTS idx_stores_district ON public.stores(district);
CREATE INDEX IF NOT EXISTS idx_stocks_store ON public.medicine_stocks(store_id);
CREATE INDEX IF NOT EXISTS idx_stocks_name ON public.medicine_stocks(name);
CREATE INDEX IF NOT EXISTS idx_stocks_salt ON public.medicine_stocks(salt_name);
CREATE INDEX IF NOT EXISTS idx_staff_store ON public.staff_members(store_id);
CREATE INDEX IF NOT EXISTS idx_rx_store ON public.prescriptions(store_id);
CREATE INDEX IF NOT EXISTS idx_txn_store ON public.transactions(store_id);

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicine_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running to prevent error 42710
DROP POLICY IF EXISTS "Public Read Stores" ON public.stores;
DROP POLICY IF EXISTS "Public Read Stocks" ON public.medicine_stocks;
DROP POLICY IF EXISTS "Public Read Staff" ON public.staff_members;
DROP POLICY IF EXISTS "Public Read Prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Public Read Transactions" ON public.transactions;

DROP POLICY IF EXISTS "Write Stores" ON public.stores;
DROP POLICY IF EXISTS "Write Stocks" ON public.medicine_stocks;
DROP POLICY IF EXISTS "Write Staff" ON public.staff_members;
DROP POLICY IF EXISTS "Write Prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Write Transactions" ON public.transactions;

-- Allow public read of verified stores, stock availability & statutory pharmacists
CREATE POLICY "Public Read Stores" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Public Read Stocks" ON public.medicine_stocks FOR SELECT USING (true);
CREATE POLICY "Public Read Staff" ON public.staff_members FOR SELECT USING (true);
CREATE POLICY "Public Read Prescriptions" ON public.prescriptions FOR SELECT USING (true);
CREATE POLICY "Public Read Transactions" ON public.transactions FOR SELECT USING (true);

-- Allow authenticated/anon modifications
CREATE POLICY "Write Stores" ON public.stores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Write Stocks" ON public.medicine_stocks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Write Staff" ON public.staff_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Write Prescriptions" ON public.prescriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Write Transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

-- 9. REALTIME BROADCAST ENABLEMENT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'medicine_stocks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.medicine_stocks;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'stores'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.stores;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'staff_members'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_members;
  END IF;
END $$;

-- 10. ATOMIC ACID POS DISPENSING STORED PROCEDURE (RPC)
CREATE OR REPLACE FUNCTION public.dispense_pos_bill(
    p_store_id TEXT,
    p_med_id TEXT,
    p_quantity INT,
    p_invoice_no TEXT,
    p_patient_name TEXT,
    p_doc_name TEXT,
    p_items_summary TEXT,
    p_amount NUMERIC,
    p_payment_mode TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_stock INT;
    v_new_stock INT;
BEGIN
    -- 1. Lock and retrieve current inventory row for atomic consistency
    SELECT quantity INTO v_current_stock
    FROM public.medicine_stocks
    WHERE id = p_med_id AND store_id = p_store_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Medicine SKU % not found in store %', p_med_id, p_store_id;
    END IF;

    IF v_current_stock < p_quantity THEN
        RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %', v_current_stock, p_quantity;
    END IF;

    -- 2. Decrement stock
    v_new_stock := v_current_stock - p_quantity;
    UPDATE public.medicine_stocks
    SET quantity = v_new_stock, updated_at = NOW()
    WHERE id = p_med_id AND store_id = p_store_id;

    -- 3. Record itemized transaction cash memo
    INSERT INTO public.transactions (
        id,
        store_id,
        type,
        patient_name,
        doctor_name,
        items_summary,
        amount,
        payment_mode,
        created_at
    ) VALUES (
        p_invoice_no,
        p_store_id,
        'cash_memo',
        p_patient_name,
        p_doc_name,
        p_items_summary,
        p_amount,
        p_payment_mode,
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN jsonb_build_object(
        'success', true,
        'invoice_no', p_invoice_no,
        'medicine_id', p_med_id,
        'previous_quantity', v_current_stock,
        'new_quantity', v_new_stock
    );
END;
$$;

-- Grant execution permission to public/anon
GRANT EXECUTE ON FUNCTION public.dispense_pos_bill TO anon, authenticated, service_role;

