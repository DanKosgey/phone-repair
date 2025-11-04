-- Test database customer search queries

-- Test 1: Search customers by name
SELECT 
  id,
  name,
  email,
  phone
FROM public.customers 
WHERE name ILIKE '%john%'
ORDER BY name
LIMIT 20;

-- Test 2: Search customers by email
SELECT 
  id,
  name,
  email,
  phone
FROM public.customers 
WHERE email ILIKE '%gmail%'
ORDER BY name
LIMIT 20;

-- Test 3: Search customers by phone
SELECT 
  id,
  name,
  email,
  phone
FROM public.customers 
WHERE phone ILIKE '%123%'
ORDER BY name
LIMIT 20;

-- Test 4: Combined search (name, email, or phone)
SELECT 
  id,
  name,
  email,
  phone
FROM public.customers 
WHERE name ILIKE '%john%' 
   OR email ILIKE '%john%' 
   OR phone ILIKE '%john%'
ORDER BY name
LIMIT 20;

-- Test 5: Get ticket counts for customers
SELECT 
  c.id,
  c.name,
  c.email,
  c.phone,
  COUNT(t.id) as ticket_count
FROM public.customers c
LEFT JOIN public.tickets t ON c.id = t.customer_id
WHERE c.name ILIKE '%john%'
GROUP BY c.id, c.name, c.email, c.phone
ORDER BY c.name
LIMIT 20;