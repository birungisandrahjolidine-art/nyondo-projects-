
// module.exports = router;
const express = require("express");
const router = express.Router();
const passport = require("passport");
const multer = require('multer');
const Registration = require("../models/Registration");
const Sale = require("../models/Sale");
const Stock = require("../models/Stock");

const { isAdmin, isStoreManager } = require("../middleware/auth");
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
router.get("/stockregform", isStoreManager, (req, res) => res.render("stockregform"));
router.get("/transport", (req, res) => res.render("transport"));
router.get("/creditreceipt", (req, res) => res.render("creditreceipt"));
router.get('/logout', (req, res) => res.render('logout'));
router.get('/creditform', isAdmin, (req, res) => res.render('creditform'));
router.get("/resetp", isAdmin, (req, res) => res.render("resetp"));
router.get("/resetp", isAdmin, (req, res) => res.render("resetp"));
router.get("/success", (req, res) => res.render("success"));
router.get("/reports", async (req, res) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const month = parseInt(req.query.month, 10) || (new Date().getMonth() + 1);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const sales = await Sale.find({ date: { $gte: startDate, $lte: endDate } });
    const stockPurchases = await Stock.find({ date: { $gte: startDate, $lte: endDate } });

    let totalCashSales = 0;
    let totalCustomerCredit = 0;
    let totalTransportExpenses = 0;
    let totalSupplierCredit = 0;
    let totalStockCost = 0;

    sales.forEach((sale) => {
      const charge = Number(sale.totalCharge) || 0;
      if (sale.paymentMethod === "Credit" || sale.isSalaryScheme) {
        totalCustomerCredit += charge;
      } else {
        totalCashSales += charge;
      }
      totalTransportExpenses += Number(sale.transportCharge) || 0;
    });

    stockPurchases.forEach((item) => {
      const qty = Number(item.quantity) || 0;
      const unitCost = Number(item.unitPrice || item.unitCost) || 0;
      totalStockCost += qty * unitCost;
      totalSupplierCredit += Number(item.supplierCreditOwed) || 0;
    });

    const totalRevenue = totalCashSales + totalCustomerCredit;
    const totalExpenses = totalStockCost + totalTransportExpenses;
    const netCashFlow = totalCashSales - totalTransportExpenses;
    const reportTitle = `${startDate.toLocaleString("default", { month: "long" }).toUpperCase()} ${year}`;

    res.render("reports", {
      reportTitle,
      totalRevenue,
      totalExpenses,
      netCashFlow,
      totalSupplierCredit,
      dbSales: sales,
      stockItems: stockPurchases,
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).send("Unable to load report statistics.");
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

router.post('/stockregform', isStoreManager, upload.single('itemimage'), async (req, res) => {
  try {
    const { itemName, quantity, unitPrice, sellingPrice, supplierName, date, supplierPhone, factory, paymentStatus } = req.body;

    const newStock = new Stock({
      itemName: itemName.trim(), // Trimming prevent grouping issues from trailing spaces
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

router.get("/stockdashboard", async (req, res) => {
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
// OPEN EDIT PAGE
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
module.exports = router;