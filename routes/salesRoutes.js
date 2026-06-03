
const express = require("express");
const router = express.Router();

const Sale = require("../models/Sale");
const Stock = require("../models/Stock");
const { isAdmin, isSalesAttendant ,authorizeRoles} = require("../middleware/auth");

// 1. GET SALES FORM

router.get("/salesform", authorizeRoles("Sales_attendant", "Admin"), async (req, res) => {
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



// 2. POST SALES FORM (with transport rules and multi-item support)

router.post("/salesform", authorizeRoles("Sales_attendant", "Admin"), async (req, res) => {
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