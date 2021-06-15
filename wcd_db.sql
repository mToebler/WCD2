CREATE SEQUENCE event_id_seq;

CREATE TABLE IF NOT EXISTS event (
id INTEGER PRIMARY KEY NOT NULL DEFAULT nextval('event_id_seq'),
zone_id INTEGER NOT NULL, -- [FK references: zone.id]
start_time TIMESTAMP NOT NULL,
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
time TIMESTAMP NOT NULL,
usage NUMERIC(12,10) CHECK (usage > 0),
unit_id INTEGER  -- [FK to units.id]
);

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