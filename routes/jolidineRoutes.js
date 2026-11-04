
// module.exports = router;
const express = require("express");
const router = express.Router();
const passport = require("passport");
const multer = require('multer');
const Registration = require("../models/Registration");
const Sale = require("../models/Sale");
const Stock = require("../models/Stock");
const Credit = require("../models/credit");

const { isAdmin, isStoreManager, authorizeRoles } = require("../middleware/auth");
// MULTER FILE UPLOAD SETUP

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });
// BASIC GET ROUTES

router.get("/", (req, res) => res.render("index"));
router.get("/login", (req, res) => res.render("login"));
router.get("/signin", (req, res) => res.render("signin"));
router.get("/stockregform", authorizeRoles("Admin", "Store_Manager"), (req, res) => res.render("stockregform"));
router.get("/transport", (req, res) => res.render("transport"));
router.get("/creditreceipt", (req, res) => res.render("creditreceipt"));
router.get('/logout', (req, res) => res.render('logout'));
router.get('/creditform', isAdmin, (req, res) => res.render('creditform'));
router.get("/resetp", isAdmin, (req, res) => res.render("resetp"));
router.get("/resetp", isAdmin, (req, res) => res.render("resetp"));
router.get("/success", (req, res) => res.render("success"));

router.get("/reports", async (req, res) => {
  try {
    const { range } = req.query;
    const now = new Date();

    let startDate;
    let endDate;

   
    // DATE FILTERS
    if (!range || range === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );
    }

    else if (range === "lastMonth") {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59,
        999
      );
    }

    else if (range === "week") {
      const day = now.getDay();

      startDate = new Date(now);
      startDate.setDate(now.getDate() - day);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    }

    else if (range === "lastWeek") {
      const day = now.getDay();

      startDate = new Date(now);
      startDate.setDate(now.getDate() - day - 7);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    }

    else if (range === "today") {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }
    // DATABASE FILTER

    const queryFilter = {
      date: {
        $gte: startDate,
        $lte: endDate
      }
    };
    // FETCH DATA

    const salesFiltered = await Sale.find(queryFilter);
    const stockFiltered = await Stock.find(queryFilter);
    const creditFiltered = await Credit.find(queryFilter);

    // CALCULATIONS
    let totalCashSales = 0;
    let totalCreditSales = 0;
    let totalTransportExpenses = 0;
    let totalStockCost = 0;
    let totalSupplierCredit = 0;

    // Sales
    salesFiltered.forEach((sale) => {
      totalCashSales += Number(sale.totalCharge) || 0;
      totalTransportExpenses += Number(sale.transportCharge) || 0;
    });

    // Credit sales
    creditFiltered.forEach((credit) => {
      totalCreditSales += Number(credit.totalCost) || 0;
    });

    // Stock purchases
    stockFiltered.forEach((item) => {
      const qty = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;

      totalStockCost += qty * unitPrice;

      if (item.paymentStatus === "Credit") {
        totalSupplierCredit += qty * unitPrice;
      }
    });

    const totalRevenue = totalCashSales + totalCreditSales;
    const totalExpenses = totalStockCost + totalTransportExpenses;
    const netCashFlow = totalCashSales - totalTransportExpenses;

    // REPORT TITLE
    const titleMap = {
      month: "THIS MONTH",
      lastMonth: "LAST MONTH",
      week: "THIS WEEK",
      lastWeek: "LAST WEEK",
      today: "TODAY"
    };

    const reportTitle = titleMap[range] || "THIS MONTH";

    // debugging logs

    console.log("Sales:", salesFiltered.length);
    console.log("Stock:", stockFiltered.length);
    console.log("Creditors:", creditFiltered.length);

    
    // RENDER PAGE
    res.render("reports", {
      reportTitle,
      totalRevenue,
      totalExpenses,
      netCashFlow,
      totalSupplierCredit,
      dbSales: salesFiltered,
      stockItems: stockFiltered,
      creditors: creditFiltered
    });

  } catch (error) {
    console.error("REPORT ERROR:", error);
    res.status(500).send(error.message);
  }
});
 
// AUTHENTICATION ROUTES (SIGNIN & LOGIN)
router.get("/admin/register", isAdmin, (req, res) => {
  res.render("signin");
});
router.post("/signin",async (req, res) => {
  try {
    console.log("Data received in terminal:", req.body);
    let { fullname, email, role, password, phoneNumber, address, Nin } = req.body;

    const roleMap = {
      Admin: "Admin",
      "Sales attendant": "Sales_attendant",
      Sales_attendant: "Sales_attendant",
      "Store Manager": "Store_Manager",
      Store_Manager: "Store_Manager"
    };
    role = roleMap[role] || role;

    const existingUser = await Registration.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.render("signin", { error: "Email already registered" });
    }

    const newUser = new Registration({
      fullname,
      email: email.toLowerCase(),
      role,
      phoneNumber,
      address,
      Nin
    });

    await Registration.register(newUser, password);
 
    return res.redirect("/success");

  } catch (error) {
    console.error("DATABASE ERROR:", error);
    return res.render("signin", {
      error: "Registration failed. Try again."
    });
  }
});

router.post("/login", passport.authenticate("local", { failureRedirect: "/login" }), (req, res) => {
  console.log("Logged in user role:", req.user.role); 
  
  if (req.user.role === "Admin") {
    return res.redirect("/admin");
  }
  if (req.user.role === "Sales_attendant") { 
    return res.redirect("/salesdashboard");
  }
  if (req.user.role === "Store_Manager") { 
    return res.redirect("/stockdashboard");
  }
  
  // Fallback if role somehow isn't handled
  res.redirect("/login");
});

// STOCK REGISTRATION (POST)

router.post('/stockregform', authorizeRoles("Admin", "Store_Manager"), upload.single('itemimage'), async (req, res) => {
  try {
    const { itemName, quantity, unitPrice, sellingPrice, supplierName, date, supplierPhone, factory, paymentStatus } = req.body;

    const newStock = new Stock({
      itemName: itemName.trim(), 
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      sellingPrice: Number(sellingPrice),
      supplierName,
      date,
      paymentStatus,
      supplierPhone,
      factory,
      itemimage: req.file ? req.file.filename : null
    });

    await newStock.save();
    res.redirect('/stockdashboard');
  } catch (error) {
    console.error("Error processing stock update:", error);
    res.status(500).send('Error updating stock inventory');
  }
});
// 1. STOCK PAGE: Combines matching items and adds quantities together
router.get("/stock", async (req, res) => {
  try {
    const aggregatedStock = await Stock.aggregate([
      {
        $group: {
          _id: "$itemName", 
          totalQuantity: { $sum: "$quantity" },
          unitPrice: { $first: "$unitPrice" }, 
          sellingPrice: { $first: "$sellingPrice" },
          itemimage: { $first: "$itemimage" },
          supplierName: { $first: "$supplierName" },
        },
      },
      { $sort: { _id: 1 } }
    ]);

    const rawStock = await Stock.find();
    const totalInvestment = rawStock.reduce((acc, item) => acc + ((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)), 0);

    res.render("stock", { dbStock: aggregatedStock, totalInvestment });
  } catch (error) {
    console.error(error.message);
    res.status(400).send('Unable to pick stock data');
  }
});

router.get("/stockdashboard", authorizeRoles("Admin", "Store_Manager"), async (req, res) => {
  try {
    const dbStock = await Stock.find().sort({ date: -1 });
    
    const totalInvestment = dbStock.reduce((acc, item) => acc + ((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)), 0);

    res.render("stockdashboard", { dbStock, totalInvestment });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).send("Unable to load the Dashboard");
  }
});
// 2. SUPPLIER PAGE: Kept separate to verify individual batches received
router.get("/supplier", async (req, res) => {
  try {
    const dbStock = await Stock.find().sort({ date: -1 });
    
    const totalInvestment = dbStock.reduce((acc, item) => acc + ((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)), 0);

    res.render("supplier", { dbStock, totalInvestment });
  } catch (error) {
    console.error(error.message);
    res.status(400).send('Unable to pick supplier info');
  }
});
// edit supplier page
router.get("/editsupplier/:id", async (req, res) => {

  try {

    const supplier = await Stock.findById(req.params.id);

    console.log(supplier);

    if (!supplier) {
      return res.redirect("/supplier");
    }

    res.render("editsupplier", { supplier });

  } catch (error) {
    console.log(error);
    return res.redirect("/supplier");
  }

});


// UPDATE SUPPLIER
router.post("/editsupplier/:id", async (req, res) => {

  try {

    await Stock.findByIdAndUpdate(req.params.id, {
      paymentStatus: req.body.paymentStatus,
      date: req.body.date
    });

    res.redirect("/supplier");

  } catch (error) {
    console.log(error);
    return res.redirect("/supplier");
  }

});
// report routees

module.exports = router;