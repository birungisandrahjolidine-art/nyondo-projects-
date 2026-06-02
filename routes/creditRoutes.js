const express = require("express");
const router = express.Router();
const Credit = require("../models/Credit");
const Stock = require("../models/Stock"); 
const { isAdmin } = require("../middleware/auth");

// Get route for credit form - Clean & Fixed with plain object mapping
router.get("/creditform", isAdmin, async (req, res) => {
  try {
    // .lean() converts documents to clean JS objects so filtering reads .quantity perfectly
    const allItems = await Stock.find({}).lean() || [];
    
    console.log("=== DB RAW STOCK ITEMS INITIALIZED ===");
    console.log(allItems);

    const stockItems = allItems.filter(item => {
      const qty = Number(item.quantity || item.stockQuantity || 0);
      return qty > 0;
    });

    console.log("=== FILTERED AVAILABLE STOCK ITEMS ===");
    console.log(stockItems);

    res.render("creditform", { stockItems });
    
  } catch (error) {
    console.log("Error loading stock items:", error);
    res.render("creditform", { stockItems: [] });
  }
});

// Post route for credit form - Fixed field tracking and simplified error output
router.post("/creditform", isAdmin, async (req, res) => {
  try {
    // 1. Get form values
    const quantity = Number(req.body.quantity || 0);
    const amountDeposited = Number(req.body.amountDeposited || 0);

    // 2. Find stock item from DB
    const stockItem = await Stock.findOne({
      itemName: req.body.itemName
    });

    if (!stockItem) {
      return res.send("Item not found");
    }

    // 3. Check stock availability
    if (quantity > stockItem.quantity) {
      return res.send("Not enough stock available");
    }

    // 4. Get real selling price from DB
    const unitPrice = Number(stockItem.sellingPrice);

    // 5. Calculate totals
    const totalCost = quantity * unitPrice;
    const balance = totalCost - amountDeposited;

    // 6. Create credit record
    const credit = new Credit({
      customerName: req.body.customerName,
      phone: req.body.phoneNumber,
      address: req.body.address,
      Nin: req.body.Nin,
      itemName: req.body.itemName,
      quantity,
      unitPrice,
      totalCost,
      amountDeposited,
      balance,
      date: req.body.date || new Date()
    });

    await credit.save();

    // 7. Reduce stock quantity
    stockItem.quantity -= quantity;
    await stockItem.save();

    // 8. Redirect
    res.redirect("/credit");

  } catch (error) {
    console.log("Error saving credit:", error);
    res.send("Invalid input");
  }
});

// Get route for credit details overview table page
router.get("/credit", async (req, res) => {
  try {
    const credits = await Credit.find() || [];
    const itemsMap = {};

    credits.forEach(credit => {
      if (itemsMap[credit.itemName]) {
        itemsMap[credit.itemName] += Number(credit.quantity);
      } else {
        itemsMap[credit.itemName] = Number(credit.quantity);
      }
    });

    const itemsUnderCredit = Object.entries(itemsMap).map(([itemName, quantity]) => ({
      itemName,
      quantity
    }));
    
    const totalCredit = credits.reduce((sum, c) => sum + (Number(c.totalCost) || 0), 0);
    const totalPaid = credits.reduce((sum, c) => sum + (Number(c.amountDeposited) || 0), 0);
    const peopleWithCredit = new Set(credits.map(c => c.customerName)).size;

    res.render("credit", {
      credits,
      totalCredit,
      itemsUnderCredit,
      totalPaid,
      peopleWithCredit
    });

  } catch (error) {
    console.log(error);
    res.render("credit", {
      credits: [],
      totalCredit: 0,
      totalPaid: 0,
      peopleWithCredit: 0
    });
  }
});

// Generating the invoice/receipt for a credit record
router.get("/creditreceipt/:id", async (req, res) => {
  try {
    const credit = await Credit.findById(req.params.id);

    if (!credit) {
      return res.status(404).send("Invalid input");
    }

    res.render("creditreceipt", { credit });

  } catch (error) {
    console.log(error);
    res.status(500).send("Invalid input");
  }
});

// Get and Post routes for updating outstanding balances
router.get('/creditedit/:id', isAdmin, async (req, res) => {
  try {
    const credit = await Credit.findById(req.params.id);
    res.render('creditedit', { credit });
  } catch (error) {
    console.log(error);
    res.send('Invalid input');
  }
});

router.post('/creditedit/:id', isAdmin, async (req, res) => {
  try {
    const { date, amountDeposited } = req.body;
    const credit = await Credit.findById(req.params.id);

    // Increment payment details securely
    credit.amountDeposited += Number(amountDeposited);
    credit.balance = credit.totalCost - credit.amountDeposited;
    credit.date = date;

    await credit.save();
    res.redirect('/credit');
  } catch (error) {
    console.log(error);
    res.send('Invalid input');
  }
});

module.exports = router;