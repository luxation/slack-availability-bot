-- Up
CREATE TABLE `users` (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    channel TEXT NOT NULL
);

-- Down
DROP TABLE IF EXISTS `users`;
