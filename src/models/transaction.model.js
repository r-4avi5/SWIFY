import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
    {
        reference: {
            type: String,
            unique: true,
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        senderSnapshot: {
            fullname: String,
            swifyId: String,
            payAddress: String,
        },
        receiverSnapshot: {
            fullname: String,
            swifyId: String,
            payAddress: String,
        },
        amount: {
            type: Number,
            required: true,
            min: 1,
        },
        paymentMethod: {
            type: String,
            enum: ["payAddress", "upi", "card", "netbanking"],
            required: true,
        },
        type: {
            type: String,
            enum: ["credit", "debit", "transfer","cashback","refund"],
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "success", "failed"],
            default: "pending",
        },
        note: {
            type: String,
            default: "",
            maxlength: 100,
        },
    },
    { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
