import DeliveryCompliance from '../models/DeliveryCompliance.js';
import Inventory from '../models/Inventory.js';
import Order from '../models/Order.js';

// Helper function to calculate and save delivery compliance for an order
export const calculateAndSaveCompliance = async (order) => {
  const { orderId, customerId, productCode, demandQuantity } = order;

  // 1. Fetch Inventory for this product
  let inventory = await Inventory.findOne({ productCode: productCode.toUpperCase() });
  
  // If no inventory record exists, create one with 0 stock
  if (!inventory) {
    inventory = await Inventory.create({
      productCode: productCode.toUpperCase(),
      productName: `Product ${productCode.toUpperCase()}`,
      availableQuantity: 0
    });
  }

  const availableQuantity = inventory.availableQuantity;
  let compliedQty = 0;
  let delayQty = 0;
  let status = 'Fully Complied';
  let daysToAdd = 2; // Default 2 days for fully complied

  // 2. Perform compliance calculation
  if (availableQuantity >= demandQuantity) {
    compliedQty = demandQuantity;
    delayQty = 0;
    status = 'Fully Complied';
    daysToAdd = 2; // 2 days for standard delivery when stock is available
  } else {
    compliedQty = availableQuantity;
    delayQty = demandQuantity - availableQuantity;
    status = 'Partially Complied / Delayed';
    // Delay delivery proportional to shortage, capped between 3 and 5 days
    daysToAdd = 5; 
  }

  // 3. Calculate expected delivery date
  const expectedDeliveryDate = new Date();
  expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + daysToAdd);

  // 4. Update or create compliance record
  const complianceData = {
    orderId: orderId.toUpperCase(),
    customerId: customerId.toUpperCase(),
    productCode: productCode.toUpperCase(),
    demandQuantity,
    availableQuantity,
    compliedQty,
    delayQty,
    status,
    expectedDeliveryDate
  };

  const compliance = await DeliveryCompliance.findOneAndUpdate(
    { orderId: orderId.toUpperCase() },
    complianceData,
    { new: true, upsert: true }
  );

  return compliance;
};

// @desc    Calculate compliance for an order manually
// @route   POST /api/compliance/calculate
// @access  Private
export const calculateCompliance = async (req, res) => {
  const { orderId } = req.body;

  try {
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const order = await Order.findOne({ orderId: orderId.toUpperCase() });

    if (!order) {
      return res.status(404).json({ message: `Order not found with ID: ${orderId}` });
    }

    const compliance = await calculateAndSaveCompliance(order);
    res.status(200).json(compliance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch compliance details by orderId
// @route   GET /api/compliance/:orderId
// @access  Private
export const getComplianceByOrderId = async (req, res) => {
  try {
    const orderId = req.params.orderId.toUpperCase();
    const compliance = await DeliveryCompliance.findOne({ orderId });

    if (compliance) {
      res.json(compliance);
    } else {
      res.status(404).json({ message: `Compliance report not found for order: ${orderId}` });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all compliance records
// @route   GET /api/compliance
// @access  Private
export const getAllCompliance = async (req, res) => {
  try {
    const complianceRecords = await DeliveryCompliance.find({}).sort({ createdAt: -1 });
    res.json(complianceRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
