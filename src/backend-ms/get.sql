A products
B product_skus
C product_categories
D merchants

A.merchant_id = D.id
A.id = B.product_id
A.categories_id = C.id
C.parent_id = C.id

商品類型 A.type

商品名稱 A.title

商品類別 A.categories_id  > C.name & C.parent_id

商品規格 B.specification

商品定價 B.price

商品促銷價 B.sale_price

商品庫存 B.stocks

商品上架日 A.launch_date

商品摘要 A.outline

商品介紹 A.description

商品路徑 A.image_path


SELECT COUNT(1) from products WHERE merchant_id = 12

SELECT A.id, A.title, C.name as categories_name, A.outline, A.description, A.launch_date, A.image_path,
       TEMPTBL.specification , TEMPTBL.price, TEMPTBL.sale_price, TEMPTBL.stocks
FROM products A
LEFT JOIN (SELECT B.product_id, B.price, B.sale_price, B.stocks,
                  GROUP_CONCAT(B.specification) AS specification
                  FROM product_skus B 
                  GROUP BY B.product_id) TEMPTBL 
         ON TEMPTBL.product_id = A.id
LEFT JOIN product_categories AS C ON A.categories_id = C.id 
WHERE A.merchant_id = 12
ORDER BY id DESC


A orders
B order_deliveries
C order_payments
D order_products
E product_skus
F products
G customers
H payment_type

A.customer_id = customers.id
A.delivery_id = B.id
A.payment_id = C.id
D.order_id = A.id
D.product_sku_id = E.id
E.product_id = F.id
C.type = H.name

-- 拿到6筆廠商資料
SELECT A.id, D.order_id, D.id AS order_prodlist_id, F.title, F.image_path,
D.unit_price, D.quantity, E.id AS skud_id, E.specification  
FROM order_products D 
LEFT JOIN orders A ON D.order_id = A.id
LEFT JOIN product_skus E ON D.product_sku_id = E.id
 LEFT JOIN products F ON E.product_id = F.id WHERE F.merchant_id = 12
ORDER BY A.id DESC


--訂單基本資料 45筆
SELECT A.id, A.order_number, G.name AS purchaser, A.created_at, H.name AS payment_type,
A.status, B.type AS delivery_type, B.price AS delivery_fee, 
B.full_name AS reciever, B.address, B.phone_number
FROM orders A 
LEFT JOIN customers G ON A.customer_id = G.id
LEFT JOIN order_payments C ON A.payment_id = C.id
LEFT JOIN payment_type H ON C.type = H.id
LEFT JOIN order_deliveries B ON A.delivery_id = B.id
ORDER BY A.id DESC

