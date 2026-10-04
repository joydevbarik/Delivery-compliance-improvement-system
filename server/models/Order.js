import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  customerId: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  productCode: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  demandQuantity: {
    type: Number,
    required: true,
    min: 0.1
  }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
