-- =========================================================================
-- SHREE SAI CLASSES - OFFICIAL SUPABASE POSTGRESQL DATABASE SCHEMA
-- Instructions: Copy and paste this script into your Supabase SQL Editor 
-- (Dashboard > SQL Editor > New Query) and click "Run" (Ctrl + Enter).
-- =========================================================================

-- Step 1: Clean drop of old tables & existing policies
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;

-- Step 2: Create Students Ledger Table
CREATE TABLE public.students (
    id TEXT PRIMARY KEY,
    receipt_no TEXT UNIQUE NOT NULL,                       -- Reg No. / Receipt No. (e.g. SSC-REC-2026-001)
    student_name TEXT NOT NULL,                            -- Name of Student
    standard TEXT NOT NULL DEFAULT 'SYJC (12th Commerce)', -- Std (e.g. SYJC, FYJC, Class 10..6)
    board TEXT DEFAULT 'CBSE',                             -- Board (CBSE, ICSE, IGCSE, SSC, HSC)
    course_name TEXT,                                      -- Course / Subject Package Title
    academic_year TEXT DEFAULT '2024-25',                  -- Academic Year
    contact_no TEXT,                                       -- Student Mobile
    parent_contact TEXT,                                   -- Parent Contact
    admission_date TEXT,                                   -- Date Of Admission (DD/MM/YYYY or YYYY-MM-DD)
    fees_date TEXT,                                        -- Fees Record Date
    report_date TEXT,                                      -- Ledger Sync Date
    total_fees NUMERIC NOT NULL DEFAULT 0,                 -- Yearly Fees (Gross Amount)
    discount NUMERIC NOT NULL DEFAULT 0,                   -- Scholarship / Concession
    grand_total NUMERIC NOT NULL DEFAULT 0,                -- Actual Fees (Net Payable)
    total_paid NUMERIC NOT NULL DEFAULT 0,                 -- Total Received From Parents
    balance_left NUMERIC NOT NULL DEFAULT 0,               -- PENDING (Outstanding Balance)
    status TEXT NOT NULL DEFAULT 'PENDING',                -- * Payment Status (PAID / PARTIAL / PENDING)
    installments JSONB NOT NULL DEFAULT '[]'::jsonb,       -- Installments Matrix [1..5] with amounts, dates, receipt nos & payment modes
    notes TEXT,                                            -- REMARK / Administrative Note
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create Institute Profile & Receipt Terms Table
CREATE TABLE public.settings (
    id TEXT PRIMARY KEY DEFAULT 'default_settings',
    institute_name TEXT NOT NULL DEFAULT 'SHREE SAI CLASSES',
    tagline TEXT DEFAULT 'A Choice of Better Life...! | Hard Work + Quality = Success',
    address TEXT DEFAULT 'Shiv Dham Society No. 5, Opp. BMC Colony, M. D. Nagar, Nallasopara (E)',
    phone TEXT DEFAULT '+91 7378756695 / +91 7378756653',
    email TEXT DEFAULT '',
    website TEXT DEFAULT 'www.shreesaiclasses.edu.in',
    receipt_prefix TEXT DEFAULT 'SSC-REC',
    terms JSONB DEFAULT '[
      "1. The receipt is subject to realisation of payment.",
      "2. This receipt should be carefully preserved and must be produced on demand.",
      "3. Fees once paid are strictly non-refundable and non-transferable under any circumstances.",
      "4. Shree Sai Classes reserves all rights for admission & schedule changes."
    ]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Enable Row Level Security (RLS) & Grant Access
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read and write access for students" 
    ON public.students 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Allow public read and write access for settings" 
    ON public.settings 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- Step 5: Insert Official Shree Sai Classes Institute Settings
INSERT INTO public.settings (
    id,
    institute_name,
    tagline,
    address,
    phone,
    email,
    website,
    receipt_prefix
) VALUES (
    'default_settings',
    'SHREE SAI CLASSES',
    'A Choice of Better Life...! | Hard Work + Quality = Success',
    'Shiv Dham Society No. 5, Opp. BMC Colony, M. D. Nagar, Nallasopara (E)',
    '+91 7378756695 / +91 7378756653',
    '',
    'www.shreesaiclasses.edu.in',
    'SSC-REC'
) ON CONFLICT (id) DO UPDATE SET
    institute_name = EXCLUDED.institute_name,
    tagline = EXCLUDED.tagline,
    address = EXCLUDED.address,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    website = EXCLUDED.website,
    receipt_prefix = EXCLUDED.receipt_prefix,
    updated_at = NOW();

-- Step 6: Insert Initial Verified Student Ledger Records
INSERT INTO public.students (
    id,
    receipt_no,
    student_name,
    standard,
    board,
    course_name,
    academic_year,
    contact_no,
    parent_contact,
    admission_date,
    total_fees,
    discount,
    grand_total,
    total_paid,
    balance_left,
    status,
    installments,
    notes
) VALUES (
    'stud-001',
    'SSC-REC-2026-001',
    'Shreyas Chavan',
    'SYJC (12th Commerce)',
    'HSC',
    'SYJC - COMMERCE (BK, Accounts, Maths, Eco, OCM)',
    '2024-25',
    '9820012345',
    '9820054321',
    '2024-06-15',
    45000,
    5000,
    40000,
    15000,
    25000,
    'PARTIAL',
    '[
      {"srNo": 1, "dueDate": "2024-06-15", "paidDate": "2024-06-15", "status": "PAID", "amount": 15000, "paymentMode": "Cash", "transactionDetails": "Cash Counter Receipt"},
      {"srNo": 2, "dueDate": "2024-09-15", "paidDate": "", "status": "PENDING", "amount": 12500, "paymentMode": "", "transactionDetails": ""},
      {"srNo": 3, "dueDate": "2024-11-15", "paidDate": "", "status": "PENDING", "amount": 12500, "paymentMode": "", "transactionDetails": ""}
    ]'::jsonb,
    'Installment 2 due in September'
), (
    'stud-002',
    'SSC-REC-2026-002',
    'Priya Sharma',
    'Class 10',
    'CBSE',
    'Class 10 - CBSE (All Subjects + Test Series)',
    '2024-25',
    '9819922334',
    '9819955667',
    '2024-07-01',
    35000,
    0,
    35000,
    35000,
    0,
    'PAID',
    '[
      {"srNo": 1, "dueDate": "2024-07-01", "paidDate": "2024-07-01", "status": "PAID", "amount": 20000, "paymentMode": "UPI", "transactionDetails": "GPay Ref #9382109"},
      {"srNo": 2, "dueDate": "2024-08-01", "paidDate": "2024-08-01", "status": "PAID", "amount": 15000, "paymentMode": "Cash", "transactionDetails": "Counter payment"}
    ]'::jsonb,
    '100% Fees Cleared'
) ON CONFLICT (receipt_no) DO NOTHING;
