import crypto from "crypto";
import PaymentAuthorisation from "../models/paymentAuthorisation.model.js";

export const generatePaymentAuthorisation = async(userId) => {
    await PaymentAuthorisation.deleteMany({user:userId});

    const token = crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date( Date(now) + 60 * 1000 );
    await PaymentAuthorisation.create({
        user:userId,
        token,
        expiresAt
    });
    return {
        paymentToken:token,
        expiresAt
    };
};

export const verifyPaymentAuthorisation = async(userId,paymentToken) => {
    const authorisation = await PaymentAuthorisation.findOne({
        user:userId,
        token:paymentToken
    });
     if (!authorisation) {
        throw new Error("Payment authorization not found.");
    }
     if (authorisation.expiresAt < new Date()) {
        await authorisation.deleteOne();
        throw new Error("Payment authorization expired.");
    }
    return authorisation;
};

export const deletePaymentAuthorisation = async (authorisation) => {
    await authorisation.deleteOne();
};