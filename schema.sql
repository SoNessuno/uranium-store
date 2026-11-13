CREATE TABLE IF NOT EXISTS products(
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT DEFAULT '',
  price TEXT DEFAULT '', image TEXT DEFAULT '', active INTEGER DEFAULT 1, sort INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS orders(
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, user_name TEXT,
  product_id INTEGER, product_name TEXT, roblox TEXT, details TEXT DEFAULT '',
  status TEXT DEFAULT 'new', handler TEXT, msg_id TEXT, created_at INTEGER, updated_at INTEGER);
CREATE INDEX IF NOT EXISTS orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_status ON orders(status);
