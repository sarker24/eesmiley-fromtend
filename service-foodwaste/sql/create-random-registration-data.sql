/*
SQL script to generate random registration data for each day within the given time range.
-flushes existing registration data (point and guest registrations)
-deletes any existing project
-picks random amounts, registration points
-if guest types enabled, picks random guest type
*/
CREATE OR REPLACE FUNCTION create_random_registration_data(
   customer_ids BIGINT[],
   from_date DATE,
   to_date DATE
)
RETURNS VOID AS $$
DECLARE
    customer_settings RECORD;
    random_date RECORD;
    random_guest_type RECORD;
    random_registration_amount INT;
    number_of_registration_points INT;
    number_of_guest_types INT;
BEGIN
   FOR customer_settings IN
   	SELECT
   		customer_id,
   		COALESCE(current->>'name', 'no name') as name,
   		user_id,
   		COALESCE((current->'guestTypes'->>'enabled')::BOOLEAN, FALSE) AS guest_types_enabled,
   		COALESCE((current->>'currency'), 'DKK') AS currency
   	FROM
   		settings
   	WHERE
   		customer_id = ANY(customer_ids)
   	LOOP

      RAISE NOTICE 'Deleting old projects and registration data from customer % (%)', customer_settings.customer_id, customer_settings.name;
      DELETE FROM project_registration where project_id in (SELECT id FROM project WHERE customer_id = customer_settings.customer_id);
      DELETE FROM project_registration_point where project_id in (SELECT id FROM project WHERE customer_id = customer_settings.customer_id);
      DELETE FROM project where customer_id = customer_settings.customer_id;
      DELETE FROM registration where customer_id = customer_settings.customer_id;
      DELETE FROM guest_registration where customer_id = customer_settings.customer_id;

      PERFORM SETSEED(random());

      number_of_registration_points := (SELECT COUNT(*) FROM registration_point WHERE deleted_at IS NULL AND customer_id = customer_settings.customer_id);
      number_of_guest_types := (SELECT COUNT(*) FROM guest_type WHERE deleted_at IS NULL AND customer_id = customer_settings.customer_id);

      RAISE NOTICE 'Generating registration data for customer %', customer_settings.customer_id;

   		FOR random_date IN
   			SELECT
   				day::DATE AS date
   			FROM
   				generate_series(from_date, to_date, '1 day'::interval) day
   		LOOP

        FOR registration IN 1..floor(4 * random() + 1) LOOP

          random_registration_amount := floor(8000 * random() + 200);

          INSERT INTO registration(customer_id, user_id, currency, date, amount, cost, registration_point_id) VALUES (
            customer_settings.customer_id,
            customer_settings.user_id,
            customer_settings.currency,
            random_date.date,
            random_registration_amount,
            floor(random_registration_amount * (4 * random() + 1)),
            (SELECT id FROM registration_point WHERE deleted_at IS NULL AND customer_id = customer_settings.customer_id OFFSET floor(random() * number_of_registration_points) limit 1)
          );

        END LOOP;

        IF(customer_settings.guest_types_enabled) THEN
          INSERT INTO guest_registration(customer_id, user_id, date, amount, guest_type_id) VALUES (
            customer_settings.customer_id,
            customer_settings.user_id,
            random_date.date,
            floor(200 * random() + 10),
            (SELECT id FROM guest_type WHERE deleted_at IS NULL AND customer_id = customer_settings.customer_id OFFSET floor(random() * number_of_guest_types) limit 1)
          );
        ELSE
            INSERT INTO guest_registration(customer_id, user_id, date, amount) VALUES (
            customer_settings.customer_id,
            customer_settings.user_id,
            random_date.date,
            floor(200 * random() + 10)
          );
        END IF;

   		END LOOP;

   		RAISE NOTICE 'Generated registration data for customer % with currency %, with guest types: %', customer_settings.customer_id, customer_settings.currency, customer_settings.guest_types_enabled;

   	END LOOP;
END;
$$ LANGUAGE plpgsql;
