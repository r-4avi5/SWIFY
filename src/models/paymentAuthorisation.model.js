import mongoose from "mongoose";

const paymentAuthorisationSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    token:{
        type:String,
        required:true,
        unique:true
    },
    expiresAt:{
        type:Date,
        required:true
    },
    },
    {timestamps:true}
);

paymentAuthorisationSchema.index(
    {expiresAt:1},
    {expireAfterSeconds:0}
);

const PaymentAuthorisation = mongoose.model("PaymentAuthorisation",paymentAuthorisationSchema);

export default PaymentAuthorisation;