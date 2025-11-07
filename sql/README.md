# SQL Directory

This directory contains SQL files and scripts for the e-commerce database model.

## Files

### structure.sql
Contains the database schema (CREATE TABLE statements) and sample data (INSERT statements) for:
- users
- products
- orders
- order_items

### query.sql
Contains SQL queries to:
1. Get email addresses of users who bought PRODUCT_1 in the past 7 days
2. Get total sales amount per day

### sales_prediction.js
A Node.js script that implements a sales prediction algorithm using:
- Moving average calculation
- Trend analysis (linear regression)
- Predictions for future sales periods

## Usage

### Setting up the database

For SQLite:
```bash
sqlite3 ecommerce.db < structure.sql
```

For PostgreSQL:
```bash
psql -U username -d database_name -f structure.sql
```

For MySQL:
```bash
mysql -u username -p database_name < structure.sql
```

### Running queries

```bash
sqlite3 ecommerce.db < query.sql
```

### Running sales prediction

**First, install dependencies:**
```bash
cd sql
npm install
```

**Then run the prediction script:**
```bash
node sales_prediction.js [prediction_days]
```

Or use the npm script:
```bash
npm run predict [prediction_days]
```

Example:
```bash
node sales_prediction.js 7  # Predict next 7 days
node sales_prediction.js 30 # Predict next 30 days
```

## Notes

- The `structure.sql` file uses SQLite syntax. For PostgreSQL or MySQL, you may need to adjust:
  - `INTEGER PRIMARY KEY AUTOINCREMENT` → `SERIAL PRIMARY KEY` (PostgreSQL) or `INT AUTO_INCREMENT PRIMARY KEY` (MySQL)
  - `DATETIME` → `TIMESTAMP` (PostgreSQL/MySQL)
  - `VARCHAR` → `VARCHAR` (same for all)
  - `DECIMAL` → `DECIMAL` (same for all)

- The `sales_prediction.js` script requires the `sqlite3` npm package. Install it by running `npm install` in the `sql/` directory.
- The script expects a database file at `sql/ecommerce.db`. Make sure to run `structure.sql` first to create the database.

