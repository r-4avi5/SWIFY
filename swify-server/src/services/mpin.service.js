import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import { validateCreateMpin,validateVerifyMpin,validateChangeMpin } from "../validations/mpin.validation.js";
import { generatePaymentAuthorisation } from "./paymentAuthorisation.service.js";
import { sendMpinCreatedNotification,sendMpinChangedNotification } from "./notification.service.js";

export const createMpinService = async (userId,data) => {
    validateCreateMpin(data);

    const {mpin} = data;
    const user = await User.findById(userId);
    if(!user) {
        throw new Error("User not found.");
    }
    if(user.isMpinSet){
        throw new Error("MPIN already set.");
    }

    const hashedMpin = await bcrypt.hash(mpin,10);
    user.mpin = hashedMpin;
    user.isMpinSet = true;
    await user.save();

    await sendMpinCreatedNotification({
    receiver: user._id,
    });

    return {
        message:"MPIN created successfully."
    };
};

const verifyStoredMpin = async (user,enteredMpin) => {

    if (!user) {
        throw new Error("User not found.");
    }
     if (!user.isMpinSet) {
        throw new Error("MPIN is not set.");
    }
    if (
        user.mpinLockedUntil &&
        user.mpinLockedUntil > new Date()
    ) {
        throw new Error(
            `MPIN is temporarily locked. Try again after ${user.mpinLockedUntil.toLocaleString()}.`
        );
    }

    const isMatch = await bcrypt.compare(enteredMpin,user.mpin);
    if (!isMatch) {
        user.failedMpinAttempts += 1;
         if (user.failedMpinAttempts >= 3){
            user.mpinLockedUntil = new Date(
                Date.now() + 15 * 60 * 1000
            );
            user.failedMpinAttempts = 0;
         }
         await user.save();

         throw new Error ("Incorrect Mpin");
    }
    user.failedMpinAttempts = 0;
    user.mpinLockedUntil = null;

    await user.save();
    return true;
};

export const verifyMpinService = async (userId,data) => {
    validateVerifyMpin(data);
    const {mpin} = data;
    const user = await User.findById(userId);

    await verifyStoredMpin(user,mpin);
    const authorisation = await generatePaymentAuthorisation(userId);
    
    return {
        message:"MPIN verified successfully.",
        paymentToken:authorisation.paymentToken,
        expiresAt:authorisation.expiresAt,
    };
};

export const changeMpinService = async (userId,data) => {
    validateChangeMpin(data);

    const {oldMpin, newMpin} = data;
    const user = await User.findById(userId);
    await verifyStoredMpin(user,oldMpin);

    const hashedNewMpin = await bcrypt.hash(newMpin,10);
    user.mpin = hashedNewMpin;
    await user.save();

    await sendMpinChangedNotification({
    receiver: user._id,
    });

    return {
        message:"MPIN changed successfully."
    };
};