const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");
const Stock = require("../models/Stock");


// --- 1. THE GET ROUTE (This fixes your 'undefined' error) ---
router.get("/salesform", async (req, res) => {
  try {
    // Fetch all items from Stock to populate the dropdown
    const items = await Stock.find(); 
    
    // Render the form and pass the items as 'stockItems'
    res.render("salesform", { 
      stockItems: items 
    });
  } catch (error) {
    console.error("Error loading sales form:", error);
    res.status(500).send("Unable to load stock items.");
  }
});

// --- 2. THE POST ROUTE 
router.post("/salesform", async (req, res) => {
  try {
    const {
      itemId,
      customerName,
      customerAddress,
      customerDistance,
      phoneNumber,
      quantity,
      unitPrice,
      paymentMethod,
      transportCharge
    } = req.body;

    // 1. Find stock item
    const item = await Stock.findById(itemId);

    if (!item) {
      return res.status(404).send("Item not found");
    }

    // 2. Check if enough stock exists
    if (item.quantity < quantity) {
      // If stock is low, we must re-render the form with the list again
      const items = await Stock.find();
      return res.render("salesform", {
        stockItems: items,
        error: "Not enough stock available"
      });
    }

    // 3. Reduce stock and save
    item.quantity -= parseInt(quantity);
    await item.save();

    // 4. Calculate total
    const totalCharge = (parseInt(quantity) * parseFloat(unitPrice)) + parseFloat(transportCharge || 0);

    // 5. Save the sale
    const newSale = new Sale({
      itemId: item._id,
      itemName: item.itemName,
      customerName,
      customerAddress,
      customerDistance,
      phoneNumber,
      quantity,
      unitPrice,
      paymentMethod,
      transportCharge: transportCharge || 0,
      totalCharge,
      // edit
    });

    await newSale.save();

    // 6. Redirect to dashboard 
    // res.redirect("/receipt");
    res.redirect(`/receipt/${newSale._id}`);

  } catch (error) {
    console.error("Error saving sale:", error);
    res.status(500).send("Error saving sale");
  }
});
// --- 3. THE DASHBOARD GET ROUTE ---
router.get("/salesdashboard", async (req, res) => {
  try {
    // Fetch all sales from the database
   
const sales = await Sale.find()
  .populate("attendant")
  .sort({ date: -1 });
    // Calculate today's total for your dashboard card
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    const todayTotal = sales
      .filter(sale => new Date(sale.date) >= startOfToday)
      .reduce((sum, sale) => sum + sale.totalCharge, 0);

    // RENDER the dashboard and PASS the sales data
    res.render("salesdashboard", { 
     dbSales: sales,
      todayTotal: todayTotal 
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).send("Unable to load the dashboard.");
  }
});
router.get("/receipt/:id", async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).send("Sale not found");
    }

    res.render("receipt", { sale });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


module.exports = router;