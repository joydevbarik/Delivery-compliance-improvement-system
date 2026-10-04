import Inventory from '../models/Inventory.js';

// @desc    Get inventory by product code
// @route   GET /api/inventory/:productCode
// @access  Private
export const getInventoryByProductCode = async (req, res) => {
  try {
    const productCode = req.params.productCode.toUpperCase();
    const inventory = await Inventory.findOne({ productCode });

    if (inventory) {
      res.json(inventory);
    } else {
      res.status(404).json({ message: `Inventory not found for product code: ${productCode}` });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all inventory
// @route   GET /api/inventory
// @access  Private
export const getAllInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find({}).sort({ productCode: 1 });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update inventory stock level
// @route   PUT /api/inventory/:productCode
// @access  Private
export const updateInventoryStock = async (req, res) => {
  const { availableQuantity } = req.body;
  try {
    const productCode = req.params.productCode.toUpperCase();
    const inventory = await Inventory.findOne({ productCode });

    if (inventory) {
      inventory.availableQuantity = Number(availableQuantity);
      const updatedInventory = await inventory.save();
      res.json(updatedInventory);
    } else {
      res.status(404).json({ message: `Inventory not found for product code: ${productCode}` });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
