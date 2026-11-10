-- ====================================================================
-- ACS UTTAR PRADESH PHARMACY NETWORK — SUPABASE INITIAL SEED DATA
-- Complete statutory stores, verified medicine inventory & UPPC staff
-- ====================================================================

INSERT INTO public.stores (
  id, slug, slug_aliases, name, district, city, address, maps_url, phone, whatsapp, email,
  owner_name, license20, license21, gstin, established_year, operating_hours, is_24x7, photo_url, gallery_photos, pin, status, rating
) VALUES (
  'store-up-001', 'deoria-drug-house', ARRAY['deoria-drug-house', 'deoria-drug', 'akhil-deoria', 'sanjeevani-medicos'], 'Deoria Drug House', 'Deoria', 'Deoria',
  'Subhash Chowk, Station Road, Deoria, Uttar Pradesh - 274001', 'https://maps.app.goo.gl/CKJeaQEBoWBaTEPX7', '+91 94152 83910', '+919415283910', 'akhil@acs.com',
  'Akhileshwar Tripathi', 'UP/DEO/2022/20/1908', 'UP/DEO/2022/21/1909', '09AABFD3912K1Z9', '1998',
  '08:00 AM - 10:30 PM (Emergency 24x7)', true, 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=1200&q=80',
  '[{"id":"gal-ddh-01","url":"https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=1200&q=80","title":"Main Storefront & Dispensing Counter","category":"Exterior & Front"},{"id":"gal-ddh-02","url":"https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=1200&q=80","title":"Ethical & Prescription Medicine Bays","category":"Medicine Racks"},{"id":"gal-ddh-03","url":"https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=1200&q=80","title":"Cold Chain 2-8°C Biologicals & Insulin Vault","category":"Cold Storage"},{"id":"gal-ddh-04","url":"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80","title":"Surgical Instruments & Orthopedic Care Counter","category":"Surgical & Diagnostic"},{"id":"gal-ddh-05","url":"https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1200&q=80","title":"Pharmacist Consultation & Digital Billing Desk","category":"Consultation & Billing"}]'::jsonb, '1998', 'Verified', 4.9
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, photo_url = EXCLUDED.photo_url;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-ddh-001', 'store-up-001', 'Augmentin 625 Duo Tablet', 'Amoxicillin 500mg + Potassium Clavulanate 125mg', 'GlaxoSmithKline Pharmaceuticals', 'BAT-AUG-9120',
  '2027-08-15', 120, 'Strips (10 tabs)', 168,
  223.5, '+1', 'Schedule H',
  'Rack A-01', 25
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-ddh-002', 'store-up-001', 'Dolo 650 Tablet', 'Paracetamol 650mg', 'Micro Labs Ltd', 'BAT-DOL-4811',
  '2028-02-10', 350, 'Strips (15 tabs)', 23.5,
  34, '', 'OTC',
  'Rack B-01', 50
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-ddh-003', 'store-up-001', 'Pan-D Capsule', 'Pantoprazole 40mg + Domperidone 30mg', 'Alkem Laboratories', 'BAT-PAN-7712',
  '2027-11-20', 180, 'Strips (15 caps)', 155,
  215, '', 'Schedule H',
  'Rack C-02', 40
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-ddh-004', 'store-up-001', 'Hifen 200 DT Tablet', 'Cefixime 200mg Dispersible Tablet', 'Aristo Pharmaceuticals', 'BAT-HIF-1092',
  '2027-10-15', 100, 'Strips (10 tabs)', 78.5,
  110, '+1', 'Schedule H1',
  'Rack A-02', 20
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-ddh-005', 'store-up-001', 'Telma 40 Tablet', 'Telmisartan 40mg', 'Glenmark Pharmaceuticals', 'BAT-TEL-5102',
  '2027-09-15', 160, 'Strips (15 tabs)', 142,
  198, '', 'Schedule H',
  'Rack D-01', 30
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-ddh-006', 'store-up-001', 'Azithral 500 Tablet', 'Azithromycin 500mg', 'Alembic Pharmaceuticals', 'BAT-AZI-8821',
  '2027-05-10', 45, 'Strips (5 tabs)', 98,
  132, '', 'Schedule H1',
  'Rack A-04', 20
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-ddh-007', 'store-up-001', 'Liv.52 DS Syrup', 'Ayurvedic Herbal Liver Formulation', 'Himalaya Wellness', 'BAT-LIV-9821',
  '2027-12-01', 75, 'Bottles (200ml)', 125,
  175, '+1', 'Ayush / OTC',
  'Rack E-02', 15
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.staff_members (
  id, store_id, name, role, uppc_reg_no, qualification, reg_date, valid_upto, phone, shift, is_registered_pharmacist, is_aadhaar_verified, is_on_duty, avatar_url
) VALUES (
  'st-deo-101', 'store-up-001', 'Akhileshwar Tripathi', 'Chief Pharmacist & Store Owner', 'UPPC-PH-29841', 'B.Pharm (KGMU / UP Tech Univ)',
  '2015-05-18', '2030-05-17', '+91 94152 83910', 'Morning & General (09:00 AM - 05:00 PM)',
  true, true,
  true, ''
) ON CONFLICT (id) DO UPDATE SET is_on_duty = EXCLUDED.is_on_duty;

INSERT INTO public.staff_members (
  id, store_id, name, role, uppc_reg_no, qualification, reg_date, valid_upto, phone, shift, is_registered_pharmacist, is_aadhaar_verified, is_on_duty, avatar_url
) VALUES (
  'st-deo-102', 'store-up-001', 'Rajeshwar Pandey', 'Duty Pharmacist', 'UPPC-PH-48912', 'D.Pharm (Board of Technical Education UP)',
  '2020-08-14', '2028-08-13', '+91 98394 55102', 'Evening (04:00 PM - 10:30 PM)',
  true, true,
  true, ''
) ON CONFLICT (id) DO UPDATE SET is_on_duty = EXCLUDED.is_on_duty;

INSERT INTO public.staff_members (
  id, store_id, name, role, uppc_reg_no, qualification, reg_date, valid_upto, phone, shift, is_registered_pharmacist, is_aadhaar_verified, is_on_duty, avatar_url
) VALUES (
  'st-deo-103', 'store-up-001', 'Vikas Kumar Shukla', 'Inventory & Billing Associate', 'N/A (Non-Technical)', 'B.Com',
  'N/A', 'N/A', '+91 87650 91823', 'Full Day (09:00 AM - 08:00 PM)',
  true, true,
  false, ''
) ON CONFLICT (id) DO UPDATE SET is_on_duty = EXCLUDED.is_on_duty;

INSERT INTO public.stores (
  id, slug, slug_aliases, name, district, city, address, maps_url, phone, whatsapp, email,
  owner_name, license20, license21, gstin, established_year, operating_hours, is_24x7, photo_url, gallery_photos, pin, status, rating
) VALUES (
  'store-up-002', 'maa-vindhyavasini-medicos-deoria', ARRAY['maa-vindhyavasini-medicos', 'vindhyavasini-deoria'], 'Maa Vindhyavasini Medicos & Healthcare', 'Deoria', 'Deoria',
  'Shop No. 4, CC Road, Raghav Nagar, Deoria, Uttar Pradesh - 274001', 'https://maps.google.com/?q=Raghav+Nagar+Deoria+Uttar+Pradesh', '+91 94502 18940', '+919450218940', 'vindhyavasini.medicos@gmail.com',
  'Pandit Satish Chandra Shukla', 'UP/DEO/2021/20/2410', 'UP/DEO/2021/21/2411', '09AALPS4419M1ZZ', '2014',
  '08:30 AM - 10:30 PM', false, 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=1200&q=80',
  '[{"id":"gal-mvm-01","url":"https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=1200&q=80","title":"Storefront & Patient Reception Area","category":"Exterior & Front"},{"id":"gal-mvm-02","url":"https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=1200&q=80","title":"Organized Prescription Racks & Drawers","category":"Medicine Racks"},{"id":"gal-mvm-03","url":"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80","title":"Health Supplements & Diagnostics Section","category":"Healthcare & OTC"}]'::jsonb, '1998', 'Verified', 4.8
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, photo_url = EXCLUDED.photo_url;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-mvm-01', 'store-up-002', 'Telma 40 Tablet', 'Telmisartan 40mg', 'Glenmark Pharmaceuticals', 'BAT-TEL-5102',
  '2027-09-15', 110, 'Strips (15 tabs)', 142,
  198, '', 'Schedule H',
  'Rack A-02', 20
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-mvm-02', 'store-up-002', 'Montek-LC Tablet', 'Montelukast 10mg + Levocetirizine 5mg', 'Sun Pharma', 'BAT-MON-4412',
  '2027-04-10', 85, 'Strips (10 tabs)', 134,
  188, '', 'Schedule H',
  'Rack B-04', 25
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-mvm-03', 'store-up-002', 'Liv.52 DS Syrup', 'Ayurvedic Herbal Liver Formulation', 'Himalaya Wellness', 'BAT-LIV-9821',
  '2027-12-01', 90, 'Bottles (200ml)', 125,
  175, '', 'Ayush / OTC',
  'Rack C-01', 15
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-mvm-04', 'store-up-002', 'Dolo 650 Tablet', 'Paracetamol 650mg', 'Micro Labs Ltd', 'BAT-DOL-3312',
  '2028-03-20', 280, 'Strips (15 tabs)', 23.5,
  34, '', 'OTC',
  'Rack B-01', 40
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.staff_members (
  id, store_id, name, role, uppc_reg_no, qualification, reg_date, valid_upto, phone, shift, is_registered_pharmacist, is_aadhaar_verified, is_on_duty, avatar_url
) VALUES (
  'st-mvm-201', 'store-up-002', 'Satish Chandra Shukla', 'Chief Pharmacist & Store Owner', 'UPPC-PH-33108', 'B.Pharm (Gorakhpur Univ)',
  '2016-07-22', '2026-07-21', '+91 94502 18940', 'Day Shift (09:00 AM - 06:00 PM)',
  true, true,
  true, ''
) ON CONFLICT (id) DO UPDATE SET is_on_duty = EXCLUDED.is_on_duty;

INSERT INTO public.staff_members (
  id, store_id, name, role, uppc_reg_no, qualification, reg_date, valid_upto, phone, shift, is_registered_pharmacist, is_aadhaar_verified, is_on_duty, avatar_url
) VALUES (
  'st-mvm-202', 'store-up-002', 'Abhishek Dwivedi', 'Pharmacist', 'UPPC-PH-51902', 'D.Pharm',
  '2021-03-10', '2026-03-09', '+91 98380 19283', 'Evening (02:00 PM - 10:30 PM)',
  true, true,
  true, ''
) ON CONFLICT (id) DO UPDATE SET is_on_duty = EXCLUDED.is_on_duty;

INSERT INTO public.stores (
  id, slug, slug_aliases, name, district, city, address, maps_url, phone, whatsapp, email,
  owner_name, license20, license21, gstin, established_year, operating_hours, is_24x7, photo_url, gallery_photos, pin, status, rating
) VALUES (
  'store-up-003', 'kushwaha-medical-store-deoria', ARRAY['kushwaha-medicals', 'kushwaha-store-deoria'], 'Kushwaha Medical Store & Surgical', 'Deoria', 'Deoria',
  'Civil Lines, Near Maharshi Devraha Baba Medical College / Sadar Hospital, Deoria - 274001', 'https://maps.google.com/?q=Civil+Lines+Deoria+Hospital+Uttar+Pradesh', '+91 98391 20455', '+919839120455', 'kushwaha.medicals.deoria@gmail.com',
  'Ramesh Chandra Kushwaha', 'UP/DEO/2020/20/1882', 'UP/DEO/2020/21/1883', '09ABCK9901R1Z8', '2011',
  '24x7 Emergency Service', true, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80',
  '[{"id":"gal-kms-01","url":"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80","title":"24x7 Hospital Emergency Counter","category":"Emergency Care"},{"id":"gal-kms-02","url":"https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=1200&q=80","title":"Life-Saving Antibiotics & IV Infusions Bay","category":"Critical Medicines"}]'::jsonb, '1998', 'Verified', 4.7
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, photo_url = EXCLUDED.photo_url;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-kms-01', 'store-up-003', 'Augmentin 625 Duo Tablet', 'Amoxicillin 500mg + Potassium Clavulanate 125mg', 'GlaxoSmithKline Pharmaceuticals', 'BAT-AUG-7812',
  '2027-10-31', 140, 'Strips (10 tabs)', 168,
  223.5, '', 'Schedule H',
  'Rack A-01', 30
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-kms-02', 'store-up-003', 'Azithral 500 Tablet', 'Azithromycin 500mg', 'Alembic Pharmaceuticals', 'BAT-AZI-4419',
  '2027-06-25', 60, 'Strips (5 tabs)', 98,
  132, '', 'Schedule H1',
  'Rack A-05', 20
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-kms-03', 'store-up-003', 'Pan-D Capsule', 'Pantoprazole 40mg + Domperidone 30mg', 'Alkem Laboratories', 'BAT-PAN-9102',
  '2027-12-15', 210, 'Strips (15 caps)', 155,
  215, '', 'Schedule H',
  'Rack B-02', 35
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.staff_members (
  id, store_id, name, role, uppc_reg_no, qualification, reg_date, valid_upto, phone, shift, is_registered_pharmacist, is_aadhaar_verified, is_on_duty, avatar_url
) VALUES (
  'st-kms-301', 'store-up-003', 'Ramesh Chandra Kushwaha', 'Chief Pharmacist', 'UPPC-PH-28109', 'B.Pharm (Deoria Tech)',
  '2013-04-10', '2028-04-09', '+91 98391 20455', 'Morning (08:00 AM - 04:00 PM)',
  true, true,
  true, ''
) ON CONFLICT (id) DO UPDATE SET is_on_duty = EXCLUDED.is_on_duty;

INSERT INTO public.staff_members (
  id, store_id, name, role, uppc_reg_no, qualification, reg_date, valid_upto, phone, shift, is_registered_pharmacist, is_aadhaar_verified, is_on_duty, avatar_url
) VALUES (
  'st-kms-302', 'store-up-003', 'Sanjay Kushwaha', 'Night Incharge Pharmacist', 'UPPC-PH-59012', 'D.Pharm',
  '2022-01-15', '2027-01-14', '+91 94158 99120', 'Night Shift (10:00 PM - 08:00 AM)',
  true, true,
  false, ''
) ON CONFLICT (id) DO UPDATE SET is_on_duty = EXCLUDED.is_on_duty;

INSERT INTO public.stores (
  id, slug, slug_aliases, name, district, city, address, maps_url, phone, whatsapp, email,
  owner_name, license20, license21, gstin, established_year, operating_hours, is_24x7, photo_url, gallery_photos, pin, status, rating
) VALUES (
  'store-up-004', 'raghav-chemist-deoria', ARRAY['raghav-chemist', 'raghav-medicals-deoria'], 'Raghav Chemist & Druggists', 'Deoria', 'Deoria',
  'Malviya Road, Ram Gulam Tola, Deoria, Uttar Pradesh - 274001', 'https://maps.google.com/?q=Malviya+Road+Ram+Gulam+Tola+Deoria', '+91 94158 44321', '+919415844321', 'raghav.chemist.deoria@gmail.com',
  'Raghavendra Nath Tiwari', 'UP/DEO/2019/20/1429', 'UP/DEO/2019/21/1430', '09ACCPT8890K1ZY', '2008',
  '08:00 AM - 10:00 PM', false, 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1200&q=80',
  '[{"id":"gal-rcd-01","url":"https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1200&q=80","title":"Malviya Road Retail Storefront","category":"Exterior & Front"},{"id":"gal-rcd-02","url":"https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=1200&q=80","title":"Complete Range of Pediatric & Senior Care Medicines","category":"Family Health"}]'::jsonb, '1998', 'Verified', 4.8
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, photo_url = EXCLUDED.photo_url;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-rcd-01', 'store-up-004', 'Dolo 650 Tablet', 'Paracetamol 650mg', 'Micro Labs Ltd', 'BAT-DOL-7719',
  '2028-01-20', 290, 'Strips (15 tabs)', 23.5,
  34, '', 'OTC',
  'Rack B-01', 45
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-rcd-02', 'store-up-004', 'Liv.52 DS Syrup', 'Ayurvedic Herbal Liver Formulation', 'Himalaya Wellness', 'BAT-LIV-8820',
  '2027-11-15', 65, 'Bottles (200ml)', 125,
  175, '', 'Ayush / OTC',
  'Rack C-02', 15
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-rcd-03', 'store-up-004', 'Telma 40 Tablet', 'Telmisartan 40mg', 'Glenmark Pharmaceuticals', 'BAT-TEL-8812',
  '2027-08-10', 120, 'Strips (15 tabs)', 142,
  198, '', 'Schedule H',
  'Rack D-02', 20
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.staff_members (
  id, store_id, name, role, uppc_reg_no, qualification, reg_date, valid_upto, phone, shift, is_registered_pharmacist, is_aadhaar_verified, is_on_duty, avatar_url
) VALUES (
  'st-rcd-401', 'store-up-004', 'Raghavendra Nath Tiwari', 'Chief Pharmacist & Owner', 'UPPC-PH-24510', 'B.Pharm (Gorakhpur)',
  '2010-09-18', '2030-09-17', '+91 94158 44321', 'Morning & Evening',
  true, true,
  true, ''
) ON CONFLICT (id) DO UPDATE SET is_on_duty = EXCLUDED.is_on_duty;

INSERT INTO public.stores (
  id, slug, slug_aliases, name, district, city, address, maps_url, phone, whatsapp, email,
  owner_name, license20, license21, gstin, established_year, operating_hours, is_24x7, photo_url, gallery_photos, pin, status, rating
) VALUES (
  'store-up-005', 'ganga-medical-hall-kanpur', ARRAY['ganga-medicals', 'ganga-chemist-kanpur'], 'Ganga Medical Hall & Healthcare', 'Kanpur Nagar', 'Kanpur',
  '14/112, Mall Road, Near Phoolbagh, Kanpur Nagar, Uttar Pradesh - 208001', 'https://maps.google.com/?q=Mall+Road+Phoolbagh+Kanpur+Nagar', '+91 94150 49182', '+919415049182', 'ganga.medical.kanpur@gmail.com',
  'Sunil Kumar Gupta', 'UP/KNP/2018/20/3901', 'UP/KNP/2018/21/3902', '09AABCG8192F1Z4', '2004',
  '08:00 AM - 11:00 PM', false, 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=1200&q=80',
  '[{"id":"gal-gmh-01","url":"https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=1200&q=80","title":"Mall Road Storefront Facade","category":"Exterior & Front"},{"id":"gal-gmh-02","url":"https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=1200&q=80","title":"Cardiovascular & Chronic Therapy Section","category":"Chronic Care"}]'::jsonb, '1998', 'Verified', 4.9
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, photo_url = EXCLUDED.photo_url;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-gmh-01', 'store-up-005', 'Augmentin 625 Duo Tablet', 'Amoxicillin 500mg + Potassium Clavulanate 125mg', 'GlaxoSmithKline Pharmaceuticals', 'BAT-AUG-8802',
  '2027-09-30', 130, 'Strips (10 tabs)', 168,
  223.5, '', 'Schedule H',
  'Rack A-01', 25
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-gmh-02', 'store-up-005', 'Pan-D Capsule', 'Pantoprazole 40mg + Domperidone 30mg', 'Alkem Laboratories', 'BAT-PAN-8812',
  '2027-10-20', 160, 'Strips (15 caps)', 155,
  215, '', 'Schedule H',
  'Rack C-02', 30
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-gmh-03', 'store-up-005', 'Azithral 500 Tablet', 'Azithromycin 500mg', 'Alembic Pharmaceuticals', 'BAT-AZI-6102',
  '2027-06-10', 45, 'Strips (5 tabs)', 98,
  132, '', 'Schedule H1',
  'Rack A-05', 20
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.staff_members (
  id, store_id, name, role, uppc_reg_no, qualification, reg_date, valid_upto, phone, shift, is_registered_pharmacist, is_aadhaar_verified, is_on_duty, avatar_url
) VALUES (
  'st-gmh-501', 'store-up-005', 'Sunil Kumar Gupta', 'Chief Pharmacist & Proprietor', 'UPPC-PH-21094', 'B.Pharm (GSVM Medical College Kanpur)',
  '2006-05-12', '2026-05-11', '+91 94150 49182', 'Day Shift (08:30 AM - 05:00 PM)',
  true, true,
  true, ''
) ON CONFLICT (id) DO UPDATE SET is_on_duty = EXCLUDED.is_on_duty;

INSERT INTO public.staff_members (
  id, store_id, name, role, uppc_reg_no, qualification, reg_date, valid_upto, phone, shift, is_registered_pharmacist, is_aadhaar_verified, is_on_duty, avatar_url
) VALUES (
  'st-gmh-502', 'store-up-005', 'Pawan Agnihotri', 'Pharmacist', 'UPPC-PH-49811', 'D.Pharm',
  '2019-10-02', '2029-10-01', '+91 98390 12781', 'Evening (04:00 PM - 11:00 PM)',
  true, true,
  true, ''
) ON CONFLICT (id) DO UPDATE SET is_on_duty = EXCLUDED.is_on_duty;

INSERT INTO public.stores (
  id, slug, slug_aliases, name, district, city, address, maps_url, phone, whatsapp, email,
  owner_name, license20, license21, gstin, established_year, operating_hours, is_24x7, photo_url, gallery_photos, pin, status, rating
) VALUES (
  'store-up-006', 'awadh-care-chemist-lucknow', ARRAY['awadh-care-chemist', 'awadh-lucknow', 'sanjeevani-lucknow'], 'Awadh Care Chemist & Surgical', 'Lucknow', 'Lucknow',
  'Shop 18, Near Civil Hospital, Hazratganj, Lucknow, Uttar Pradesh - 226001', 'https://maps.google.com/?q=Civil+Hospital+Hazratganj+Lucknow', '+91 94150 28419', '+919415028419', 'awadhcare.hazratganj@gmail.com',
  'Dr. Manvendra Pratap Singh', 'UP/LKO/2021/20/4891', 'UP/LKO/2021/21/4892', '09AABCS1429P1ZK', '2012',
  '24x7 Emergency Service', true, 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=1200&q=80',
  '[{"id":"gal-acc-01","url":"https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=1200&q=80","title":"Hazratganj Main Dispensary","category":"Exterior & Front"},{"id":"gal-acc-02","url":"https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=1200&q=80","title":"Emergency Care & Critical Injectables Racks","category":"Emergency & Racks"}]'::jsonb, '1998', 'Verified', 4.8
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, photo_url = EXCLUDED.photo_url;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-acc-01', 'store-up-006', 'Augmentin 625 Duo Tablet', 'Amoxicillin 500mg + Potassium Clavulanate 125mg', 'GlaxoSmithKline Pharmaceuticals', 'BAT-AUG-9912',
  '2027-08-31', 140, 'Strips (10 tabs)', 168,
  223.5, '', 'Schedule H',
  'Rack A-04', 25
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-acc-02', 'store-up-006', 'Dolo 650 Tablet', 'Paracetamol 650mg', 'Micro Labs Ltd', 'BAT-DOL-4102',
  '2028-01-15', 320, 'Strips (15 tabs)', 23.5,
  34, '', 'OTC',
  'Rack B-01', 50
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-acc-03', 'store-up-006', 'Pan-D Capsule', 'Pantoprazole 40mg + Domperidone 30mg', 'Alkem Laboratories', 'BAT-PAN-6014',
  '2027-11-20', 210, 'Strips (15 caps)', 155,
  215, '', 'Schedule H',
  'Rack C-02', 40
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.staff_members (
  id, store_id, name, role, uppc_reg_no, qualification, reg_date, valid_upto, phone, shift, is_registered_pharmacist, is_aadhaar_verified, is_on_duty, avatar_url
) VALUES (
  'st-acc-601', 'store-up-006', 'Deepak Verma', 'Chief Pharmacist', 'UPPC-PH-41290', 'B.Pharm (KGMU Lucknow)',
  '2018-06-15', '2028-06-14', '+91 98390 12894', 'Morning (08:00 AM - 04:00 PM)',
  true, true,
  true, ''
) ON CONFLICT (id) DO UPDATE SET is_on_duty = EXCLUDED.is_on_duty;

INSERT INTO public.staff_members (
  id, store_id, name, role, uppc_reg_no, qualification, reg_date, valid_upto, phone, shift, is_registered_pharmacist, is_aadhaar_verified, is_on_duty, avatar_url
) VALUES (
  'st-acc-602', 'store-up-006', 'Pooja Mishra', 'Assistant Pharmacist', 'UPPC-PH-58932', 'D.Pharm (UP Board of Tech)',
  '2021-09-10', '2026-09-09', '+91 94500 48211', 'Evening (04:00 PM - 12:00 AM)',
  true, true,
  true, ''
) ON CONFLICT (id) DO UPDATE SET is_on_duty = EXCLUDED.is_on_duty;

INSERT INTO public.stores (
  id, slug, slug_aliases, name, district, city, address, maps_url, phone, whatsapp, email,
  owner_name, license20, license21, gstin, established_year, operating_hours, is_24x7, photo_url, gallery_photos, pin, status, rating
) VALUES (
  'store-up-007', 'apoorva-tripathi-medicos-deoria', ARRAY['apoorva-tripathi-medicos', 'aporvaa-tripathi-medicos', 'apoorva-tripathi-deoria', 'aporvaa-tripathi-medicos-deoria', 'apoorva-medicos-deoria'], 'Apoorva Tripathi Medicos', 'Deoria', 'Deoria',
  'Saket Nagar, Station Road, Deoria, Uttar Pradesh - 274001', '', '+91 80040 34320', '918004034320', 'contact@apoorvatripathimedicos.com',
  'Apoorva Tripathi', 'UP/DEO/2023/20/3142', 'UP/DEO/2023/21/3134', '09AABCT8192M1Z5', '2023',
  '08:00 AM - 10:30 PM', true, 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80',
  '[{"id":"gp-store-up-007-1","tag":"Store Front","url":"https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80","title":"Storefront & Main Signboard","caption":"Apoorva Tripathi Medicos, Saket Nagar, Station Road, Deoria","isPrimary":true},{"id":"gp-store-up-007-2","tag":"Dispensing","url":"https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=800&q=80","title":"Medicine Racks & Dispensing Desk","caption":"Statutory medicine storage with UPPC pharmacist consultation counter","isPrimary":false}]'::jsonb, '1998', 'Verified', 4.9
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, photo_url = EXCLUDED.photo_url;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-atm-01', 'store-up-007', 'Augmentin 625 Duo Tablet', 'Amoxicillin 500mg + Potassium Clavulanate 125mg', 'GlaxoSmithKline Pharmaceuticals', 'BAT-AUG-5501',
  '2027-08-31', 80, 'Strips (10 tabs)', 165,
  220, '', 'Schedule H',
  'Rack A-01', 25
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-atm-02', 'store-up-007', 'Paracetamol 650mg', 'Paracetamol IP 650mg', 'Micro Labs Ltd', 'BAT-GEN-101',
  '2028-12-31', 100, 'Strips (10 tabs)', 20,
  30, '', 'OTC',
  'Rack A-02', 20
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-atm-03', 'store-up-007', 'Azithral 500 Tablet', 'Azithromycin 500mg', 'Alembic Pharmaceuticals', 'AZ-8812',
  '2027-06-30', 60, 'Strips (5 tabs)', 98,
  132, '', 'Schedule H1',
  'Rack B-01', 15
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-atm-04', 'store-up-007', 'Pan-D Capsule', 'Pantoprazole 40mg + Domperidone 30mg', 'Alkem Laboratories', 'PAN-4412',
  '2027-11-30', 90, 'Strips (15 caps)', 155,
  215, '', 'Schedule H',
  'Rack B-02', 20
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.staff_members (
  id, store_id, name, role, uppc_reg_no, qualification, reg_date, valid_upto, phone, shift, is_registered_pharmacist, is_aadhaar_verified, is_on_duty, avatar_url
) VALUES (
  'st-007-1', 'store-up-007', 'Apoorva Tripathi', 'Proprietor & Registered Pharmacist', 'UPPC-PH-49218', 'B.Pharm, R.Ph (UP)',
  '2021-04-12', '2031-12-31', '+91 80040 34320', 'General Shift / 24x7 Emergency',
  true, true,
  true, ''
) ON CONFLICT (id) DO UPDATE SET is_on_duty = EXCLUDED.is_on_duty;

INSERT INTO public.stores (
  id, slug, slug_aliases, name, district, city, address, maps_url, phone, whatsapp, email,
  owner_name, license20, license21, gstin, established_year, operating_hours, is_24x7, photo_url, gallery_photos, pin, status, rating
) VALUES (
  'store-up-008', 'kapoor-medicos', ARRAY['kapoor-medicos', 'kapoor-medical-store', 'kapoor-chemist', 'kapoor-medicos-deoria', 'pharmacy-kapoor-medicos'], 'Kapoor Medicos', 'Deoria', 'Deoria',
  'Station Road, Near Railway Station, Deoria, Uttar Pradesh - 274001', 'https://maps.google.com/?q=Kapoor+Medicos+Station+Road+Deoria', '+91 94152 77889', '+919415277889', 'contact@kapoor-medicos.in',
  'Dr. Rakesh Kapoor', 'UP/DEO/2023/20/4182', 'UP/DEO/2023/21/4183', '09AABCK8899M1Z3', '2005',
  '08:00 AM - 10:30 PM (Emergency 24x7)', true, 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=1200&q=80',
  '[{"id":"gal-kap-01","url":"https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=1200&q=80","title":"Storefront & Main Signboard","category":"Exterior & Front","tag":"Store Front","isPrimary":true},{"id":"gal-kap-02","url":"https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=1200&q=80","title":"Interior Medicine Racks & Prescription Bays","category":"Medicine Racks","tag":"Medicine Racks","isPrimary":false},{"id":"gal-kap-03","url":"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80","title":"Dispensing Counter & Digital POS Billing","category":"Dispensing & Billing","tag":"Dispensing Counter","isPrimary":false},{"id":"gal-kap-04","url":"https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=1200&q=80","title":"2-8°C Cold Chain Refrigerator Vault","category":"Cold Storage","tag":"Cold Storage","isPrimary":false},{"id":"gal-kap-05","url":"https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1200&q=80","title":"Signboard & Front Entrance","category":"Signage & Entrance","tag":"Signboard","isPrimary":false},{"id":"gal-kap-06","url":"https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=1200&q=80","title":"Pharmacist Consultation Desk & Licensure Display","category":"Consultation & Licensure","tag":"Licensure Wall","isPrimary":false}]'::jsonb, '1998', 'Verified', 4.9
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, photo_url = EXCLUDED.photo_url;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-kap-001', 'store-up-008', 'Augmentin 625 Duo Tablet', 'Amoxicillin 500mg + Potassium Clavulanate 125mg', 'GlaxoSmithKline Pharmaceuticals', 'BAT-AUG-9912',
  '2027-08-31', 100, 'Strips (10 tabs)', 165,
  220, '+1', 'Schedule H',
  'Rack A-01', 25
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-kap-002', 'store-up-008', 'Dolo 650 Tablet', 'Paracetamol IP 650mg', 'Micro Labs Ltd', 'BAT-DOL-3310',
  '2028-11-30', 150, 'Strips (15 tabs)', 24.5,
  34, '', 'OTC',
  'Rack A-02', 30
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-kap-003', 'store-up-008', 'Azithral 500 Tablet', 'Azithromycin IP 500mg', 'Alembic Pharmaceuticals Ltd', 'BAT-AZI-8801',
  '2027-10-31', 80, 'Strips (5 tabs)', 89,
  122, '+1', 'Schedule H',
  'Rack A-03', 20
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-kap-004', 'store-up-008', 'Pan-D Capsule', 'Pantoprazole 40mg + Domperidone 30mg SR', 'Alkem Laboratories Ltd', 'BAT-PAN-6012',
  '2028-05-31', 110, 'Strips (15 caps)', 145,
  199, '', 'Schedule H',
  'Rack B-01', 25
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-kap-005', 'store-up-008', 'Electral Oral Rehydration Salts', 'WHO Formula Oral Electrolyte Powder (21.8g)', 'FDC Ltd', 'BAT-ELC-1090',
  '2028-09-30', 200, 'Sachets (21.8g)', 15,
  22, '+2', 'OTC',
  'Rack B-02', 40
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.medicine_stocks (
  id, store_id, name, salt_name, manufacturer, batch_no, expiry_date, quantity, unit, purchase_rate, mrp, free_scheme, schedule, rack_location, min_alert_threshold
) VALUES (
  'med-kap-006', 'store-up-008', 'Montek-LC Tablet', 'Montelukast 10mg + Levocetirizine 5mg', 'Sun Pharmaceutical Industries Ltd', 'BAT-MLC-4421',
  '2027-12-31', 90, 'Strips (10 tabs)', 128,
  178, '', 'Schedule H',
  'Rack B-03', 20
) ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, mrp = EXCLUDED.mrp, purchase_rate = EXCLUDED.purchase_rate;

INSERT INTO public.staff_members (
  id, store_id, name, role, uppc_reg_no, qualification, reg_date, valid_upto, phone, shift, is_registered_pharmacist, is_aadhaar_verified, is_on_duty, avatar_url
) VALUES (
  'st-kap-001', 'store-up-008', 'Dr. Rakesh Kapoor', 'Chief Pharmacist & Store Owner', 'UPPC-PH-38910', 'B.Pharm, R.Ph (UP)',
  '2012-07-15', '2032-07-14', '+91 94152 77889', 'General Shift / 24x7 Emergency',
  true, true,
  true, ''
) ON CONFLICT (id) DO UPDATE SET is_on_duty = EXCLUDED.is_on_duty;
