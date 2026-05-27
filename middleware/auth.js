// Checks if a user is logged in
const isAuthenticated = (req,res,next) =>{
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login')
}
// checks if a logged in user is Admin
const isAdmin = (req,res,next) =>{
    if(req.isAuthenticated() &&req.user.role ==="Admin"){
        return next();
    }
    res.status(403).send('Access denied:you are not a Admin')
}
//  checs if is store manager
const isStoreManager = (req,res,next) =>{
    if(req.isAuthenticated() &&req.user.role ==="Store_Manager"){
        return next();
    }
    res.status(403).send('Access denied:you are not a store manager')
}

// checks if is salesattendant
const isSalesAttendant = (req,res,next) =>{
    if(req.isAuthenticated() &&req.user.role ==="Sales_attendant"){
        return next();
    }
    res.status(403).send('Access denied:you are not a Sales Attendant')
}
// allows access to multiple roles
const authorizeRoles = (...roles) => {

    return (req, res, next) => {

        if (!req.isAuthenticated()) {
            return res.redirect('/login');
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).send('Access denied');
        }

        next();
    };
};
module.exports = { isAuthenticated, isAdmin, isSalesAttendant, isStoreManager, authorizeRoles}