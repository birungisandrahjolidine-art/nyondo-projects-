const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  itemName:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stock',
    required: true
  },
  CustomerName: {
    type: String,
    trim: true,
    required: ['CustomerName is required']
  },
  customerAddress: {
    type:String,
    required:true,
  },
  PhoneNumber: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unitPrice: {
    type: Number,
    required: true
  },
  customerDistance:{
    type:String,
    required:true,
  },
  PaymentMethod: {
    type: String,
    required: true
  },
  attendant:{
 type: mongoose.Schema.Types.ObjectId,
 ref:'Registration'
},
transportCharge:{
type:Number,
required:true,
},
totalCharge:{
  type:Number,
  required:true
},
});

module.exports = mongoose.model('Sale', SaleSchema);