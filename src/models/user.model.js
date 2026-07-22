import mongoose from "mongoose";
import { timeStamp } from "node:console";

const userSchema = new mongoose.Schema(
  {
    fullName: { 
        type: String, 
        required: true,
        trim: true,
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
        password: { 
        type: String, 
        required: true,
        minlength: 6,
        specialChars: true,
    },

        swifyId: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
    },

        avatar: {
        type: String,
        default: "",
  },
       KycStatus: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
    },
  },

      { timeStamps : true,}
);

    const User = mongoose.model("User", userSchema);

    export default User;