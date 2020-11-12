SELECT template.*, plan_type.name AS plan_name
FROM template 
LEFT JOIN plan_type
ON template.plan_id = plan_type.id

WHERE plan_type.id =1
