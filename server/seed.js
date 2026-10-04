import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Inventory from './models/Inventory.js';
import Order from './models/Order.js';
import DeliveryCompliance from './models/DeliveryCompliance.js';
import { calculateAndSaveCompliance } from './controllers/complianceController.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/delivery_compliance');
    console.log('Database connected successfully!');

    // Clear existing data
    console.log('Clearing collections...');
    await User.deleteMany({});
    await Inventory.deleteMany({});
    await Order.deleteMany({});
    await DeliveryCompliance.deleteMany({});
    console.log('Collections cleared!');

    // 1. Seed Users
    console.log('Seeding Users...');
    const users = [
      {
        userId: 'tata_operator',
        password: 'password123',
        name: 'Aditya Sen (Plant Operations Manager)',
        phone: '+91-9876543210',
        email: 'aditya.sen@tatasteel.com',
        department: 'Plant Operations',
        role: 'Plant Administrator'
      },
      {
        userId: 'operator1',
        password: 'password123',
        name: 'Rajesh Kumar (Supply Chain Officer)',
        phone: '+91-9876543211',
        email: 'rajesh.kumar@tatasteel.com',
        department: 'Supply Chain',
        role: 'Supply Chain Planner'
      }
    ];

    // Note: User.create triggers the 'save' hook which hashes the passwords
    const createdUsers = await User.create(users);
    console.log(`Seeded ${createdUsers.length} users successfully!`);

    // 2. Seed Inventory
    console.log('Seeding Inventory...');
    const inventories = [
      {
        productCode: 'TATA-HR-001',
        productName: 'Hot Rolled Steel Coils',
        availableQuantity: 5000.0,
        unit: 'tons'
      },
      {
        productCode: 'TATA-CR-002',
        productName: 'Cold Rolled Sheet Metal',
        availableQuantity: 500.0,
        unit: 'tons'
      },
      {
        productCode: 'TATA-WR-003',
        productName: 'High Strength Wire Rods',
        availableQuantity: 2000.0,
        unit: 'tons'
      },
      {
        productCode: 'TATA-GP-004',
        productName: 'Galvanized Plain Steel Sheet',
        availableQuantity: 1500.0,
        unit: 'tons'
      },
      {
        productCode: 'TATA-RE-005',
        productName: 'Tata Tiscon Fe 550D Rebars',
        availableQuantity: 1000.0,
        unit: 'tons'
      },
      {
        productCode: 'TATA-SS-006',
        productName: 'Structural Steel Beams (IS 2062)',
        availableQuantity: 3200.0,
        unit: 'tons'
      },
      {
        productCode: 'TATA-MS-007',
        productName: 'Medium Section Steel Channels',
        availableQuantity: 750.0,
        unit: 'tons'
      },
      {
        productCode: 'TATA-PL-008',
        productName: 'Heavy Steel Plates (25mm)',
        availableQuantity: 1800.0,
        unit: 'tons'
      },
      {
        productCode: 'TATA-EA-009',
        productName: 'Equal Steel Angles (ISA 100x100)',
        availableQuantity: 420.0,
        unit: 'tons'
      },
      {
        productCode: 'TATA-BI-010',
        productName: 'Steel Billets (130x130mm)',
        availableQuantity: 6500.0,
        unit: 'tons'
      }
    ];

    const createdInventory = await Inventory.create(inventories);
    console.log(`Seeded ${createdInventory.length} inventory products successfully!`);

    // 3. Seed Orders & Auto-Calculate Compliance
    console.log('Seeding Orders & Calculating Delivery Compliance...');
    const orders = [
      {
        orderId: 'ORD-2026-001',
        customerId: 'CUST-SAIL-01',
        productCode: 'TATA-HR-001',
        demandQuantity: 4500.0 // compliant (available: 5000)
      },
      {
        orderId: 'ORD-2026-002',
        customerId: 'CUST-HYUNDAI',
        productCode: 'TATA-CR-002',
        demandQuantity: 620.0 // delayed (available: 500)
      },
      {
        orderId: 'ORD-2026-003',
        customerId: 'CUST-LNT-INFRA',
        productCode: 'TATA-RE-005',
        demandQuantity: 800.0 // compliant (available: 1000)
      },
      {
        orderId: 'ORD-2026-004',
        customerId: 'CUST-MARUTI',
        productCode: 'TATA-WR-003',
        demandQuantity: 1800.0 // compliant (available: 2000)
      },
      {
        orderId: 'ORD-2026-005',
        customerId: 'CUST-TATA-MOTORS',
        productCode: 'TATA-GP-004',
        demandQuantity: 1200.0 // compliant (available: 1500)
      },
      {
        orderId: 'ORD-2026-006',
        customerId: 'CUST-LARSEN',
        productCode: 'TATA-SS-006',
        demandQuantity: 2800.0 // compliant (available: 3200)
      },
      {
        orderId: 'ORD-2026-007',
        customerId: 'CUST-SHAPOORJI',
        productCode: 'TATA-MS-007',
        demandQuantity: 900.0 // delayed (available: 750)
      },
      {
        orderId: 'ORD-2026-008',
        customerId: 'CUST-ADANI-PORTS',
        productCode: 'TATA-PL-008',
        demandQuantity: 1600.0 // compliant (available: 1800)
      },
      {
        orderId: 'ORD-2026-009',
        customerId: 'CUST-ESSAR-STEEL',
        productCode: 'TATA-EA-009',
        demandQuantity: 380.0 // compliant (available: 420)
      },
      {
        orderId: 'ORD-2026-010',
        customerId: 'CUST-JSPL',
        productCode: 'TATA-BI-010',
        demandQuantity: 5000.0 // compliant (available: 6500)
      }
    ];

    for (const orderData of orders) {
      const order = await Order.create(orderData);
      await calculateAndSaveCompliance(order);
    }

    console.log('Successfully seeded orders and generated initial compliance records!');
    console.log('Seeding database complete!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
