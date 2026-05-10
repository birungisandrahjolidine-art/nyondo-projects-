const express = require("express");
const router = express.Router();
const passport = require("passport");
const multer = require('multer');
const Registration = require("../models/Registration");
const Sale = require("../models/Sales");
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
router.get("/salesdashboard", (req, res) => res.render("salesdashboard"));
router.get("/receipt", (req, res) => res.render("receipt"));
router.get("/transport", (req, res) => res.render("transport"));
router.get("/credit", (req, res) => res.render("credit"));
router.get('/logout', (req, res) => { res.render('logout')});
router.get('/creditform', (req, res) => { res.render('creditform')});
router.get("/stock", (req, res) => res.render("stock"));
router.get("/salesform", (req, res) => res.render("salesform"));
    
// THE CORRECT SIGNIN ROUTE (Replacing both /signin and /sign)
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

// Dashboards and other routes
router.get("/admindashboard", (req, res) => res.render("admindashboard"));
router.get("/salesdashboard", (req, res) => res.render("salesdashboard"));
// router.get("/stockdashboard", (req, res) => res.render("stockdashboard"));

// STOCK ROUTES
router.get('/stockregform', (req, res) => {
    res.render('stockregform');
});

router.post('/stockregform',upload.single('itemimage'), async (req, res) => {
    try {
       console.log("BODY:", req.body);
    console.log("FILE:", req.file);
        const { itemName, quantity, unitPrice, sellingPrice, supplierName, paymentStatus,date,supplierPhone, factory,
        } = req.body;

        const newStock = new Stock({
            itemName,
            quantity,
            unitPrice,
            sellingPrice,
            supplierName,
            date,
            paymentStatus,
            supplierPhone,
            factory,
            supplierPhone,
            //  itemimage: req.file.filename 
            itemimage: req.file ? req.file.filename : null

        });

        console.log("NEW STOCK:", newStock);

        await newStock.save();

        res.redirect('/stockdashboard');

    } catch (error) {
        console.error("Error saving stock:", error);
        res.status(500).send('Error saving stock');
    }
});
// Getting stock from the database
router.get("/stockdashboard", async (req, res) => {
  try {
    const dbStock = await Stock.find()
    .populate('itemName','itemName itemimage' )
    // .populate('attendant','fullname')
    .sort({date:-1})
    console.log(dbStock)
    res.render("stockdashboard",{dbStock});
  } catch (error) {
    console.error(error.message)
    res.status(400).send('Unable to pick sales from the db')
  }
  
});
//

  
module.exports = router;
