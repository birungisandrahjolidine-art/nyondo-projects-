const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose').default ||require('passport-local-mongoose');


const registrationSchema = new mongoose.Schema({
  fullname: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    unique:true,
    required: true
  },
  role: {
    type: String,
    trim: true,
    required:true,
    enum: ['Admin','Sales attendant','Store Manager']
  },
  address :{
    type: String,
    trim: true,
    required:true,
  },
  phoneNumber:{
    type: String,
    trim: true,
  },
Nin : {
    type: String,
    trim: true,
    required: true,
},
});
registrationSchema.plugin(passportLocalMongoose,{
  usernameField:'email'
})
module.exports = mongoose.model('Registration', registrationSchema);


