
const express = require("express");
const router = express.Router();

const Sale = require("../models/Sale");
const Stock = require("../models/Stock");
const Credit = require("../models/credit");
const { isAdmin } = require("../middleware/auth");
const Registration = require("../models/Registration");

router.get("/", async (req, res) => {
  try {
    // 1. FETCH DATA & AGGREGATE STOCK
    const sales = await Sale.find();
    const credits = await Credit.find();
    const users = await Registration.find();

    // Aggregation: Groups matching items by name and adding quantities  automatically
    const aggregatedStock = await Stock.aggregate([
      {
        $group: {
          _id: "$itemName", // Groups matching names together
          totalQuantity: { $sum: { $toInt: "$quantity" } }, 
          sellingPrice: { $first: "$sellingPrice" } 
        }
      },
      { $sort: { _id: 1 } } 
    ]);
    // checks stock status and flags items with 20 or less as low stock for dashboard alert
const lowStockItems = aggregatedStock.filter( 
  item => item.totalQuantity <= 20             
);
    // 2. FINANCIAL CALCULATIONS 
    const totalSales = sales.reduce((sum, s) => {
      return sum + (Number(s.totalCharge) || 0);
    }, 0);

    // Sum up the newly aggregated unique quantities for the Total Stock Card
    const totalStock = aggregatedStock.reduce((sum, item) => {
      return sum + (item.totalQuantity || 0);
    }, 0);

    const totalCredit = credits.reduce((sum, c) => {
      return sum + (Number(c.totalCost) || 0);
    }, 0);

    const totalPaid = credits.reduce((sum, c) => {
      return sum + (Number(c.amountDeposited) || 0);
    }, 0);

    const totalBalance = credits.reduce((sum, c) => {
      return sum + (Number(c.balance) || 0);
    }, 0);

    const profit = totalSales - totalBalance;

    // 3. RENDER TO PUG (Sends dbStock to matching variable definitions)
    res.render("admindashboard", {
      totalSales,
      totalStock,
      totalCredit,
      totalPaid,
      profit,
      credits,
      dbStock: aggregatedStock,
      lowStockItems: aggregatedStock.filter(item => item.totalQuantity <= 20),
      users
    });

  } catch (error) {
    console.log("ADMIN DASHBOARD ERROR:", error);
    res.status(500).send("Admin dashboard error");
  }
});
// edit user routes
router.get('/editusers/:id', async (req, res) => {

  try {

    const user = await Registration.findById(req.params.id);

    res.render('editusers', {
      user
    });

  } catch (error) {

    console.log(error);
    res.redirect('/admin');

  }
});

router.post('/editusers/:id', isAdmin, async (req, res) => {
  try {
    await Registration.findByIdAndUpdate(req.params.id, {
      fullname: req.body.fullname,
      email: req.body.email,
      phone: req.body.phone,
      role: req.body.role
    });
    res.redirect('/admin');
  } catch (error) {
    console.log(error);
    res.send('Error updating user');
  }
});

module.exports = router;