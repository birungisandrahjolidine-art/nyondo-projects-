const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number
  },
  unitPrice: {
    type: Number,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  supplierName: {
    type: String,
    trim: true
  },
  supplierPhone: {
    type: Number
  },
  factory:{
    type: String,
    trim:true,
  },
  paymentMethod:{
    type: String,
    required: true,
  },
  sellingPrice :{
    type: Number,
    // required: true
  },
  itemimage: {
  type: String
},
});
module.exports = mongoose.model('Stock', StockSchema);