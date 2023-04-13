const mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please provide a name"],
    maxlength: 50,
    minlength: 3,
  },
  email: {
    type: String,
    unique: true,
    required: [true, "please provide an email address"],
    validate: {
      message: "please provide valid email",
      validator: validator.isEmail,
    },
  },
  password: {
    type: String,
    required: [true, "please provide a password"],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
});

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcryptjs.genSalt(10);
  const hash = await bcryptjs.hash(this.password, salt);
  this.password = hash;
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcryptjs.compare(candidatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model("User", UserSchema);
