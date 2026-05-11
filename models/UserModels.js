import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: { type: String, unique: true },
  password: String,
  address: String,
  status: {
    type: String,
    default: "Active"
  },
  serviceCategory: {
    type: String,
    default: "Home Cleaning"
  },
  role: {
    type: String,
    default: "user"
  }
});

const User = mongoose.model("User", userSchema);

export default User;