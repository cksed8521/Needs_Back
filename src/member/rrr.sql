SELECT order_evaluations.*, merchants.brand_name 
FROM order_evaluations
LEFT JOIN merchants
ON order_evaluations.merchant_id = merchants.id
WHERE customer_id = 1