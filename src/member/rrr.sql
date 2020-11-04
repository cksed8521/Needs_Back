SELECT order_evaluations.*, merchants.brand_name 
FROM order_evaluations
LEFT JOIN merchants
ON order_evaluations.merchant_id = merchants.id
WHERE customer_id = 1

SELECT customer_subscribes.*, merchants.brand_name,information.* FROM customer_subscribes LEFT JOIN merchants ON customer_subscribes.merchant_id = merchants.id LEFT JOIN information ON customer_subscribes.merchant_id = information.merchant_id WHERE customer_id = 1