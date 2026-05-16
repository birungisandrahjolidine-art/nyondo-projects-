const express = require("express");
const router = express.Router();
const passport = require("passport");
const multer = require('multer');
const Registration = require("../models/Registration");
const Sale = require("../models/Sale");
const Stock = require("../models/Stock");

// multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });
// GET Routes for pages
router.get("/index", (req, res) => res.render("index"));
router.get("/login", (req, res) => res.render("login"));
router.get("/signin", (req, res) => res.render("signin"));
router.get("/stockregform", (req, res) => res.render("stockregform"));
// router.get("/salesdashboard", (req, res) => res.render("salesdashboard"));
// router.get("/receipt", (req, res) => res.render("receipt"));
router.get("/transport", (req, res) => res.render("transport"));
router.get("/creditreceipt", (req, res) => res.render("creditreceipt"));
router.get('/logout', (req, res) => { res.render('logout')});
router.get('/creditform', (req, res) => { res.render('creditform')});
router.get("/admindashboard", (req, res) => res.render("admindashboard"));
router.get("/reports", (req, res) => res.render("reports"));
router.get("/resetp", (req, res) => res.render("resetp"));
router.get("/sales-edit", (req, res) => res.render("sales-edit"));
    
//  SIGNIN ROUTE 

router.post("/signin", async (req, res) => {
  try {
    console.log("Data received in terminal:", req.body);
    const { fullname, email, role, password, phoneNumber, address, Nin } = req.body;

    // Check if user exists
    const existingUser = await Registration.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.render("signin", { error: "Email already registered" });
    }

    // Create new user
    const newUser = new Registration({
      fullname,
      email: email.toLowerCase(),
      role,
      phoneNumber,
      address,
      Nin
    });

    // Save to Database
    await Registration.register(newUser, password);
    console.log("Successfully saved to Database!");
    
    res.redirect("/login");
  } catch (error) {
    console.error("DATABASE ERROR:", error);
    res.render("signin", { error: "Registration failed. Try again." });
  }
});

// LOGIN ROUTE
router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  (req, res) => {
    // Redirect based on role
    if (req.user.role === "admin") return res.redirect("/admindashboard");
    if (req.user.role === "salesattendant") return res.redirect("/salesdashboard");
    if (req.user.role === "StockManager") return res.redirect("/stockdashboard");
    res.redirect("/login");
  }
);

// STOCK ROUTES
router.get('/stockregform', (req, res) => {
    res.render('stockregform');
});


// Getting stock from the database
router.get("/stockdashboard", async (req, res) => {
  try {
    const dbStock = await Stock.find()
    .populate('itemName','itemName itemimage' )
    .sort({date:-1});
    const totalInvestment = dbStock.reduce((acc, item) =>{
      const itemTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
      return acc + itemTotal;
    }, 0);
    console.log("Calculated Grand Total:", totalInvestment);
    res.render("stockdashboard",{dbStock, totalInvestment});
  } catch (error) {
    console.error(error.message)
    res.status(400).send('Unable to pick sales from the db')
  }
  
});

// This renders the summary overview (cards + total investment)
router.get("/stockdashboard", async (req, res) => {
  try { 
    const dbStock = await Stock.find().sort({ date: -1 });

    // 2. Calculate investment for the dashboard cards
    const totalInvestment = dbStock.reduce((acc, item) => {
      const itemTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
      return acc + itemTotal;
    }, 0);

    // 3. Render 'stockdashboard.pug'
    res.render("stockdashboard", { 
       dbStocks: Stocks, 
        totalInvestment: totalInvestment 
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).send("Unable to load the Dashboard");
  }
});


  //  STOCK REGISTRATION ROUTE (Handles both new items and adding to existing stock)
router.post('/stockregform', upload.single('itemimage'), async (req, res) => {
    try {
        const { itemName, quantity, unitPrice, sellingPrice, supplierName, date, supplierPhone, factory, paymentStatus } = req.body;

        //     console.log(`Creating new inventory entry for: ${itemName}`);
            const newStock = new Stock({
                itemName,
                quantity: Number(quantity),
                unitPrice,
                sellingPrice,
                supplierName,
                date,
                paymentStatus,
                supplierPhone,
                factory,
                itemimage: req.file ? req.file.filename : null
            });
            await newStock.save();
        

        // Redirect to your stock dashboard to see the updated numbers
        res.redirect('/stockdashboard');

    } catch (error) {
        console.error("Error processing stock update:", error);
        res.status(500).send('Error updating stock inventory');
    }
});
// rendering to supplier page
router.get("/supplier", async (req, res) => {
  try {
    const dbStock = await Stock.find()
    .populate('itemName','itemName itemimage' )
    .sort({date:-1});
    const totalInvestment = dbStock.reduce((acc, item) =>{
      const itemTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
      return acc + itemTotal;
    }, 0);
    console.log("Calculated Grand Total:", totalInvestment);
    res.render("supplier",{dbStock, totalInvestment});
  } catch (error) {
    console.error(error.message)
    res.status(400).send('Unable to pick sales from the db')
  }
  
});
// stock page routes
router.get("/stock", async (req, res) => {
  try {
    const dbStock = await Stock.find()
    .populate('itemName','itemName itemimage' )
    .sort({date:-1});
    const totalInvestment = dbStock.reduce((acc, item) =>{
      const itemTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
      return acc + itemTotal;
    }, 0);
    console.log("Calculated Grand Total:", totalInvestment);
    res.render("stock",{dbStock, totalInvestment});
  } catch (error) {
    console.error(error.message)
    res.status(400).send('Unable to pick sales from the db')
  }
});
// editing sales routes
router.get("/sale/edit/:id", async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).send("Sale not found");
    }

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
// detete route
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
