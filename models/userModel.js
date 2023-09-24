const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    require: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    unique: true,
    require: [true, 'Please provide your name!'],
    lowercase: true,
    validator: [validator.isEmail, 'please enter a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: { type: String, require: true, minlength: 8, select: false },
  passwordConfirm: {
    type: String,
    require: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        //validation only works on SAVE and CREATE
        return el === this.password;
      },
      message: 'passwords are not the same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  //only run this functoion if pasword was actually modified
  if (!this.isModified('password')) return next();
  //encrypting passwords before it saves[hash the password with cost of 12]
  this.password = await bcrypt.hash(this.password, 12);
  //delete the passwordConfirm field
  this.passwordConfirm = undefined;
});

userSchema.pre('save', async function (next) {
  //this.isNew  >> is property to check if the document is newly created
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

//instance method : is method that is gonna be availble in all the documents of a certain collection
userSchema.methods.correctPassword = async function (
  inputPassword,
  hashedPassword
) {
  return await bcrypt.compare(inputPassword, hashedPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const passwordChangedAtTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < passwordChangedAtTimestamp;
  }

  // return await bcrypt.compare(this.passwordChangedAt);
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  //this token we're gonna send to the user so to use it for resting the pass
  //[1]modifie the document with hashed verstion of that token which is sent to the user via email when he sends it back to api by resetpassword URL
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log('USER-MODEL', { resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
