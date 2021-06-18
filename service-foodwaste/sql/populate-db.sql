-- Write INSERT queries for data that is required to be in the DB (not user-generated)
INSERT INTO _migrations (name) VALUES
('20170620080298-AddFieldsRegistrations.js'),
('20170620080299-updateManualField.js'),
('20170620080300-create-project-status-enum-type.js'),
('20170620080445-create-project-table.js'),
('20170620111709-create-project-registration-link-table.js'),
('20170620113348-add-foreign-keys-project-registration.js'),
('20170620120335-create-action-table.js'),
('20170620121859-create-area-table.js'),
('20170620124635-create-product-category-table.js'),
('20170620124836-create-product-table.js'),
('20170620130045-create-ingredient-table.js'),
('20170620130417-create-product-ingredient-link-table.js'),
('20170620130807-add-foreign-keys-product-ingredient.js'),
('20170620144912-grant-crud-to-app-user.js'),
('20170621092556-grant-read-permissions-to-readonly-user.js'),
('20170621093800-add-fk-columns-to-registration.js'),
('20170621093828-create-views-to-migrate-from.js'),
('20170621093829-migrate-area-data.js'),
('20170703124746-migrate-product-data.js'),
('20170703143933-match-product-and-area-with-registration-records.js'),
('20170704090400-add-fk-relations-to-area-and-product.js'),
('20170704091509-add-not-null-to-area-and-product-columns.js'),
('20170704092015-remove-temp-views-for-product-and-area.js'),
('20170704102015-modify-registration-table-unit-and-time-columns.js'),
('20170704143546-remove-old-product-and-area-columns.js'),
('20170704144910-create-sale-entity-table.js'),
('20170706132609-index-jsonb-columns-in-settings-table.js'),
('20170706132616-upgrade-settings-data-structure.js'),
('20170720104659-add-active-field.js'),
('20170725185336-create-tip-of-the-week-entity.js'),
('20170726123837-create-bootstrap-table.js'),
('20170726123902-add-bootstrap-columns.js'),
('20170809141800-add-unique-indexes.js'),
('20170817130028-add-new-fields-ingredient.js'),
('20170822204612-grant-user-permissions.js'),
('20170824150608-add-deletedAt-registrations.js'),
('20170830085957-change-type-amount-column.js'),
('20170830125350-change-type-image-area.js'),
('20170830125401-change-type-image-product.js'),
('20170830125414-change-type-image-category.js'),
('20170927104458-change-weight-into-integer.js'),
('20170927121918-recreate-unique-indexes.js'),
('20170927130423-change-registration-cost-to-bigint.js'),
('20171017132037-rename-table-categories.js'),
('20171017134641-rename-category-bootstraps.js'),
('20171027081134-add-amount-to-product.js'),
('20171027081153-add-amount-to-ingredient.js'),
('20171027081205-add-amount-to-product-ingredient.js'),
('20171030124323-rename-categories-in-product-bootstraps.js'),
('20171031123643-change-bootstrap-costs-into-objects.js'),
('20171101130819-add-unit-to-ingredient-unique-index.js'),
('20171103140035-drop-not-null-for-pecentage-product-ingredient.js'),
('20171117102920-remove-active-column-category.js'),
('20171122124620-remove-nut-null-categoryId-in-products.js'),
('20171130115905-add-active-column-back.js'),
('20171207115905-fix-unique-index-categories.js'),
('201801121120000-add-icelandic-currency-to-bootstraps.js'),
('20180115112100-change-type-date-in-sales.js'),
('20180219154222-create-new-migrations-table.js'),
('20180221092352-drop-old-migrations-table.js'),
('20180221092429-give-read-permissions-for-new-migrations-table.js'),
('20180222132738-grant-read-permissions-migrations-table-to-postgres.js'),
('20180224110955-drop-raw-sql-column-from-migrations.js'),
('20180316094430-redefine-project-status-type.js'),
('20180416154039-remove-on-delete-cascade-constraints.js'),
('20180601105449-fix-bootstrap-category-translation-key.js'),
('20180611122947-add-period-to-project.js'),
('20180704073239-set-flag-bootstrap-data-in-settings.js'),
('20180831082827-create-median-function.js'),
('20181119120924-add-job-metadata-log-column.js'),
('20180112112000-add-icelandic-currency-to-bootstraps.js'),
('20190111104540-add-new-name-of-old-migration.js')
ON CONFLICT DO NOTHING;

INSERT INTO bootstrap (translation_key, value) VALUES
('_foodwaste.category.dairy','{"type": "category", "properties": {"name": "Dairy"}}'),
('_foodwaste.category.animal','{"type": "category", "properties": {"name": "Animal"}}'),
('_foodwaste.category.starch','{"type": "category", "properties": {"name": "Starch"}}'),
('_foodwaste.category.fruit/greens','{"type": "category", "properties": {"name": "Fruit/Greens"}}'),
('_foodwaste.category.mixed','{"type": "category", "properties": {"name": "Mixed"}}'),
('_foodwaste.area.buffet','{"type": "area", "properties": {"name": "Buffet"}}'),
('_foodwaste.area.kitchen','{"type": "area", "properties": {"name": "Kitchen"}}'),
('_foodwaste.area.storage','{"type": "area", "properties": {"name": "Storage"}}'),
('_foodwaste.area.meetings','{"type": "area", "properties": {"name": "Meetings"}}'),
('_foodwaste.product.milk','{"type": "product", "properties": {"cost": { "DKK": 700, "NOK": 880 }, "name": "Milk", "categoryId": "_foodwaste.category.dairy"}}'),
('_foodwaste.product.butter','{"type": "product", "properties": {"cost": { "DKK": 8000, "NOK": 10100 }, "name": "Butter", "categoryId": "_foodwaste.category.dairy"}}'),
('_foodwaste.product.yoghurt','{"type": "product", "properties": {"cost": { "DKK": 1500, "NOK": 1900 }, "name": "Yoghurt", "categoryId": "_foodwaste.category.dairy"}}'),
('_foodwaste.product.cheese','{"type": "product", "properties": {"cost": { "DKK": 8000, "NOK": 10100 }, "name": "Cheese", "categoryId": "_foodwaste.category.dairy"}}'),
('_foodwaste.product.egg','{"type": "product", "properties": {"cost": { "DKK": 3000, "NOK": 3800 }, "name": "Egg", "categoryId": "_foodwaste.category.animal"}}'),
('_foodwaste.product.fish','{"type": "product", "properties": {"cost": { "DKK": 10000, "NOK": 12650 }, "name": "Fish", "categoryId": "_foodwaste.category.animal"}}'),
('_foodwaste.product.poultry','{"type": "product", "properties": {"cost": { "DKK": 7000, "NOK": 8900 }, "name": "Poultry", "categoryId": "_foodwaste.category.animal"}}'),
('_foodwaste.product.pork','{"type": "product", "properties": {"cost":  { "DKK": 5000, "NOK": 6300 }, "name": "Pork", "categoryId": "_foodwaste.category.animal"}}'),
('_foodwaste.product.beef','{"type": "product", "properties": {"cost": { "DKK": 9500, "NOK": 12000 }, "name": "Beef", "categoryId": "_foodwaste.category.animal"}}'),
('_foodwaste.product.cold_cuts','{"type": "product", "properties": {"cost": { "DKK": 10000, "NOK": 12650 }, "name": "Cold cuts", "categoryId": "_foodwaste.category.animal"}}'),
('_foodwaste.product.rice','{"type": "product", "properties": {"cost": { "DKK": 1500, "NOK": 1900 }, "name": "Rice", "categoryId": "_foodwaste.category.starch"}}'),
('_foodwaste.product.pasta','{"type": "product", "properties": {"cost": { "DKK": 2300, "NOK": 2900 }, "name": "Pasta", "categoryId": "_foodwaste.category.starch"}}'),
('_foodwaste.product.bread','{"type": "product", "properties": {"cost": { "DKK": 2000, "NOK": 2500 }, "name": "Bread", "categoryId": "_foodwaste.category.starch"}}'),
('_foodwaste.product.potatoes','{"type": "product", "properties": {"cost": { "DKK": 1500, "NOK": 1900 }, "name": "Potatoes", "categoryId": "_foodwaste.category.fruit/greens"}}'),
('_foodwaste.product.broccoli','{"type": "product", "properties": {"cost": { "DKK": 2000, "NOK": 2500 }, "name": "Broccoli", "categoryId": "_foodwaste.category.fruit/greens"}}'),
('_foodwaste.product.cabbage','{"type": "product", "properties": {"cost": { "DKK": 1800, "NOK": 2300 }, "name": "Cabbage", "categoryId": "_foodwaste.category.fruit/greens"}}'),
('_foodwaste.product.mixed','{"type": "product", "properties": {"cost": { "DKK": 5000, "NOK": 6300 }, "name": "Mixed", "categoryId": "_foodwaste.category.mixed"}}'),
('_foodwaste.product.meet_dishes','{"type": "product", "properties": {"cost": { "DKK": 10000, "NOK": 12650 }, "name": "Meet dishes", "categoryId": "_foodwaste.category.mixed"}}'),
('_foodwaste.product.mixed_salads','{"type": "product", "properties": {"cost": { "DKK": 7500, "NOK": 9500 }, "name": "Mixed salads", "categoryId": "_foodwaste.category.mixed"}}'),
('_foodwaste.product.root_vegetables','{"type": "product", "properties": {"cost": { "DKK": 2000, "NOK": 2500 }, "name": "Roots", "categoryId": "_foodwaste.category.fruit/greens"}}'),
('_foodwaste.product.bananas','{"type": "product", "properties": {"cost": { "DKK": 1500, "NOK": 1900 }, "name": "Bananas", "categoryId": "_foodwaste.category.fruit/greens"}}');


-- Sequences are updated into the latest id on corresponding tables, to avoid errors for duplicated id when inserting
-- Sources: http://wiki.postgresql.org/wiki/Fixing_Sequences, http://dbadailystuff.com/2013/12/03/setval-for-all-sequences-in-a-schema

-- ACTION
INSERT INTO action(id,user_id,customer_id,name,description,updated_at,created_at,deleted_at)
VALUES
(1,1,1,'Taking out the trash','Taking the trash and put it in the trashcan','2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',NULL),
(2,1,1,'Test','Taking the trash and put it in the trashcan','2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',NULL),
(3,2,1,'Test','Taking the trash and put it in the trashcan','2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',NULL),
(4,1,2,'Taking out the trash','Taking the trash and put it in the trashcan','2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',NULL),
(5,1,2,'Taking out the trash','Taking the trash and put it in the trashcan','2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',NULL);

-- AREA
INSERT INTO area(id,user_id,customer_id,name,description,image,active,bootstrap_key,updated_at,created_at,deleted_at)
VALUES
(1,1,1,'Kitchen','The kitchen in the restaurant',NULL,TRUE,NULL,'2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',NULL),
(2,1,1,'TestArea','The bathroom in the restaurant',NULL,TRUE,NULL,'2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',NULL),
(3,2,1,'Office','The office room in the restaurant',NULL,TRUE,NULL,'2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',NULL),
(4,1,2,'Kitchen','The kitchen in the restaurant',NULL,TRUE,NULL,'2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',NULL),
(5,3,2,'Muchachas','The kitchen in the restaurant',NULL,TRUE,NULL,'2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',NULL);

-- CATEGORY
INSERT INTO category(id,user_id,customer_id,name,image,active,bootstrap_key,updated_at,created_at,deleted_at)
VALUES
(1,1,1,'Cake',NULL,TRUE,NULL,'2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',NULL),
(2,1,2,'Fish',NULL,TRUE,NULL,'2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',NULL),
(3,1,1,'TestCategory',NULL,TRUE,NULL,'2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',NULL),
(4,1,2,'Meat',NULL,TRUE,NULL,'2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',NULL),
(5,1,1,'Vegetables',NULL,TRUE,NULL,'2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',NULL);

-- INGREDIENT
INSERT INTO ingredient(id,customer_id,name,cost,updated_at,created_at,unit,currency,amount)
VALUES
(1, 1, 'Brød', 10000, '2019-01-14 08:54:49.914+00', '2019-01-14 08:54:49.914+00', 'kg', 'DKK', 1),
(2, 1, 'test 4', 10000, '2019-01-04 10:21:02.017+00', '2019-01-04 10:21:02.017+00', 'kg', 'DKK', 1),
(3, 1, 'Test 4', 10000, '2019-01-04 10:05:34.575+00', '2019-01-04 10:05:34.575+00', 'kg', 'DKK', 1),
(4, 1, 'Vildt', 20500, '2019-01-04 09:52:16.992+00', '2019-01-04 09:52:16.992+00', 'kg', 'DKK', 1);

-- PRODUCT
INSERT INTO product(id,user_id,customer_id,category_id,name,cost,image,active,bootstrap_key,updated_at,created_at,deleted_at)
VALUES
(1,1,2,4,'Salmon',5000,NULL,TRUE,NULL,'2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',NULL),
(2,1,1,5,'Chicken',1000,NULL,TRUE,NULL,'2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',NULL),
(3,1,1,NULL,'TestProduct',1000,NULL,TRUE,NULL,'2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',NULL),
(4,1,2,NULL,'Beef',1000,NULL,TRUE,NULL,'2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',NULL),
(5,1,1,3,'Pineapple',1000,NULL,TRUE,NULL,'2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',NULL);

-- PRODUCT_INGREDIENT
INSERT INTO product_ingredient(product_id, ingredient_id, percentage, amount)
VALUES
(1,1,10,0.1),
(2,1,30,0.3),
(3,2,15,0.15),
(4,3,80,0.8),
(5,4,65,0.65);

-- PROJECT
INSERT INTO project(id,parent_project_id,user_id,customer_id,name,duration,status,area,product,action,active,updated_at,created_at,deleted_at)
VALUES
(1,NULL,1,1,'Parent project','{"days": 10, "type": "REGISTRATIONS"}','PENDING_START','[{"id": 1, "name": "Kitchen"}, {"id": 3, "name": "Coffee room"}]','[{"id": 5, "goal": 20, "name": "Pineapple"}, {"id": 2, "goal": 30, "name": "Chicken wings"}]','[{"id": 1, "name": "Use smaller plates"}, {"id": 2, "name": "Use napkins with drawings"}]',TRUE,'2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',NULL),
(2,1,1,1,'Project 2','{"days": 6, "type": "REGISTRATIONS"}','PENDING_START','[{"id": 1, "name": "Kitchen"}, {"id": 3, "name": "Coffee room"}]','[{"id": 5, "goal": 20, "name": "Pineapple"}, {"id": 2, "goal": 30, "name": "Chicken wings"}]','[{"id": 1, "name": "Use smaller plates"}, {"id": 2, "name": "Use napkins with drawings"}]',TRUE,'2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',NULL),
(3,2,1,1,'Project 3','{"days": 6, "type": "REGISTRATIONS"}','PENDING_START','[{"id": 1, "name": "Kitchen"}, {"id": 3, "name": "Coffee room"}]','[{"id": 5, "goal": 20, "name": "Pineapple"}, {"id": 2, "goal": 30, "name": "Chicken wings"}]','[{"id": 1, "name": "Use smaller plates"}, {"id": 2, "name": "Use napkins with drawings"}]',TRUE,'2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',NULL),
(4,3,1,1,'Project 4','{"days": 6, "type": "REGISTRATIONS"}','PENDING_START','[{"id": 1, "name": "Kitchen"}, {"id": 3, "name": "Coffee room"}]','[{"id": 5, "goal": 20, "name": "Pineapple"}, {"id": 2, "goal": 30, "name": "Chicken wings"}]','[{"id": 1, "name": "Use smaller plates"}, {"id": 2, "name": "Use napkins with drawings"}]',TRUE,'2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',NULL);

-- REGISTRATION
INSERT INTO registration(id,customer_id,date,user_id,amount,unit,currency,kg_per_liter,cost,comment,manual,scale,updated_at,created_at,area_id,product_id,deleted_at)
VALUES
(1,1,'2017-06-01',1,1800,'kg','DKK',15,5000,'Hello test',TRUE,'true','2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',2,2,NULL),
(2,1,'2017-06-02',1,1800,'kg','DKK',15,5000,'Hello test',TRUE,'true','2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',2,2,NULL),
(3,1,'2017-06-03',1,1800,'kg','DKK',15,510,'Hello test',TRUE,'true','2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',2,2,NULL),
(4,1,'2017-06-02',1,1800,'kg','DKK',15,5283,'Hello test',TRUE,'true','2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',2,2,NULL),
(5,2,'2017-06-02',1,1800,'kg','DKK',15,5283,'Hello test',TRUE,'true','2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',2,2,NULL),
(6,1,'2016-06-04',1,1800,'kg','DKK',15,5000,'Hello test',TRUE,'true','2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',2,5,NULL),
(7,1,'2017-10-02',1,1800,'kg','DKK',15,2240,'Hello test',TRUE,'true','2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',3,3,NULL),
(8,1,'2017-10-02',1,1800,'kg','DKK',15,9378,'Hello test',TRUE,'true','2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',3,3,NULL),
(9,1,'2017-06-10',1,1800,'kg','DKK',15,5000,'Hello test',TRUE,'true','2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',2,3,NULL);

-- PROJECT_REGISTRATION
INSERT INTO project_registration(project_id,registration_id)
VALUES
(2,2),
(2,3),
(2,4),
(2,5),
(3,6),
(1,7);

-- SALE
INSERT INTO sale(id,user_id,customer_id,date,income,portions,portion_price,guests,production_cost,production_weight,updated_at,created_at,deleted_at)
VALUES
(1,1,1,'2017-05-05 00:00:00+00',8200,431,21222,315,12633,54,'2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',NULL),
(2,1,1,'2017-06-01 00:00:00+00',19090,25,22010,15,200,74,'2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',NULL),
(3,1,1,'2017-06-02 00:00:00+00',3920,13,29212,27,10523,14,'2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',NULL),
(4,1,1,'2017-05-12 00:00:00+00',10000,45,52212,45,15023,14,'2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',NULL),
(5,1,1,'2017-06-10 00:00:00+00',19420,45,72221,45,15023,14,'2017-10-09 10:30:42+00','2017-10-09 10:30:42+00',NULL);

-- SETTINGS
INSERT INTO settings(id,customer_id,user_id,current,update_time,create_time,history)
VALUES
(1,1,1,'{"areas": ["Køkken"], "currency": "DKK", "categories": [{"name": "Kød", "products": [{"cost": 7500, "name": "Svin"}]}]}','2017-10-09 10:30:42+00','2017-10-09 10:30:42+00','{}'),
(2,2,232,'{}','2017-10-09 10:30:42+00','2017-10-09 10:30:42+00','{}'),
(3,3,113,'{}','2017-10-09 10:30:42+00','2017-10-09 10:30:42+00','{}');

-- TIP
INSERT INTO tip(id,title,content,image_url,is_active,updated_at,created_at,deleted_at)
VALUES
(1,'{"DK": "Det er en DK title", "EN": "Hello", "NO": "Blah blah in Norwegian"}','{"DK": "Det er contenten i Dansk", "EN": "This is the content in EN", "NO": "Blah blah in Norwegian"}','www.sdihfsudhfiusdhiufhsdui.com',FALSE,'2017-10-09 10:30:42+00','2016-04-12 10:12:34+00',NULL),
(2,'{"DK": "Lorem ipsum dolor sit amet", "EN": "Consectetur adipiscing elit 123", "NO": "Duis tempor eu est ut finibus"}','{"DK": "DK - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sed molestie ante, vel porta nulla. Ut nec vulputate mauris. Maecenas et tellus in nibh tristique pellentesque. Nulla maximus ultricies nulla, a facilisis nibh eleifend sit amet. Maecenas nec purus augue. Proin condimentum, mauris eget vestibulum malesuada, ligula neque pellentesque nunc, eu fermentum lorem sem in velit. Nam a nunc ac diam pulvinar tincidunt. Duis tempor eu est ut finibus. Donec luctus ipsum luctus, mollis magna eget, elementum ipsum. Donec erat dolor, semper sed posuere at, pulvinar nec ex.", "EN": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sed molestie ante, vel porta nulla. Ut nec vulputate mauris. Maecenas et tellus in nibh tristique pellentesque. Nulla maximus ultricies nulla, a facilisis nibh eleifend sit amet. Maecenas nec purus augue. Proin condimentum, mauris eget vestibulum malesuada, ligula neque pellentesque nunc, eu fermentum lorem sem in velit. Nam a nunc ac diam pulvinar tincidunt. Duis tempor eu est ut finibus. Donec luctus ipsum luctus, mollis magna eget, elementum ipsum. Donec erat dolor, semper sed posuere at, pulvinar nec ex.", "NO": "NO - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sed molestie ante, vel porta nulla. Ut nec vulputate mauris. Maecenas et tellus in nibh tristique pellentesque. Nulla maximus ultricies nulla, a facilisis nibh eleifend sit amet. Maecenas nec purus augue. Proin condimentum, mauris eget vestibulum malesuada, ligula neque pellentesque nunc, eu fermentum lorem sem in velit. Nam a nunc ac diam pulvinar tincidunt. Duis tempor eu est ut finibus. Donec luctus ipsum luctus, mollis magna eget, elementum ipsum. Donec erat dolor, semper sed posuere at, pulvinar nec ex."}','www.sdihfsudhfiusdhiufhsdui.com',TRUE,'2017-10-09 10:30:42+00','2016-04-12 10:12:34+00',NULL),
(3,'{"DK": "Lorem ipsum dolor sit amet", "EN": "Consectetur adipiscing elit", "NO": "Duis tempor eu est ut finibus"}','{"DK": "DK - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sed molestie ante, vel porta nulla. Ut nec vulputate mauris. Maecenas et tellus in nibh tristique pellentesque. Nulla maximus ultricies nulla, a facilisis nibh eleifend sit amet. Maecenas nec purus augue. Proin condimentum, mauris eget vestibulum malesuada, ligula neque pellentesque nunc, eu fermentum lorem sem in velit. Nam a nunc ac diam pulvinar tincidunt. Duis tempor eu est ut finibus. Donec luctus ipsum luctus, mollis magna eget, elementum ipsum. Donec erat dolor, semper sed posuere at, pulvinar nec ex.", "EN": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sed molestie ante, vel porta nulla. Ut nec vulputate mauris. Maecenas et tellus in nibh tristique pellentesque. Nulla maximus ultricies nulla, a facilisis nibh eleifend sit amet. Maecenas nec purus augue. Proin condimentum, mauris eget vestibulum malesuada, ligula neque pellentesque nunc, eu fermentum lorem sem in velit. Nam a nunc ac diam pulvinar tincidunt. Duis tempor eu est ut finibus. Donec luctus ipsum luctus, mollis magna eget, elementum ipsum. Donec erat dolor, semper sed posuere at, pulvinar nec ex.", "NO": "NO - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sed molestie ante, vel porta nulla. Ut nec vulputate mauris. Maecenas et tellus in nibh tristique pellentesque. Nulla maximus ultricies nulla, a facilisis nibh eleifend sit amet. Maecenas nec purus augue. Proin condimentum, mauris eget vestibulum malesuada, ligula neque pellentesque nunc, eu fermentum lorem sem in velit. Nam a nunc ac diam pulvinar tincidunt. Duis tempor eu est ut finibus. Donec luctus ipsum luctus, mollis magna eget, elementum ipsum. Donec erat dolor, semper sed posuere at, pulvinar nec ex."}','www.sdihfsudhfiusdhiufhsdui.com',TRUE,'2017-10-09 10:30:42+00','2016-04-12 10:12:34+00',NULL);

-- begin updating sequences
CREATE OR REPLACE FUNCTION setval_max
(
    schema_name name,
    table_name name DEFAULT NULL::name,
    raise_notice boolean DEFAULT false
)
RETURNS void AS
$BODY$

DECLARE
    row_data RECORD;
    sql_code TEXT;

BEGIN
    IF ((SELECT COUNT(*) FROM pg_namespace WHERE nspname = schema_name) = 0) THEN
        RAISE EXCEPTION 'The schema "%" does not exist', schema_name;
    END IF;

    FOR sql_code IN
        SELECT 'SELECT SETVAL(' ||quote_literal(N.nspname || '.' || S.relname)|| ', MAX(' ||quote_ident(C.attname)|| ') ) FROM ' || quote_ident(N.nspname) || '.' || quote_ident(T.relname)|| ';' AS sql_code
            FROM pg_class AS S
            INNER JOIN pg_depend AS D ON S.oid = D.objid
            INNER JOIN pg_class AS T ON D.refobjid = T.oid
            INNER JOIN pg_attribute AS C ON D.refobjid = C.attrelid AND D.refobjsubid = C.attnum
            INNER JOIN pg_namespace N ON N.oid = S.relnamespace
            WHERE S.relkind = 'S' AND N.nspname = schema_name AND (table_name IS NULL OR T.relname = table_name)
            ORDER BY S.relname
    LOOP
        IF (raise_notice) THEN
            RAISE NOTICE 'sql_code: %', sql_code;
        END IF;
        EXECUTE sql_code;
    END LOOP;
END;
$BODY$
LANGUAGE plpgsql VOLATILE;

SELECT setval_max('public');
--end updating sequences
