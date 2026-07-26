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
        payAddress: {
        type: String,
        unique: true,
        sparse: true,
        default: null,
        lowercase: true,
        trim: true,
    },
        qrCodeImage: {
        type: String,
        default: null,
    },
        displayName:{
            type: String,
            required: true,
            trim: true,
            maxlength: true,
        },
        avatar: {
        type: String,
        default: "",
  },
  },

      { timestamps : true,}
);

    const User = mongoose.model("User", userSchema);

    export default User;