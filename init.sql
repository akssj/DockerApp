/* At this point its unnecessery but iam leaving this for extra precaution */
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
);
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'root';



