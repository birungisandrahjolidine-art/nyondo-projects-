const mongoose = require("mongoose");

const creditSchema = new mongoose.Schema({

  customerName: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: true,
  },

  itemName: {
    type: String,
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
  },

  unitPrice: {
    type: Number,
    required: true,
  },

  totalCost: {
    type: Number,
    required: true,
  },

  amountDeposited: {
    type: Number,
    required: true,
  },

  balance: {
    type: Number,
    required: true,
  },

  Nin: {
    type: String,
    required: true,
  },

  date: {
    type: Date,
    default: Date.now,
  },

  attendant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Registration",
  }

});

module.exports = mongoose.model("Credit", creditSchema);