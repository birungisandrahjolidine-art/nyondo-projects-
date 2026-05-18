
// module.exports = router;
const express = require("express");
const router = express.Router();
const passport = require("passport");
const multer = require('multer');
const Registration = require("../models/Registration");
const Sale = require("../models/Sale");
const Stock = require("../models/Stock");


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

router.get("/index", (req, res) => res.render("index"));
router.get("/login", (req, res) => res.render("login"));
router.get("/signin", (req, res) => res.render("signin"));
router.get("/stockregform", (req, res) => res.render("stockregform"));
router.get("/transport", (req, res) => res.render("transport"));
router.get("/creditreceipt", (req, res) => res.render("creditreceipt"));
router.get('/logout', (req, res) => res.render('logout'));
router.get('/creditform', (req, res) => res.render('creditform'));
// router.get("/reports", (req, res) => res.render("reports"));
router.get("/resetp", (req, res) => res.render("resetp"));
router.get("/sales-edit", (req, res) => res.render("sales-edit"));
router.get("/credit", (req, res) => res.render("credit"));

// AUTHENTICATION ROUTES (SIGNIN & LOGIN)

router.post("/signin", async (req, res) => {
  try {
    console.log("Data received in terminal:", req.body);
    const { fullname, email, role, password, phoneNumber, address, Nin } = req.body;

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
    res.redirect("/login");
  } catch (error) {
    console.error("DATABASE ERROR:", error);
    res.render("signin", { error: "Registration failed. Try again." });
  }
});

router.post("/login", passport.authenticate("local", { failureRedirect: "/login" }), (req, res) => {
  if (req.user.role === "admin") return res.redirect("/admindashboard");
  if (req.user.role === "salesattendant") return res.redirect("/salesdashboard");
  if (req.user.role === "StockManager") return res.redirect("/stockdashboard");
  res.redirect("/login");
});

// STOCK REGISTRATION (POST)

router.post('/stockregform', upload.single('itemimage'), async (req, res) => {
  try {
    const { itemName, quantity, unitPrice, sellingPrice, supplierName, date, supplierPhone, factory, paymentStatus } = req.body;

    const newStock = new Stock({
      itemName: itemName.trim(), // Trimming prevents grouping issues from trailing spaces
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

// 2. ADMIN DASHBOARD: Combines quantities for clear management summaries
router.get("/admindashboard", async (req, res) => {
  try {
    const aggregatedStock = await Stock.aggregate([
      {
        $group: {
          _id: "$itemName",
          totalQuantity: { $sum: "$quantity" },
          sellingPrice: { $first: "$sellingPrice" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const rawStock = await Stock.find();
    const totalInvestment = rawStock.reduce((acc, item) => acc + ((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)), 0);

    res.render("admindashboard", { dbStock: aggregatedStock, totalInvestment });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);
    res.status(500).send("Unable to load Admin Dashboard");
  }
});
// 1. STOCK DASHBOARD / LOG: Every entry remains separate chronologically
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
// SALES EDIT & DELETE ROUTES
router.get("/sale/edit/:id", async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).send("Sale not found");
    res.render("sales-edit", { sale });
  } catch (error) {
    console.error("Error loading edit page:", error);
    res.status(500).send("Error loading edit page");
  }
});
router.post("/sale/edit/:id", async (req, res) => {
  try {
    await Sale.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/salesdashboard");
  } catch (error) {
    console.error("Error updating sale:", error);
    res.status(500).send("Error updating sale");
  }
});
router.post("/sale/delete/:id", async (req, res) => {
  try {
    await Sale.findByIdAndDelete(req.params.id);
    res.redirect("/salesdashboard");
  } catch (error) {
    console.error("Error deleting sale:", error);
    res.status(500).send("Failed to delete sale");
  }
});
module.exports = router;