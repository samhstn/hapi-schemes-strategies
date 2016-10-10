BEGIN;

DROP TABLE IF EXISTS user_table CASCADE;

DROP SEQUENCE IF EXISTS user_seq;

/****** 1. USER TABLE ******/
CREATE SEQUENCE user_seq start 100 increment 1 cache 1;
CREATE TABLE user_table (
  user_id BIGINT DEFAULT nextval('user_seq'::text),
  username VARCHAR,
  password VARCHAR
)
WITHOUT OIDS;

COMMIT;
