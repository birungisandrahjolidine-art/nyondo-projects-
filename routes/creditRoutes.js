const express = require("express");
const router = express.Router();
const Credit = require("../models/Credit");
const { isAdmin } = require("../middleware/auth");


// Get route for credit form
router.get("/creditform", isAdmin,(req, res) => {
  res.render("creditform");
});
router.post("/creditform", isAdmin,async (req, res) => {
  try {

    const quantity = Number(req.body.quantity || 0);
    const unitPrice = Number(req.body.unitPrice || 0);
    const amountDeposited = Number(req.body.amountDeposited || 0);

    const totalCost = quantity * unitPrice;
    const balance = totalCost - amountDeposited;

    const credit = new Credit({
      customerName: req.body.customerName,
      phone: req.body.phone,
      Nin:req.body.Nin,
      itemName: req.body.itemName,
      quantity,
      unitPrice,
      totalCost,
      amountDeposited,
      balance,
      date: req.body.date
    });

    await credit.save();

    res.redirect("/credit");

  } catch (error) {
    console.log(error);
    res.send("Error saving credit");
  }
});

// get route for credit page
router.get("/credit", async (req, res) => {
  try {
    const credits = await Credit.find() || [];
    // adding the new item on credit to the existing one 
    const itemsMap = {};

credits.forEach(credit => {

  if (itemsMap[credit.itemName]) {

    itemsMap[credit.itemName] += Number(credit.quantity);

  } else {

    itemsMap[credit.itemName] = Number(credit.quantity);

  }

});

const itemsUnderCredit = Object.entries(itemsMap).map(([itemName, quantity]) => ({
  itemName,
  quantity
}));
// amount of number under credit
    const totalCredit = credits.reduce((sum, c) =>
      sum + (Number(c.totalCost) || 0), 0);
//  total payment
    const totalPaid = credits.reduce((sum, c) =>
      sum + (Number(c.amountDeposited) || 0), 0);

    const peopleWithCredit = new Set(credits.map(c => c.customerName)).size;

    res.render("credit", {
      credits,
      totalCredit,
       itemsUnderCredit,
      totalPaid,
      peopleWithCredit
    });

  } catch (error) {
    console.log(error);

    res.render("credit", {
      credits: [],
      totalCredit: 0,
      totalPaid: 0,
      peopleWithCredit: 0
    });
  }
});
//  generating the receipt for the credit
router.get("/creditreceipt/:id", async (req, res) => {
  try {
    const credit = await Credit.findById(req.params.id);

    if (!credit) {
      return res.status(404).send("Credit not found");
    }

    res.render("creditreceipt",{credit});

  } catch (error) {
    console.log(error);
    res.status(500).send("Error loading receipt");
  }
});
// get and post routes for the editcredit page
router.get('/creditedit/:id', isAdmin, async (req, res) => {

  try {

    const credit = await Credit.findById(req.params.id);

    res.render('creditedit', { credit });

  } catch (error) {

    console.log(error);

    res.send('Error loading edit page');
  }

});
router.post('/creditedit/:id', isAdmin, async (req, res) => {

  try {

    const { date, amountDeposited } = req.body;

    const credit = await Credit.findById(req.params.id);

    // Update deposited amount
    credit.amountDeposited += Number(amountDeposited);

    // Update balance
    credit.balance = credit.totalCost - credit.amountDeposited;

    // Update date
    credit.date = date;

    await credit.save();

    res.redirect('/credit');

  } catch (error) {

    console.log(error);

    res.send('Error updating credit');

  }

});
module.exports = router;