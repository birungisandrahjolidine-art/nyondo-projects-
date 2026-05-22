// // const express = require("express");
// // const router = express.Router();
// // const Sale = require("../models/Sale");
// // const Stock = require("../models/Stock");


// // // --- 1. THE GET ROUTE (This fixes your 'undefined' error) ---
// // router.get("/salesform", async (req, res) => {
// //   try {
// //     // Fetch all items from Stock to populate the dropdown
// //     const items = await Stock.find(); 
    
// //     // Render the form and pass the items as 'stockItems'
// //     res.render("salesform", { 
// //       stockItems: items 
// //     });
// //   } catch (error) {
// //     console.error("Error loading sales form:", error);
// //     res.status(500).send("Unable to load stock items.");
// //   }
// // });

// // // --- 2. THE POST ROUTE 
// // router.post("/salesform", async (req, res) => {
// //   try {
// //     const {
// //       itemId,
// //       customerName,
// //       customerAddress,
// //       customerDistance,
// //       phoneNumber,
// //       quantity,
// //       unitPrice,
// //       paymentMethod,
// //       transportCharge
// //     } = req.body;

// //     // 1. Find stock item
// //     const item = await Stock.findById(itemId);

// //     if (!item) {
// //       return res.status(404).send("Item not found");
// //     }

// //     // 2. Check if enough stock exists
// //     if (item.quantity < quantity) {
// //       // If stock is low, we must re-render the form with the list again
// //       const items = await Stock.find();
// //       return res.render("salesform", {
// //         stockItems: items,
// //         error: "Not enough stock available"
// //       });
// //     }

// //     // 3. Reduce stock and save
// //     item.quantity -= parseInt(quantity);
// //     await item.save();

// //     // 4. Calculate total
// //     const totalCharge = (parseInt(quantity) * parseFloat(unitPrice)) + parseFloat(transportCharge || 0);

// //     // 5. Save the sale
// //     const newSale = new Sale({
// //       itemId: item._id,
// //       itemName: item.itemName,
// //       customerName,
// //       customerAddress,
// //       customerDistance,
// //       phoneNumber,
// //       quantity,
// //       unitPrice,
// //       paymentMethod,
// //       transportCharge: transportCharge || 0,
// //       totalCharge,
// //       // edit
// //     });

// //     await newSale.save();

// //     // 6. Redirect to dashboard 
// //     // res.redirect("/receipt");
// //     res.redirect(`/receipt/${newSale._id}`);

// //   } catch (error) {
// //     console.error("Error saving sale:", error);
// //     res.status(500).send("Error saving sale");
// //   }
// // });
// // // --- 3. THE DASHBOARD GET ROUTE ---
// // router.get("/salesdashboard", async (req, res) => {
// //   try {
// //     // Fetch all sales from the database
   
// // const sales = await Sale.find()
// //   .populate("attendant")
// //   .sort({ date: -1 });
// //     // Calculate today's total for your dashboard card
// //     const startOfToday = new Date();
// //     startOfToday.setHours(0, 0, 0, 0);
    
// //     const todayTotal = sales
// //       .filter(sale => new Date(sale.date) >= startOfToday)
// //       .reduce((sum, sale) => sum + sale.totalCharge, 0);

// //     // RENDER the dashboard and PASS the sales data
// //     res.render("salesdashboard", { 
// //      dbSales: sales,
// //       todayTotal: todayTotal 
// //     });
// //   } catch (error) {
// //     console.error("Error fetching dashboard data:", error);
// //     res.status(500).send("Unable to load the dashboard.");
// //   }
// // });
// // // sale and delete routes
// // // router.get("/sale/edit/:id", async (req, res) => {
// // //   try {
// // //     const sale = await Sale.findById(req.params.id);

// // //     if (!sale) {
// // //       return res.status(404).send("Sale not found");
// // //     }

// // //     res.render("sales-edit", { sale }); 
// // //   } catch (error) {
// // //     console.error("Edit page error:", error);
// // //     res.status(500).send("Server error");
// // //   }
// // // });
// // // router.post("/sale/edit/:id", async (req, res) => {
// // //   try {
// // //     await Sale.findByIdAndUpdate(req.params.id, req.body);
// // //     res.redirect("/salesdashboard");
// // //   } catch (error) {
// // //     console.error("Error updating sale:", error);
// // //     res.status(500).send("Error updating sale");
// // //   }
// // // });
// // // --- THE EDIT GET ROUTE ---
// // router.get("/sale/edit/:id", async (req, res) => {
// //   try {
// //     const sale = await Sale.findById(req.params.id);
// //     if (!sale) {
// //       return res.status(404).send("Sale not found");
// //     }

// //     // Fetches your stock list so your dropdown menus don't break
// //     const items = await Stock.find(); 

// //     // Renders your physical 'sales-edit.pug' template file safely
// //     res.render("sales-edit", { 
// //       sale: sale,
// //       stockItems: items 
// //     }); 
// //   } catch (error) {
// //     console.error("Edit page error:", error);
// //     res.status(500).send("Server error");
// //   }
// // });

// // // --- THE EDIT POST ROUTE ---
// // router.post("/sale/edit/:id", async (req, res) => {
// //   try {
// //     const { quantity, unitPrice, transportCharge } = req.body;

// //     // Recalculates financial math automatically if values were updated
// //     if (quantity && unitPrice) {
// //       req.body.totalCharge = (parseInt(quantity) * parseFloat(unitPrice)) + parseFloat(transportCharge || 0);
// //     }

// //     await Sale.findByIdAndUpdate(req.params.id, req.body, { new: true });
// //     res.redirect("/salesdashboard");
// //   } catch (error) {
// //     console.error("Error updating sale:", error);
// //     res.status(500).send("Error updating sale");
// //   }
// // });
// // router.post("/sale/delete/:id", async (req, res) => {
// //   try {
// //     await Sale.findByIdAndDelete(req.params.id);
// //     res.redirect("/salesdashboard");
// //   } catch (error) {
// //     console.error("Error deleting sale:", error);
// //     res.status(500).send("Failed to delete sale");
// //   }
// // });
// // router.get("/receipt/:id", async (req, res) => {
// //   try {
// //     const sale = await Sale.findById(req.params.id);

// //     if (!sale) {
// //       return res.status(404).send("Sale not found");
// //     }

// //     res.render("receipt", { sale });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).send("Server error");
// //   }
// // });

// // // --- 4. THE MONTHLY REPORT ROUTE ---
// // router.get("/reports", async (req, res) => {
// //   try {
// //     // 1. Set up the start and end dates for the current month (May 2026)
// //     const year = parseInt(req.query.year) || new Date().getFullYear();
// //     const month = parseInt(req.query.month) || (new Date().getMonth() + 1);

// //     const startDate = new Date(year, month - 1, 1);
// //     const endDate = new Date(year, month, 0, 23, 59, 59);

// //     // 2. Fetch all Sales and Stock records for this month from MongoDB
// //     const sales = await Sale.find({ date: { $gte: startDate, $lte: endDate } });
// //     const stockPurchases = await Stock.find({ date: { $gte: startDate, $lte: endDate } });

// //     // 3. Variables to hold  calculations
// //     let totalCashSales = 0;
// //     let totalCustomerCredit = 0;
// //     let totalTransportExpenses = 0;
// //     let totalSupplierCredit = 0;
// //     let totalStockCost = 0;

// //     // 4. Loop through Sales to calculate Revenue, Credit, and Transport
// //     sales.forEach(sale => {
// //       // Check payment method based on your project requirements
// //       if (sale.paymentMethod === "Credit" || sale.isSalaryScheme) {
// //         totalCustomerCredit += sale.totalCharge || 0;
// //       } else {
// //         totalCashSales += sale.totalCharge || 0;
// //       }

// //       // Track transport collections / costs
// //       if (sale.transportCharge) {
// //         totalTransportExpenses += parseFloat(sale.transportCharge);
// //       }
// //     });

// //     // 5. Loop through Stock to calculate Supplier Credit and Costs
// //     stockPurchases.forEach(item => {
// //       totalStockCost += (item.quantity * item.unitCost) || 0;
// //       if (item.supplierCreditOwed) {
// //         totalSupplierCredit += item.supplierCreditOwed;
// //       }
// //     });

// //     // 6. Final Dashboard Calculations
// //     const totalRevenue = totalCashSales + totalCustomerCredit;
// //     const netCashFlow = totalCashSales - totalTransportExpenses;

// //     // 7. RENDER your reports
// //     res.render("reports", {
// //       reportTitle: `${startDate.toLocaleString('default', { month: 'long' }).toUpperCase()} ${year}`,
// //       totalRevenue,
// //       totalExpenses: totalStockCost + totalTransportExpenses,
// //       netCashFlow,
// //       totalSupplierCredit,
// //       dbSales: sales,
// //       stockItems: stockPurchases
// //     });

// //   } catch (error) {
// //     console.error("Error generating report:", error);
// //     res.status(500).send("Unable to load report statistics.");
// //   }
// // });

// // module.exports = router;
// const express = require("express");
// const router = express.Router();

// const Sale = require("../models/Sale");
// const Stock = require("../models/Stock");


// // ===============================
// // 1. GET SALES FORM
// // ===============================
// router.get("/salesform", async (req, res) => {
//   try {
//     const items = await Stock.find();

//     res.render("salesform", {
//       stockItems: items
//     });

//   } catch (error) {
//     console.error("Error loading sales form:", error);
//     res.status(500).send("Unable to load sales form");
//   }
// });


// // ===============================
// // 2. POST SALES FORM (CLEAN LOGIC)
// // ===============================
// router.post("/salesform", async (req, res) => {
//   try {
//     let {
//       itemId,
//       customerName,
//       customerAddress,
//       customerDistance,
//       phoneNumber,
//       quantity,
//       unitPrice,
//       paymentMethod
//     } = req.body;

//     // ===============================
//     // SAFE NUMBER CONVERSION
//     // ===============================
//     const qty = Number(quantity) || 0;
//     const price = Number(unitPrice) || 0;
//     const distance = Number(customerDistance) || 0;

//     // ===============================
//     // FIND STOCK ITEM
//     // ===============================
//     const item = await Stock.findById(itemId);

//     if (!item) {
//       return res.status(404).send("Item not found");
//     }

//     // ===============================
//     // STOCK CHECK
//     // ===============================
//     if (item.quantity < qty) {
//       const items = await Stock.find();
//       return res.render("salesform", {
//         stockItems: items,
//         error: "Not enough stock available"
//       });
//     }

//     // reduce stock
//     item.quantity -= qty;
//     await item.save();

//     // ===============================
//     // TOTAL BEFORE TRANSPORT
//     // ===============================
//     const subtotal = qty * price;

//     // ===============================
//     // TRANSPORT RULES
//     // ===============================
//     let transportCharge = 0;

//     if (subtotal >= 500000) {
//       transportCharge = 0;
//     } else if (distance > 10) {
//       transportCharge = 30000;
//     }

//     // ===============================
//     // FINAL TOTAL
//     // ===============================
//     const totalCharge = subtotal + transportCharge;

//     // ===============================
//     // SAVE SALE
//     // ===============================
//     const newSale = new Sale({
//       itemId: item._id,
//       itemName: item.itemName,
//       customerName,
//       customerAddress,
//       customerDistance: distance,
//       phoneNumber,
//       quantity: qty,
//       unitPrice: price,
//       paymentMethod,
//       transportCharge,
//       totalCharge
//     });

//     await newSale.save();

//     res.redirect(`/receipt/${newSale._id}`);

//   } catch (error) {
//     console.error("Error saving sale:", error);
//     res.status(500).send("Error saving sale");
//   }
// });


// // ===============================
// // 3. SALES DASHBOARD
// // ===============================
// router.get("/salesdashboard", async (req, res) => {
//   try {
//     const sales = await Sale.find().sort({ date: -1 });

//     const startOfToday = new Date();
//     startOfToday.setHours(0, 0, 0, 0);

//     const todayTotal = sales
//       .filter(s => new Date(s.date) >= startOfToday)
//       .reduce((sum, s) => sum + (s.totalCharge || 0), 0);

//     res.render("salesdashboard", {
//       dbSales: sales,
//       todayTotal
//     });

//   } catch (error) {
//     console.error("Dashboard error:", error);
//     res.status(500).send("Unable to load dashboard");
//   }
// });


// // ===============================
// // 4. EDIT SALE (GET)
// // ===============================
// router.get("/sale/edit/:id", async (req, res) => {
//   try {
//     const sale = await Sale.findById(req.params.id);
//     const items = await Stock.find();

//     if (!sale) return res.status(404).send("Sale not found");

//     res.render("sales-edit", {
//       sale,
//       stockItems: items
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Server error");
//   }
// });


// // ===============================
// // 5. EDIT SALE (POST)
// // ===============================
// router.post("/sale/edit/:id", async (req, res) => {
//   try {
//     let { quantity, unitPrice, transportCharge } = req.body;

//     const qty = Number(quantity) || 0;
//     const price = Number(unitPrice) || 0;
//     const transport = Number(transportCharge) || 0;

//     const totalCharge = (qty * price) + transport;

//     req.body.totalCharge = totalCharge;

//     await Sale.findByIdAndUpdate(req.params.id, req.body);

//     res.redirect("/salesdashboard");

//   } catch (error) {
//     console.error("Update error:", error);
//     res.status(500).send("Error updating sale");
//   }
// });


// // ===============================
// // 6. DELETE SALE
// // ===============================
// router.post("/sale/delete/:id", async (req, res) => {
//   try {
//     await Sale.findByIdAndDelete(req.params.id);
//     res.redirect("/salesdashboard");

//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Failed to delete sale");
//   }
// });


// // ===============================
// // 7. RECEIPT
// // ===============================
// router.get("/receipt/:id", async (req, res) => {
//   try {
//     const sale = await Sale.findById(req.params.id);

//     if (!sale) return res.status(404).send("Sale not found");

//     res.render("receipt", { sale });

//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Server error");
//   }
// });

// module.exports = router;
const express = require("express");
const router = express.Router();

const Sale = require("../models/Sale");
const Stock = require("../models/Stock");
const { isAdmin, isSalesAttendant } = require("../middleware/auth");

// 1. GET SALES FORM

router.get("/salesform", isSalesAttendant, async (req, res) => {
  try {
    const items = await Stock.find();

    res.render("salesform", {
      stockItems: items
    });

  } catch (error) {
    console.error("Error loading sales form:", error);
    res.status(500).send("Unable to load sales form");
  }
});



// 2. POST SALES FORM (MAIN LOGIC)

router.post("/salesform", isSalesAttendant, async (req, res) => {
  try {
    const {
      customerName,
      customerAddress,
      customerDistance,
      phoneNumber,
      paymentMethod,
      transportType
    } = req.body;

    const distance = Number(customerDistance) || 0;

    // Support both single-item form (itemId, quantity) and multi-item `items[...]`
    let rawItems = req.body.items;
    if (!rawItems && req.body.itemId) {
      rawItems = { '0': { itemId: req.body.itemId, quantity: req.body.quantity } };
    }

    const itemsArray = [];
    if (rawItems) {
      if (Array.isArray(rawItems)) {
        rawItems.forEach(it => itemsArray.push(it));
      } else {
        Object.keys(rawItems).forEach(k => itemsArray.push(rawItems[k]));
      }
    }

    if (itemsArray.length === 0) {
      const allItems = await Stock.find();
      return res.render('salesform', { stockItems: allItems, error: 'No items selected' });
    }

    // Validate stock and compute totals
    const saleItems = [];
    let subtotal = 0;

    for (const raw of itemsArray) {
      const iid = raw.itemId || raw.itemId === 0 ? raw.itemId : null;
      const qty = Number(raw.quantity) || 0;

      const stockItem = await Stock.findById(iid);
      if (!stockItem) {
        const allItems = await Stock.find();
        return res.render('salesform', { stockItems: allItems, error: `Item not found` });
      }

      const available = Number(stockItem.quantity) || 0;
      if (available < qty) {
        const allItems = await Stock.find();
        return res.render('salesform', { stockItems: allItems, error: `Not enough stock available for ${stockItem.itemName}` });
      }

      const sellingPrice = Number(stockItem.sellingPrice) || 0;
      const lineTotal = qty * sellingPrice;

      saleItems.push({
        itemId: stockItem._id,
        itemName: stockItem.itemName,
        quantity: qty,
        unitPrice: sellingPrice,
        subTotal: lineTotal
      });

      // reduce stock without re-validating the entire Stock document
      await Stock.findByIdAndUpdate(stockItem._id, { $inc: { quantity: -qty } });

      subtotal += lineTotal;
    }

    // Calculate transport charge based on selected transport type
    let transportCharge = 0;
    let transportChargeType = 'Own Transport';

    if (transportType === 'own') {
      transportCharge = 0;
      transportChargeType = 'Own Transport';
    } else if (transportType === 'hardware') {
      if (subtotal >= 500000) {
        transportCharge = 0;
        transportChargeType = 'Hardware Provided (Free - Eligible)';
      } else {
        const allItems = await Stock.find();
        return res.render('salesform', {
          stockItems: allItems,
          error: `You do not qualify for free hardware transport. Purchase must be ≥ 500,000 UGX. Current: ${subtotal.toLocaleString()} UGX`
        });
      }
    } else if (transportType === 'paid') {
      transportCharge = 30000;
      transportChargeType = 'Hardware Transport (Paid)';
    } else {
      const allItems = await Stock.find();
      return res.render('salesform', {
        stockItems: allItems,
        error: 'Please select a valid transport option'
      });
    }

    const totalCharge = subtotal + transportCharge;

    const newSale = new Sale({
      customerName,
      customerAddress,
      customerDistance: distance,
      phoneNumber,
      paymentMethod,
      transportCharge,
      transportChargeType,
      totalCharge,
      attendant: req.user ? req.user._id : null,
      items: saleItems
    });

    await newSale.save();
    res.redirect(`/receipt/${newSale._id}`);

  } catch (error) {
    console.error("Error saving sale:", error);
    res.status(500).send("Error saving sale");
  }
});



// 3. SALES DASHBOARD
router.get("/salesdashboard", async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("attendant")
      .sort({ date: -1 });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayTotal = sales
      .filter(s => new Date(s.date) >= startOfToday)
      .reduce((sum, s) => sum + (s.totalCharge || 0), 0);

    res.render("salesdashboard", {
      dbSales: sales,
      todayTotal
    });

  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).send("Unable to load dashboard");
  }
});

// 4. EDIT SALE (GET)

router.get("/sale/edit/:id", isAdmin ,async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    const items = await Stock.find();

    if (!sale) {
      return res.status(404).send("Sale not found");
    }

    res.render("sales-edit", {
      sale,
      stockItems: items
    });

  } catch (error) {
    console.error("Edit error:", error);
    res.status(500).send("Server error");
  }
});


// 5. EDIT SALE (POST)
router.post("/sale/edit/:id", isAdmin, async (req, res) => {
  try {
    const {
      quantity,
      unitPrice,
      transportCharge,
      customerName,
      customerAddress,
      customerDistance,
      phoneNumber,
      paymentMethod
    } = req.body;

    const qty = Number(quantity) || 0;
    const price = Number(unitPrice) || 0;
    const transport = Number(transportCharge) || 0;
    const distance = Number(customerDistance) || 0;

    const totalCharge = (qty * price) + transport;

    const updateData = {
      customerName,
      customerAddress,
      customerDistance: distance,
      phoneNumber,
      paymentMethod,
      transportCharge: transport,
      totalCharge,
      'items.0.quantity': qty,
      'items.0.unitPrice': price,
      'items.0.subTotal': qty * price
    };

    await Sale.findByIdAndUpdate(req.params.id, updateData);

    res.redirect("/salesdashboard");

  } catch (error) {
    console.error("Update error:", error);
    res.status(500).send("Error updating sale");
  }
});


// 6. DELETE SALE
router.post("/sale/delete/:id", isAdmin, async (req, res) => {
  try {
    await Sale.findByIdAndDelete(req.params.id);
    res.redirect("/salesdashboard");

  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).send("Failed to delete sale");
  }
});


// 7. RECEIPT
router.get("/receipt/:id", async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).send("Sale not found");
    }

    res.render("receipt", { sale });

  } catch (error) {
    console.error("Receipt error:", error);
    res.status(500).send("Server error");
  }
});

module.exports = router;