import Order from '../models/Order.js';
import { calculateAndSaveCompliance } from './complianceController.js';
import { sendOrderConfirmationEmail } from '../utils/emailService.js';

// @desc    Create a new order and trigger automatic compliance calculation
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  const { orderId, customerId, productCode, demandQuantity } = req.body;

  try {
    // 1. Validation
    if (!orderId || !customerId || !productCode || demandQuantity === undefined) {
      return res.status(400).json({ message: 'All fields (orderId, customerId, productCode, demandQuantity) are required' });
    }

    const parsedQuantity = Number(demandQuantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ message: 'Demand quantity must be a positive number' });
    }

    // 2. Check if Order already exists
    const orderExists = await Order.findOne({ orderId: orderId.toUpperCase() });
    if (orderExists) {
      return res.status(400).json({ message: `Order with ID ${orderId.toUpperCase()} already exists` });
    }

    // 3. Save the Order to MongoDB
    const order = await Order.create({
      orderId: orderId.toUpperCase(),
      customerId: customerId.toUpperCase(),
      productCode: productCode.toUpperCase(),
      demandQuantity: parsedQuantity
    });

    // 4. Automatically trigger compliance calculation
    const complianceResult = await calculateAndSaveCompliance(order);

    // 5. Send order confirmation email to the logged-in operator
    if (req.user && req.user.email) {
      sendOrderConfirmationEmail(req.user.email, req.user.name, order, complianceResult)
        .catch(error => console.error('Failed to send order confirmation email:', error));
    } else {
      console.warn(`⚠️ Skipping confirmation email: No registered email address for operator "${req.user ? req.user.name : 'Unknown'}"`);
    }

    // 6. Send combined response back to client
    res.status(201).json({
      message: 'Order created and compliance calculated successfully',
      order,
      compliance: complianceResult
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
