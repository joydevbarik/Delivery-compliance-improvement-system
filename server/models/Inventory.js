import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  productCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  availableQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  productName: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    default: 'tons'
  }
}, {
  timestamps: true
});

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
