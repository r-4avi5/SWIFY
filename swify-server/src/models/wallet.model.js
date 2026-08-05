import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
    {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    balance: {
        type: Number,
        default: 0,
    },
    currency: {
        type: String,
        default: "INR",
    },
    status: {
        type: String,
        enum: ["active", "blocked", "suspended"],
        default: "active"
    },
    dailyTransactionLimit: {
        type: Number,
        default: 100000,
    },
    dailyTransferredAmount: {
        type: Number,
        default: 0,
    },
    isFrozen: {
        type: Boolean,
        default: false,
    },
    lastTransactionAt: {
        type: Date,
        default: null,
    },    
},
    { timestamps: true,}

);

const Wallet = mongoose.model("Wallet", walletSchema);

export default Wallet;
