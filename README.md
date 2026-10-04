# Tata Steel Delivery Compliance Improvement System

A production-ready, full-stack industrial supply chain management portal designed for monitoring and optimizing customer order delivery compliance against plant inventory levels. Developed in accordance with enterprise dashboard standards.

---

## 🏗️ System Architecture & Workflow

```mermaid
graph TD
    A[Vite React Frontend] -- REST API Requests with JWT --> B[Node.js + Express Server]
    B -- Mongoose ORM --> C[(MongoDB Database)]
    
    subgraph Calculation Engine
        D[Create Sales Order] --> E[Fetch Product SKU Inventory]
        E --> F{Stock >= Demand?}
        F -- Yes --> G[Status: Fully Complied<br/>Complied = Demand<br/>Delay = 0<br/>Date = Current + 2 Days]
        F -- No --> H[Status: Partially Complied / Delayed<br/>Complied = Stock<br/>Delay = Demand - Stock<br/>Date = Current + 5 Days]
        G --> I[Save to Delivery Compliance DB]
        H --> I
    end
    B --> Calculation Engine
```

---

## 📁 Repository Structure

```text
deliveryCompliance/
├── client/                      # React Frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   └── Sidebar.jsx      # High-fidelity left sidebar navigation
│   │   ├── pages/
│   │   │   ├── Login.jsx        # Login & Security token authorization panel
│   │   │   ├── DashboardHome.jsx# Mill overview analytics, thresholds, and timeline
│   │   │   ├── CreateOrder.jsx  # Order placement console & live stock validator
│   │   │   ├── InventoryList.jsx# SKU levels & Emergency stock replenisher
│   │   │   └── ComplianceList.jsx# Calculated compliance table & re-audit triggers
│   │   ├── utils/
│   │   │   └── api.js           # Shared Axios-like fetch wrapper (JWT injected)
│   │   ├── App.jsx              # Main routing boundaries & auth checks
│   │   ├── main.jsx             # DOM mounting entry
│   │   └── index.css            # Tailwind directives, dark themes, & Outfit typography
│   ├── tailwind.config.js       # Custom Tata Steel palette configuration
│   ├── postcss.config.js        # PostCSS directives
│   └── package.json             # Frontend script, Router, and Lucide dependencies
│
└── server/                      # Node.js + Express Backend
    ├── config/
    │   └── db.js                # Database connection initialization
    ├── middleware/
    │   └── auth.js              # Express JWT token verification middleware
    ├── models/
    │   ├── User.js              # Operations staff schemas & bcrypt hooks
    │   ├── Inventory.js         # SKU stock counts & yard materials schemas
    │   ├── Order.js             # Sales orders and customer requests schemas
    │   └── DeliveryCompliance.js# Calculated compliance audit reports schemas
    ├── controllers/
    │   ├── authController.js    # JWT authorization and credential validation
    │   ├── orderController.js   # Order registration & automatic compliance calculations
    │   ├── inventoryController.js# Material lookups & manual adjustments
    │   └── complianceController.js# Delivery matching core & timeline generators
    ├── routes/
    │   ├── authRoutes.js        # Auth routing maps
    │   ├── orderRoutes.js       # Orders routing maps
    │   ├── inventoryRoutes.js   # Inventory routing maps
    │   └── complianceRoutes.js  # Compliance calculations routing maps
    ├── .env                     # App configurations (Ports, Database URI, Secrets)
    ├── seed.js                  # Database clearing and premium high-fidelity seeder
    └── server.js                # Application entry, CORS configurations, & error layers
```

---

## ⚡ Setup & Launch Instructions

### Prerequisites
1. **Node.js** installed on your workstation.
2. **MongoDB** service running locally (on default port `27017`).

---

### Step 1: Database Initialization & Seeding
Populate the database with pre-configured operational personnel accounts, plant stock materials, and active sales orders.

1. Open a terminal in the `/server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the high-fidelity seed script:
   ```bash
   npm run seed
   ```
   *Expected Output:*
   ```text
   Connecting to database for seeding...
   Database connected successfully!
   Clearing collections...
   Collections cleared!
   Seeding Users...
   Seeded 2 users successfully!
   Seeding Inventory...
   Seeded 5 inventory products successfully!
   Seeding Orders & Calculating Delivery Compliance...
   Successfully seeded orders and generated initial compliance records!
   Seeding database complete!
   ```

---

### Step 2: Start the Backend Server
Launch the API control microservice.

1. In the `/server` directory, execute:
   ```bash
   npm start
   ```
   *The backend listens on port `5000` (`http://localhost:5000`).*

---

### Step 3: Start the Frontend Client
Launch the premium web UI console.

1. Open a new terminal in the `/client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Boot the development dev server:
   ```bash
   npm run dev
   ```
   *The client console spins up on port `5173` (`http://localhost:5173`).*

---

## 🔑 Operational Credentials (Seeded)

The login panel supports instant autofill buttons, but you can also key them manually:

| User Type | Operator ID | Password | Full Name | Operational Role |
| :--- | :--- | :--- | :--- | :--- |
| **Plant Administrator** | `tata_operator` | `password123` | Aditya Sen | Plant Operations Manager |
| **Supply Chain Planner** | `operator1` | `password123` | Rajesh Kumar | Supply Chain Planner |

---

## 🔌 Core API Routes Documentation

### 🔒 Authentication
* **`POST /api/login`**: Authenticate operator credentials. Returns JWT bearer token.
  * *Request Body:* `{ "userId": "operator1", "password": "password123" }`

### 📦 Orders
* **`POST /api/orders`**: Create a new customer order. *Automatically executes compliance logic.*
  * *Request Body:* `{ "orderId": "ORD-099", "customerId": "CUST-A", "productCode": "TATA-HR-001", "demandQuantity": 150 }`
* **`GET /api/orders`**: Fetch complete historical sales orders registry.

### 🏭 Material Inventory
* **`GET /api/inventory`**: Query all yard material items.
* **`GET /api/inventory/:productCode`**: Fetch specific stock depth by SKU identifier.
* **`PUT /api/inventory/:productCode`**: Adjust yard material availability.
  * *Request Body:* `{ "availableQuantity": 600 }`

### 📈 Delivery Compliance Calculation
* **`GET /api/compliance`**: Retrieve entire parsed compliance audit records.
* **`GET /api/compliance/:orderId`**: Retrieve individual compliance record.
* **`POST /api/compliance/calculate`**: Force-trigger or re-compute compliance for any existing order.
  * *Request Body:* `{ "orderId": "ORD-099" }`
