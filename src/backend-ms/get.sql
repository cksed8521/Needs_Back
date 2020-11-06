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

