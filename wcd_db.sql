CREATE SEQUENCE event_id_seq;

CREATE TABLE IF NOT EXISTS event (
id INTEGER PRIMARY KEY NOT NULL DEFAULT nextval('event_id_seq'),
zone_id INTEGER NOT NULL, -- [FK references: zone.id]
start_time TIMESTAMP NOT NULL UNIQUE, -- unique so usage data doesn't keep getting added to the database
stop_time TIMESTAMP NOT NULL CHECK (stop_time > start_time),
total_usage NUMERIC(6,2) CHECK (total_usage > 0) -- this may be a virtual field in a view
);

CREATE TABLE IF NOT EXISTS zone (
id INTEGER PRIMARY KEY NOT NULL,
label VARCHAR(255) NOT NULL,
description VARCHAR(1023),
image_path VARCHAR(255),
sprinkler_id INTEGER, -- [FK references sprinkler.id]
area  INTEGER
);

CREATE SEQUENCE usage_id_seq;
CREATE TABLE IF NOT EXISTS usage (
id INTEGER PRIMARY KEY NOT NULL DEFAULT nextval('usage_id_seq'),
usage_time TIMESTAMP NOT NULL,
usage_amount NUMERIC(12,10) CHECK (usage_amount >= 0),
unit_id INTEGER  DEFAULT -- [FK to units.id]
);

CREATE UNIQUE INDEX idx_usage_time
ON usage (usage_time);

CREATE SEQUENCE sprinkler_id_seq;
CREATE TABLE IF NOT EXISTS sprinkler (
id INTEGER PRIMARY KEY NOT NULL DEFAULT nextval('sprinkler_id_seq'),
name VARCHAR(255) NOT NULL,
description VARCHAR(1023),
image_path VARCHAR(255)
);

CREATE SEQUENCE unit_id_seq;
CREATE TABLE IF NOT EXISTS unit (
id INTEGER PRIMARY KEY NOT NULL DEFAULT nextval('unit_id_seq'),
name VARCHAR(255) NOT NULL,
description VARCHAR(1023)
);

CREATE SEQUENCE user_id_seq;
CREATE TABLE IF NOT EXISTS users (
   id INTEGER PRIMARY KEY NOT NULL DEFAULT nextval('user_id_seq'),
   first_name VARCHAR(255) NOT NULL,
   last_name VARCHAR(255) NOT NULL,
   email VARCHAR(255),
   pw TEXT NOT NULL, --this is meant to be salted, hashed when inserted
   is_admin BOOLEAN
);

-- Tie up loose ends, add the missing FKs
ALTER TABLE event
   ADD CONSTRAINT fk_event_zone_id
   FOREIGN KEY (zone_id) REFERENCES zone(id);

ALTER TABLE zone
   ADD CONSTRAINT fk_zone_sprinkler_id
   FOREIGN KEY (sprinkler_id) REFERENCES sprinkler(id);

ALTER TABLE usage
   ADD CONSTRAINT fk_usage_unit_id
   FOREIGN KEY (unit_id) REFERENCES unit(id);

ALTER TABLE usage ALTER COLUMN unit_id SET DEFAULT 1;

COMMIT;

-- DROP CONSTRAINTS and TABLES
/**
ALTER TABLE event DROP CONSTRAINT fk_event_zone_id;
ALTER TABLE zone DROP CONSTRAINT fk_zone_sprinkler_id;
ALTER TABLE usage DROP CONSTRAINT fk_usage_unit_id;
DROP TABLE IF EXISTS event;
DROP TABLE IF EXISTS zone;
DROP TABLE IF EXISTS usage;
DROP TABLE IF EXISTS sprinkler;
DROP TABLE IF EXISTS unit;
DROP TABLE IF EXISTS users;

DROP SEQUENCE IF EXISTS event_id_seq;
DROP SEQUENCE IF EXISTS usage_id_seq;
DROP SEQUENCE IF EXISTS sprinkler_id_seq;
DROP SEQUENCE IF EXISTS unit_id_seq;
DROP SEQUENCE IF EXISTS user_id_seq;
**/

------ DATA -----------
INSERT INTO unit (name, description) VALUES ('gallons', 'an imperial unit of liquid capacity equal to 3.79 liters');

INSERT INTO ZONE (id, label) VALUES (1, 'Back Planter');
INSERT INTO ZONE (id, label) VALUES (2, 'Back Grass');
INSERT INTO ZONE (id, label) VALUES (3, 'Privets and Hopseeds');
INSERT INTO ZONE (id, label) VALUES (4, 'Carport Asparagus Ferns');
INSERT INTO ZONE (id, label) VALUES (5, 'Crepe Myrtles');
INSERT INTO ZONE (id, label) VALUES (6, 'Back East Wall, Shrubs, Mesquite Trees');
INSERT INTO ZONE (id, label) VALUES (7, 'Front East Desert');
INSERT INTO ZONE (id, label) VALUES (8, 'Front East Planter');
INSERT INTO ZONE (id, label) VALUES (9, 'Front Grass');
INSERT INTO ZONE (id, label) VALUES (10, 'Front Trees and Grass');
INSERT INTO ZONE (id, label) VALUES (11, 'Front West Grass');
INSERT INTO ZONE (id, label) VALUES (12, 'Front Planter');
INSERT INTO ZONE (id, label) VALUES (13, 'Front West Desert');
INSERT INTO ZONE (id, label) VALUES (14, 'Front Desert');
INSERT INTO ZONE (id, label) VALUES (15, 'Front West Planter');
INSERT INTO ZONE (id, label) VALUES (16, 'Pomegranates');
