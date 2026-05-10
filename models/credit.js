const mongoose = require("mongoose");

const creditSchema = new mongoose.Schema({
  customerName:{
    type: String,
    required: true,
  },
  itemName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
  },
  amountDeposited: {
    type: Number,
    required: true,
  },
  dateTaken:{
    type: Date,
    required: true,
  },
  dueDate:{
    type: Date,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  }, 
     attendant:{
     type: mongoose.Schema.Types.ObjectId,
     ref:'Registration'
    },
});

module.exports = mongoose.model("Credit", creditSchema);