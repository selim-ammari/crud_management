# CRUD Management System

A full-stack CRUD application for managing employees and devices, built with React (Next.js), Express, and SQLite.

## Features

### Employee Management
- ✅ Create, Read, Update, Delete employees
- ✅ Filter employees by role
- ✅ Modern, responsive UI

### Device Management
- ✅ Create, Read, Update, Delete devices
- ✅ Assign devices to employees
- ✅ Filter devices by type or owner
- ✅ View device ownership information

## Tech Stack

- **Frontend**: React (Next.js 16) with TypeScript and Tailwind CSS
- **Backend**: Express.js (Node.js)
- **Database**: SQLite
- **Language**: TypeScript (frontend), JavaScript (backend)

## Project Structure

```
crud_management/
├── client/                 # Next.js frontend application
│   ├── app/
│   │   ├── components/    # React components
│   │   ├── api/           # API client functions
│   │   ├── types/         # TypeScript type definitions
│   │   └── page.tsx       # Main page
│   └── package.json
├── server/                 # Express backend
│   ├── server.js          # Express server and API routes
│   ├── database.js        # SQLite database initialization
│   └── package.json
├── sql/                    # SQL files for e-commerce database
│   ├── structure.sql      # SQLite version
│   ├── structure_postgresql.sql
│   ├── structure_mysql.sql
│   ├── query.sql          # SQLite queries
│   ├── query_postgresql.sql
│   ├── query_mysql.sql
│   ├── sales_prediction.js # Sales prediction algorithm
│   └── README.md
└── package.json           # Root package.json with scripts
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository and navigate to the project directory:
```bash
cd crud_management
```

2. Install all dependencies (root, server, and client):
```bash
npm run install-all
```

Or install manually:
```bash
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### Running the Application

1. **If port 5002 is already in use**, free it first:
```bash
npm run kill-port
# Or manually: lsof -ti:5002 | xargs kill -9
```

2. Start both the backend and frontend servers:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5002` (or the port specified in `server/server.js`)
- Frontend application on `http://localhost:3000`

3. Open your browser and navigate to `http://localhost:3000`

**Important Notes:**
- ✅ **Database for main application (Employees/Devices)**: The SQLite database is **automatically created** when you start the server. No manual setup needed! The database file will be created at `server/database.sqlite`.
- 📊 **Sample Data**: If the database is empty, sample data (5 employees and 7 devices) will be automatically added when you start the server. You can also manually add sample data by running: `npm run seed`
- ⚠️ **Database for SQL tasks (e-commerce)**: This requires **manual setup** (see "SQL Tasks" section below).
- If you encounter a "port already in use" error, the server will display a helpful error message with instructions on how to free the port.
- The default backend port is 5002. You can change it in `server/server.js` or by setting the `PORT` environment variable.
- Make sure the `NEXT_PUBLIC_API_URL` in your client matches the backend port, or update `client/app/api/client.ts`.

### Running Servers Separately

**Backend only:**
```bash
npm run server
# or
cd server && npm start
```

**Frontend only:**
```bash
npm run client
# or
cd client && npm run dev
```

## API Endpoints

### Employees

- `GET /api/employees` - Get all employees (optional query: `?role=Developer`)
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Devices

- `GET /api/devices` - Get all devices (optional queries: `?type=Laptop&owner_id=1`)
- `GET /api/devices/:id` - Get device by ID
- `POST /api/devices` - Create new device
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device

## SQL Tasks

The SQL tasks are located in the `/sql` directory. **These are separate from the main application database** and require manual setup.

### Database Setup

**⚠️ Important:** You need to manually create the e-commerce database for the SQL tasks. This is different from the main application database which is created automatically.

**Prerequisites:** Make sure you have SQLite installed (usually pre-installed on macOS/Linux). For PostgreSQL or MySQL, install them separately.

**SQLite:**
```bash
cd sql
sqlite3 ecommerce.db < structure.sql
```

**PostgreSQL:**
```bash
psql -U username -d database_name -f structure_postgresql.sql
```

**MySQL:**
```bash
mysql -u username -p database_name < structure_mysql.sql
```

### Running Queries

**SQLite:**
```bash
sqlite3 ecommerce.db < query.sql
```

**PostgreSQL:**
```bash
psql -U username -d database_name -f query_postgresql.sql
```

**MySQL:**
```bash
mysql -u username -p database_name < query_mysql.sql
```

### Sales Prediction

The sales prediction algorithm is implemented in `sql/sales_prediction.js`. It uses:
- Moving average calculation
- Trend analysis (linear regression)
- Predictions for future sales periods

To run:
```bash
cd sql
node sales_prediction.js [prediction_days]
```

Example:
```bash
node sales_prediction.js 7   # Predict next 7 days
node sales_prediction.js 30  # Predict next 30 days
```

**Note:** The sales prediction script requires the e-commerce database to be set up first. Make sure to run `structure.sql` before running the prediction script.

## Database Schema

### Employees & Devices (Main Application)

- **employees**: id, name, role, created_at
- **devices**: id, name, type, owner_id, created_at

### E-commerce (SQL Tasks)

- **users**: id, email, name, created_at, updated_at
- **products**: id, name, sku, price, description, stock_quantity, created_at, updated_at
- **orders**: id, user_id, total_amount, status, created_at, updated_at
- **order_items**: id, order_id, product_id, quantity, unit_price, subtotal, created_at

## Development

### Environment Variables

Create a `.env.local` file in the `client` directory if you need to change the API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Database Location

The SQLite database for the main application is created at `server/database.sqlite` when the server starts.

## License

This project is created as part of a technical assessment.
