import mongoose, { Schema, Types } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { venderT } from "../types";

// CREATE USER SCHEMA
const venderSchema = new Schema<venderT>(
  {
    username: {
      type: String,
      require: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    restaurant: {
      type: String,
      require: true,
    },
    isOpen: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    menuItems: [
      {
        type: Schema.Types.ObjectId,
        ref: "MenuList",
      },
    ],
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// CREATE HASH PASSWORD BEFORE SAVING
venderSchema.pre("save", async function (next) {
  if (this.password && this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } else {
    next();
  }
});

// COMPARE PASSWORD WITH BCRYPT
venderSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password); // return boolean
};

// CREATE ACCESS TOKEN
venderSchema.methods.generateAccessToken = function () {
  if (!process.env.ACCESS_TOKEN_KEY) return;
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_KEY,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// CREATE REFRESH TOKEN
venderSchema.methods.generateRefreshToken = function () {
  if (!process.env.REFRESH_TOKEN_KEY) return;
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_KEY,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

// CREATE USER COLLECTION IN DB
export const venderCollection = mongoose.model<venderT>("Vender", venderSchema);