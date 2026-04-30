const express = require('express');
const router = express.Router();

router.get('/index',(req,res)=>{
    res.render('index')
})
router.get('/login',(req,res)=>{
    res.render('login')
})
router.post('/login',(req,res) =>{
    console.log(req.body)
})

router.get('/signin',(req,res)=>{
    res.render('signin')
})
router.post('/signin',(req,res) =>{
    console.log(req.body)
})

router.get('/admindashboard',(req,res)=>{
    res.render('admindashboard')
})
router.get('/salesdashboard',(req,res)=>{
    res.render('salesdashboard')
})
router.get('/sales',(req,res)=>{
    res.render('sales')
})
router.get('/salesform',(req,res)=>{
    res.render('salesform')
})
router.post('/salesform',(req,res) =>{
    console.log(req.body)
})
router.get('/stock',(req,res)=>{
    res.render('stock')
})
router.get('/stockdashboard',(req,res)=>{
    res.render('stockdashboard')
})
router.get('/stockregform',(req,res)=>{
    res.render('stockregform')
})
router.post('/stockregform',(req,res) =>{
    console.log(req.body)
})
router.get('/credit',(req,res)=>{
    res.render('credit')
})
router.get('/supplier',(req,res)=>{
    res.render('supplier')
})
router.get('/transport',(req,res)=>{
    res.render('transport')
})
router.get('/logout',(req,res)=>{
    res.render('logout')
})
router.get('/creditform',(req,res)=>{
    res.render('creditform')
})
router.post('/creditform',(req,res) =>{
    console.log(req.body)
})









module.exports = router;