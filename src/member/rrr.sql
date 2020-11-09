SELECT order_evaluations.*, merchants.brand_name 
FROM order_evaluations
LEFT JOIN merchants
ON order_evaluations.merchant_id = merchants.id
WHERE customer_id = 1

SELECT customer_subscribes.*, merchants.brand_name, brand_info.index_img FROM customer_subscribes LEFT JOIN merchants ON customer_subscribes.merchant_id = merchants.id LEFT JOIN brand_info ON customer_subscribes.merchant_id = brand_info.merchant_id WHERE `customer_id` = 1 AND customer_subscribes.merchant_id NOT IN(100)

DB_HOST=122.116.38.12
DB_USER=elivia
DB_PASS=elivia_sql
DB_NAME=needs
