--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE messages (
  day_timestamp    INTEGER NOT NULL PRIMARY KEY,
  messages_count   INTEGER NOT NULL DEFAULT 0,
  characters_count INTEGER NOT NULL DEFAULT 0
);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE messages;
