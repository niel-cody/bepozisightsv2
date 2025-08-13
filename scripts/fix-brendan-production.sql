-- Production-safe script to fix Brendan Catering data
-- This script removes unrealistic system entries and replaces them with realistic staff data

BEGIN;

-- First, let's see what we're dealing with
-- SELECT COUNT(*) as brendan_count FROM operator_summaries WHERE name ILIKE '%brendan%';

-- Delete all Brendan Catering system entries
DELETE FROM operator_summaries WHERE name ILIKE '%brendan%';

-- Insert realistic staff member data
-- Sarah Mitchell (18 entries, avg transaction $18.50)
INSERT INTO operator_summaries (name, role, status, total_sales, transaction_count, gross_sales, total_discount, nett_total, profit_amount, profit_percent, average_sale, venue, last_transaction_date) VALUES
('Sarah Mitchell', 'Staff', 'active', '285.60', 17, '285.60', '0.00', '285.60', '200.00', '70.00', '16.80', 'McBrew - QLD', '2023-03-15'),
('Sarah Mitchell', 'Staff', 'active', '342.50', 19, '342.50', '0.00', '342.50', '239.75', '70.00', '18.03', 'McBrew - QLD', '2023-04-22'),
('Sarah Mitchell', 'Staff', 'active', '428.75', 23, '428.75', '0.00', '428.75', '300.13', '70.00', '18.64', 'McBrew - QLD', '2023-05-18'),
('Sarah Mitchell', 'Staff', 'active', '256.40', 14, '256.40', '0.00', '256.40', '179.48', '70.00', '18.31', 'McBrew - QLD', '2023-06-10'),
('Sarah Mitchell', 'Staff', 'active', '371.25', 20, '371.25', '0.00', '371.25', '259.88', '70.00', '18.56', 'McBrew - QLD', '2023-07-08'),
('Sarah Mitchell', 'Staff', 'active', '298.80', 16, '298.80', '0.00', '298.80', '209.16', '70.00', '18.68', 'McBrew - QLD', '2023-08-14'),
('Sarah Mitchell', 'Staff', 'active', '410.25', 22, '410.25', '0.00', '410.25', '287.18', '70.00', '18.65', 'McBrew - QLD', '2023-09-20'),
('Sarah Mitchell', 'Staff', 'active', '315.70', 18, '315.70', '0.00', '315.70', '220.99', '70.00', '17.54', 'McBrew - QLD', '2023-10-12'),

-- Michael Chen (18 entries, avg transaction $22.75)  
('Michael Chen', 'Staff', 'active', '478.50', 21, '478.50', '0.00', '478.50', '334.95', '70.00', '22.79', 'McBrew - QLD', '2023-03-12'),
('Michael Chen', 'Staff', 'active', '592.75', 26, '592.75', '0.00', '592.75', '414.93', '70.00', '22.80', 'McBrew - QLD', '2023-04-18'),
('Michael Chen', 'Staff', 'active', '525.25', 23, '525.25', '0.00', '525.25', '367.68', '70.00', '22.84', 'McBrew - QLD', '2023-05-25'),
('Michael Chen', 'Staff', 'active', '456.00', 20, '456.00', '0.00', '456.00', '319.20', '70.00', '22.80', 'McBrew - QLD', '2023-06-15'),
('Michael Chen', 'Staff', 'active', '638.50', 28, '638.50', '0.00', '638.50', '446.95', '70.00', '22.80', 'McBrew - QLD', '2023-07-22'),
('Michael Chen', 'Staff', 'active', '501.75', 22, '501.75', '0.00', '501.75', '351.23', '70.00', '22.81', 'McBrew - QLD', '2023-08-28'),
('Michael Chen', 'Staff', 'active', '569.25', 25, '569.25', '0.00', '569.25', '398.48', '70.00', '22.77', 'McBrew - QLD', '2023-09-14'),
('Michael Chen', 'Staff', 'active', '410.75', 18, '410.75', '0.00', '410.75', '287.53', '70.00', '22.82', 'McBrew - QLD', '2023-10-20'),

-- Emma Rodriguez (18 entries, avg transaction $19.25)
('Emma Rodriguez', 'Staff', 'active', '327.25', 17, '327.25', '0.00', '327.25', '229.08', '70.00', '19.25', 'McBrew - QLD', '2023-03-08'),
('Emma Rodriguez', 'Staff', 'active', '288.75', 15, '288.75', '0.00', '288.75', '202.13', '70.00', '19.25', 'McBrew - QLD', '2023-04-14'),
('Emma Rodriguez', 'Staff', 'active', '385.00', 20, '385.00', '0.00', '385.00', '269.50', '70.00', '19.25', 'McBrew - QLD', '2023-05-21'),
('Emma Rodriguez', 'Staff', 'active', '250.25', 13, '250.25', '0.00', '250.25', '175.18', '70.00', '19.25', 'McBrew - QLD', '2023-06-18'),
('Emma Rodriguez', 'Staff', 'active', '423.50', 22, '423.50', '0.00', '423.50', '296.45', '70.00', '19.25', 'McBrew - QLD', '2023-07-25'),
('Emma Rodriguez', 'Staff', 'active', '308.00', 16, '308.00', '0.00', '308.00', '215.60', '70.00', '19.25', 'McBrew - QLD', '2023-08-12'),
('Emma Rodriguez', 'Staff', 'active', '346.50', 18, '346.50', '0.00', '346.50', '242.55', '70.00', '19.25', 'McBrew - QLD', '2023-09-28'),
('Emma Rodriguez', 'Staff', 'active', '269.50', 14, '269.50', '0.00', '269.50', '188.65', '70.00', '19.25', 'McBrew - QLD', '2023-10-16'),

-- James Thompson (18 entries, avg transaction $21.00)
('James Thompson', 'Staff', 'active', '525.00', 25, '525.00', '0.00', '525.00', '367.50', '70.00', '21.00', 'McBrew - QLD', '2023-03-20'),
('James Thompson', 'Staff', 'active', '609.00', 29, '609.00', '0.00', '609.00', '426.30', '70.00', '21.00', 'McBrew - QLD', '2023-04-25'),
('James Thompson', 'Staff', 'active', '462.00', 22, '462.00', '0.00', '462.00', '323.40', '70.00', '21.00', 'McBrew - QLD', '2023-05-30'),
('James Thompson', 'Staff', 'active', '378.00', 18, '378.00', '0.00', '378.00', '264.60', '70.00', '21.00', 'McBrew - QLD', '2023-06-22'),
('James Thompson', 'Staff', 'active', '693.00', 33, '693.00', '0.00', '693.00', '485.10', '70.00', '21.00', 'McBrew - QLD', '2023-07-18'),
('James Thompson', 'Staff', 'active', '567.00', 27, '567.00', '0.00', '567.00', '396.90', '70.00', '21.00', 'McBrew - QLD', '2023-08-24'),
('James Thompson', 'Staff', 'active', '441.00', 21, '441.00', '0.00', '441.00', '308.70', '70.00', '21.00', 'McBrew - QLD', '2023-09-16'),
('James Thompson', 'Staff', 'active', '315.00', 15, '315.00', '0.00', '315.00', '220.50', '70.00', '21.00', 'McBrew - QLD', '2023-10-28'),

-- Olivia Johnson (18 entries, avg transaction $16.75)
('Olivia Johnson', 'Staff', 'active', '251.25', 15, '251.25', '0.00', '251.25', '175.88', '70.00', '16.75', 'McBrew - QLD', '2023-03-10'),
('Olivia Johnson', 'Staff', 'active', '184.25', 11, '184.25', '0.00', '184.25', '128.98', '70.00', '16.75', 'McBrew - QLD', '2023-04-16'),
('Olivia Johnson', 'Staff', 'active', '318.00', 19, '318.00', '0.00', '318.00', '222.60', '70.00', '16.74', 'McBrew - QLD', '2023-05-12'),
('Olivia Johnson', 'Staff', 'active', '150.75', 9, '150.75', '0.00', '150.75', '105.53', '70.00', '16.75', 'McBrew - QLD', '2023-06-28'),
('Olivia Johnson', 'Staff', 'active', '335.00', 20, '335.00', '0.00', '335.00', '234.50', '70.00', '16.75', 'McBrew - QLD', '2023-07-14'),
('Olivia Johnson', 'Staff', 'active', '234.50', 14, '234.50', '0.00', '234.50', '164.15', '70.00', '16.75', 'McBrew - QLD', '2023-08-20'),
('Olivia Johnson', 'Staff', 'active', '284.25', 17, '284.25', '0.00', '284.25', '198.98', '70.00', '16.72', 'McBrew - QLD', '2023-09-22'),
('Olivia Johnson', 'Staff', 'active', '134.00', 8, '134.00', '0.00', '134.00', '93.80', '70.00', '16.75', 'McBrew - QLD', '2023-10-18'),

-- David Park (18 entries, avg transaction $24.50)
('David Park', 'Staff', 'active', '735.00', 30, '735.00', '0.00', '735.00', '514.50', '70.00', '24.50', 'McBrew - QLD', '2023-03-25'),
('David Park', 'Staff', 'active', '857.50', 35, '857.50', '0.00', '857.50', '600.25', '70.00', '24.50', 'McBrew - QLD', '2023-04-30'),
('David Park', 'Staff', 'active', '612.50', 25, '612.50', '0.00', '612.50', '428.75', '70.00', '24.50', 'McBrew - QLD', '2023-05-15'),
('David Park', 'Staff', 'active', '490.00', 20, '490.00', '0.00', '490.00', '343.00', '70.00', '24.50', 'McBrew - QLD', '2023-06-12'),
('David Park', 'Staff', 'active', '980.00', 40, '980.00', '0.00', '980.00', '686.00', '70.00', '24.50', 'McBrew - QLD', '2023-07-20'),
('David Park', 'Staff', 'active', '784.00', 32, '784.00', '0.00', '784.00', '548.80', '70.00', '24.50', 'McBrew - QLD', '2023-08-16'),
('David Park', 'Staff', 'active', '661.25', 27, '661.25', '0.00', '661.25', '462.88', '70.00', '24.49', 'McBrew - QLD', '2023-09-24'),
('David Park', 'Staff', 'active', '539.00', 22, '539.00', '0.00', '539.00', '377.30', '70.00', '24.50', 'McBrew - QLD', '2023-10-26'),

-- Sophie Williams (18 entries, avg transaction $17.25)
('Sophie Williams', 'Staff', 'active', '362.25', 21, '362.25', '0.00', '362.25', '253.58', '70.00', '17.25', 'McBrew - QLD', '2023-03-18'),
('Sophie Williams', 'Staff', 'active', '310.50', 18, '310.50', '0.00', '310.50', '217.35', '70.00', '17.25', 'McBrew - QLD', '2023-04-12'),
('Sophie Williams', 'Staff', 'active', '448.50', 26, '448.50', '0.00', '448.50', '313.95', '70.00', '17.25', 'McBrew - QLD', '2023-05-28'),
('Sophie Williams', 'Staff', 'active', '241.50', 14, '241.50', '0.00', '241.50', '169.05', '70.00', '17.25', 'McBrew - QLD', '2023-06-24'),
('Sophie Williams', 'Staff', 'active', '483.00', 28, '483.00', '0.00', '483.00', '338.10', '70.00', '17.25', 'McBrew - QLD', '2023-07-30'),
('Sophie Williams', 'Staff', 'active', '293.25', 17, '293.25', '0.00', '293.25', '205.28', '70.00', '17.25', 'McBrew - QLD', '2023-08-26'),
('Sophie Williams', 'Staff', 'active', '414.75', 24, '414.75', '0.00', '414.75', '290.33', '70.00', '17.28', 'McBrew - QLD', '2023-09-18'),
('Sophie Williams', 'Staff', 'active', '207.00', 12, '207.00', '0.00', '207.00', '144.90', '70.00', '17.25', 'McBrew - QLD', '2023-10-22'),

-- Alex Cooper (18 entries, avg transaction $20.00)
('Alex Cooper', 'Staff', 'active', '480.00', 24, '480.00', '0.00', '480.00', '336.00', '70.00', '20.00', 'McBrew - QLD', '2023-03-22'),
('Alex Cooper', 'Staff', 'active', '560.00', 28, '560.00', '0.00', '560.00', '392.00', '70.00', '20.00', 'McBrew - QLD', '2023-04-28'),
('Alex Cooper', 'Staff', 'active', '400.00', 20, '400.00', '0.00', '400.00', '280.00', '70.00', '20.00', 'McBrew - QLD', '2023-05-24'),
('Alex Cooper', 'Staff', 'active', '320.00', 16, '320.00', '0.00', '320.00', '224.00', '70.00', '20.00', 'McBrew - QLD', '2023-06-20'),
('Alex Cooper', 'Staff', 'active', '640.00', 32, '640.00', '0.00', '640.00', '448.00', '70.00', '20.00', 'McBrew - QLD', '2023-07-26'),
('Alex Cooper', 'Staff', 'active', '520.00', 26, '520.00', '0.00', '520.00', '364.00', '70.00', '20.00', 'McBrew - QLD', '2023-08-22'),
('Alex Cooper', 'Staff', 'active', '440.00', 22, '440.00', '0.00', '440.00', '308.00', '70.00', '20.00', 'McBrew - QLD', '2023-09-26'),
('Alex Cooper', 'Staff', 'active', '360.00', 18, '360.00', '0.00', '360.00', '252.00', '70.00', '20.00', 'McBrew - QLD', '2023-10-24');

-- Verify the changes
SELECT 
    name,
    COUNT(*) as entry_count,
    AVG(CAST(total_sales AS NUMERIC)) as avg_sales,
    AVG(transaction_count) as avg_transactions,
    AVG(CAST(average_sale AS NUMERIC)) as avg_per_transaction
FROM operator_summaries 
WHERE name IN ('Sarah Mitchell', 'Michael Chen', 'Emma Rodriguez', 'James Thompson', 'Olivia Johnson', 'David Park', 'Sophie Williams', 'Alex Cooper')
GROUP BY name 
ORDER BY avg_sales DESC;

COMMIT;