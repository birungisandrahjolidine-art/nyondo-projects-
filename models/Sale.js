const mongoose = require("mongoose");

const SaleSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },

  customerName: {
    type: String,
    trim: true,
    required: true
  },

  customerAddress: {
    type: String,
    required: true
  },

  phoneNumber: {
    type: String,
    trim: true
  },

  customerDistance: {
    type: Number,
    required: true
  },

  paymentMethod: {
    type: String,
    required: true
  },

  attendant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Registration"
  },

  transportCharge: {
    type: Number,
    default: 0
  },

  transportChargeType: {
    type: String,
    default: 'Own Transport'
  },

  transportPaid: {
    type: Boolean,
    default: true
  },

  totalCharge: {
    type: Number,
    required: true
  },

  // MULTI-ITEM SUPPORT
  items: [
    {
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stock",
        required: true
      },

      itemName: {
        type: String,
        required: true
      },

      quantity: {
        type: Number,
        required: true
      },

      unitPrice: {
        type: Number,
        required: true
      },

      subTotal: {
        type: Number,
        required: true
      }
    }
  ]
});

module.exports = mongoose.model("Sale", SaleSchema);