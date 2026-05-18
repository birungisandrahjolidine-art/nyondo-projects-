// // // const express = require("express");
// // // const router = express.Router();

// // // const Sale = require("../models/Sale");
// // // const Stock = require("../models/Stock");
// // // const Credit = require("../models/Credit");

// // // router.get("/admin", async (req, res) => {
// // //   try {

// // //     // FETCH DATA 
// // //     const sales = await Sale.find();
// // //     const stocks = await Stock.find();
// // //     const credits = await Credit.find();

// // //     // SALES TOTAL 
// // //     const totalSales = sales.reduce((sum, s) => {
// // //       return sum + (Number(s.totalCharge) || 0);
// // //     }, 0);

// // //     // STOCK TOTAL 
// // //     const totalStock = stocks.reduce((sum, s) => {
// // //       return sum + (Number(s.quantity) || 0);
// // //     }, 0);

// // //     // CREDIT TOTAL 
// // //     const totalCredit = credits.reduce((sum, c) => {
// // //       return sum + (Number(c.totalCost) || 0);
// // //     }, 0);

// // //     // amount deposited
// // //     const totalPaid = credits.reduce((sum, c) => {
// // //       return sum + (Number(c.amountDeposited) || 0);
// // //     }, 0);

// // //     // balance
// // //     const totalBalance = credits.reduce((sum, c) => {
// // //       return sum + (Number(c.balance) || 0);
// // //     }, 0);

// // //     // profit
// // //     const profit = totalSales - totalBalance;

// // //     res.render("admindashboard", {
// // //       totalSales,
// // //       totalStock,
// // //       totalCredit,
// // //       totalPaid,
// // //       totalBalance,
// // //       profit,
// // //       credits,
// // //       stocks
// // //     });

// // //   } catch (error) {
// // //     console.log("ADMIN DASHBOARD ERROR:", error);
// // //     res.status(500).send("Admin dashboard error");
// // //   }
// // // });

// // // module.exports = router;
// // const express = require("express");
// // const router = express.Router();

// // const Sale = require("../models/Sale");
// // const Stock = require("../models/Stock");
// // const Credit = require("../models/Credit");

// // router.get("/", async (req, res) => {
// //   try {

// //     // FETCH DATA
// //     const sales = await Sale.find();
// //     const stocks = await Stock.find();
// //     const credits = await Credit.find();

// //     // ================= SALES =================
// //     const totalSales = sales.reduce((sum, s) => {
// //       return sum + (Number(s.totalCharge) || 0);
// //     }, 0);

// //     // ================= STOCK =================
// //     const totalStock = stocks.reduce((sum, s) => {
// //       return sum + (Number(s.quantity) || 0);
// //     }, 0);

// //     // ================= CREDIT TOTAL (AMOUNT OWED) =================
// //     const totalCredit = credits.reduce((sum, c) => {
// //       return sum + (Number(c.totalCost) || 0);
// //     }, 0);

// //     // TOTAL PAID 
// //     const totalPaid = credits.reduce((sum, c) => {
// //       return sum + (Number(c.amountDeposited) || 0);
// //     }, 0);

// //     // PROFIT 
// //     const totalBalance = credits.reduce((sum, c) => {
// //       return sum + (Number(c.balance) || 0);
// //     }, 0);

// //     const profit = totalSales - totalBalance;

// //     // ================= RENDER =================
// //     res.render("admindashboard", {
// //       totalSales,
// //       totalStock,
// //       totalCredit,
// //       totalPaid,
// //       profit,
// //       credits,
// //       stocks
// //     });

// //   } catch (error) {
// //     console.log("ADMIN DASHBOARD ERROR:", error);
// //     res.status(500).send("Admin dashboard error");
// //   }
// // });

// // module.exports = router;
// const express = require("express");
// const router = express.Router();

// const Sale = require("../models/Sale");
// const Stock = require("../models/Stock");
// const Credit = require("../models/Credit");

// router.get("/", async (req, res) => {
//   try {
//     // 1. FETCH DATA
//     const sales = await Sale.find();
//     const stocks = await Stock.find();
//     const credits = await Credit.find();

//     // 🚨 EMERGENCY LOGS: Look at your terminal screen when you load the page!
//     console.log("=== NYONDO DATABASE CHECK ===");
//     console.log(`Found ${sales.length} sales rows.`);
//     console.log(`Found ${stocks.length} stock rows.`);
//     console.log(`Found ${credits.length} credit rows.`);
    
//     if (stocks.length > 0) {
//       console.log("Sample Stock Object Keys:", Object.keys(stocks[0].toObject ? stocks[0].toObject() : stocks[0]));
//     }

//     // 2. CALCULATE LOGIC
//     const totalSales = sales.reduce((sum, s) => {
//       return sum + (Number(s.totalCharge) || 0);
//     }, 0);

//     const totalStock = stocks.reduce((sum, s) => {
//       return sum + (Number(s.quantity) || 0);
//     }, 0);

//     const totalCredit = credits.reduce((sum, c) => {
//       return sum + (Number(c.totalCost) || 0);
//     }, 0);

//     const totalPaid = credits.reduce((sum, c) => {
//       return sum + (Number(c.amountDeposited) || 0);
//     }, 0);

//     const totalBalance = credits.reduce((sum, c) => {
//       return sum + (Number(c.balance) || 0);
//     }, 0);

//     const profit = totalSales - totalBalance;

//     // 3. RENDER TO PUG
//     res.render("admindashboard", {
//       totalSales,
//       totalStock,
//       totalCredit,
//       totalPaid,
//       profit,
//       credits,
//       stocks
//     });

//   } catch (error) {
//     console.log("ADMIN DASHBOARD ERROR:", error);
//     res.status(500).send("Admin dashboard error");
//   }
// });

// module.exports = router;
const express = require("express");
const router = express.Router();

const Sale = require("../models/Sale");
const Stock = require("../models/Stock");
const Credit = require("../models/Credit");

router.get("/", async (req, res) => {
  try {
    // 1. FETCH DATA & AGGREGATE STOCK
    const sales = await Sale.find();
    const credits = await Credit.find();

    // Aggregation: Groups matching items by name and adds quantities up automatically
    const aggregatedStock = await Stock.aggregate([
      {
        $group: {
          _id: "$itemName", // Groups matching names together
          totalQuantity: { $sum: "$quantity" }, // Adds up all batch quantities
          sellingPrice: { $first: "$sellingPrice" } // Picks the baseline price context
        }
      },
      { $sort: { _id: 1 } } // Sorts alphabetically A-Z
    ]);

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

    // 3. RENDER TO PUG (Sends dbStock to match your new Pug variable definitions)
    res.render("admindashboard", {
      totalSales,
      totalStock,
      totalCredit,
      totalPaid,
      profit,
      credits,
      dbStock: aggregatedStock
    });

  } catch (error) {
    console.log("ADMIN DASHBOARD ERROR:", error);
    res.status(500).send("Admin dashboard error");
  }
});

module.exports = router;