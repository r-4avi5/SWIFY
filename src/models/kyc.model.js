import mongoose from "mongoose";

const kycSchema = new mongoose.Schema({

    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
        unique:true,
    },
    aadharNumber:{
        type: String,
        default:"",
        trim:true,
    },
    panNumber:{
        type: String,
        default:"",
        uppercase:true,
        trim:true,
    },
    documents:{
        aadharFront:{
            type:String,
            default:"",
        },
        aadharBack:{
            type:String,
            default:"",
        },
        panCard:{
            type:String,
            default:"",
        },
        selfie:{
            type:String,
            default:"",
        },
    },
    status:{
        type:String,
        enum:[
                "PENDING",
                "UNDER_REVIEW",
                "VERIFIED",
                "REJECTED",
        ],
        default:"PENDING",
    }, 
    rejectionReason:{
        type:String,
        default:"",
    },
    verifiedAt:{
        type:Date,
        default:null,
    },
    verifiedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null,
    },
},
    {
        timestamps:true,
    }
);

const KYC = mongoose.model("KYC",kycSchema);

export default KYC;