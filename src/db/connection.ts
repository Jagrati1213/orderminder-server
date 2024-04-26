import mongoose from "mongoose";
import { DB_NAME } from "../constants";

export async function ConnectionWithMongoDb() {
  try {
    const connection = await mongoose.connect(
      `${process.env.MONOGODB_URL}/${DB_NAME}`
    );
    console.log("Mongoose connected!!");
  } catch (error) {
    console.log("Mongoose Connection Error", error);
    process.exit(1);
  }
}