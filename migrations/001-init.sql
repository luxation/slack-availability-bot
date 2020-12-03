-- Up
CREATE TABLE `users` (
    id INTEGER PRIMARY KEY,
    identity TEXT NOT NULL,
    username TEXT NOT NULL
);

-- Down
DROP TABLE IF EXISTS `users`;
