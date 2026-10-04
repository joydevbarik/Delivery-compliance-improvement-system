import mongoose from 'mongoose';

const deliveryComplianceSchema = new mongoose.Schema({
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
    min: 0
  },
  availableQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  compliedQty: {
    type: Number,
    required: true,
    min: 0
  },
  delayQty: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['Fully Complied', 'Partially Complied / Delayed'],
  },
  expectedDeliveryDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

const DeliveryCompliance = mongoose.model('DeliveryCompliance', deliveryComplianceSchema);

export default DeliveryCompliance;
