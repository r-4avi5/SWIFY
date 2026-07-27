import mongoose from "mongoose";

import User from "../models/user.model.js";
import Wallet from "../models/wallet.model.js";
import Transaction from "../models/transaction.model.js";

import {resolveUser} from "./paymentIdentity.service.js";
import {validateTransferData} from "../validations/payment.validation.js";
import {validateTransferBusinessRules} from "../validations/paymentBusiness.validation.js";
import {generateReference} from "../utils/generateReference.js";
import {getWalletbyUserId,debitWallet,creditWallet} from "./wallet.service.js";
import { createTransaction } from "./transaction.service.js";
import { verifyPaymentAuthorisation,deletePaymentAuthorisation } from "./paymentAuthorisation.service.js";

export const transferMoneyService = async (senderId, transferData,paymentToken) => {

    if (!paymentToken) {
    throw new Error("Payment authorization token is required.");
}
    const authorisation = await verifyPaymentAuthorisation(senderId,paymentToken);

    validateTransferData(transferData);

    const { receiver, amount, note } = transferData;
    const receiverUser = await resolveUser(receiver);

    const senderWallet = await getWalletbyUserId(senderId);
    const receiverWallet = await getWalletbyUserId(receiverUser._id);

    const senderUser = await User.findById(senderId);

    validateTransferBusinessRules({
        sender: senderUser,
        receiver: receiverUser,
        senderWallet,
        receiverWallet,
        amount,
    });

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        await debitWallet(senderWallet, amount, session);
        await creditWallet(receiverWallet, amount, session);

        const reference = generateReference();

        await createTransaction(
            {
                reference,
                sender: senderUser._Id,
                receiver: receiverUser._Id,

                senderSnapshot:{
                    fullName: senderUser.fullName,
                    swifyId: senderUser.swifyId,
                    payAddress: senderUser.payAddress
                },
                receiverSnapshot:{
                    fullName: receiverUser.fullName,
                    swifyId: receiverUser.swifyId,
                    payAddress: receiverUser.payAddress
                },
                amount,
                paymentMethod: "PAY_ADDRESS",
                status: "success",
                note,
            },
            session
        )
        await session.commitTransaction();
        await deletePaymentAuthorisation(authorisation);
        return {
            success: true,
            message: "payment successful",
            reference,
            amount,
            receiver:{
                fullName:receiver.fullName,
                payAddress:receiver.payAddress,
            },
        };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
}

export const transferByQRService = async (
    senderId,
    data
) => {

    const {
        qrData,
        amount,
        note,
        idempotencyKey,
    } = data;

    if (!qrData) {
        throw new Error("QR data is required.");
    }

    let payload;

    try {

        payload = JSON.parse(qrData);

    } catch {

        throw new Error("Invalid QR Code.");

    }

    if (!payload.payAddress) {

        throw new Error("Invalid QR payload.");

    }

    return await transferService(
        senderId,
        {
            identifier: payload.payAddress,
            amount,
            note,
            idempotencyKey,
        }
    );

};

export const scanQRService = async (data) => {

    const { qrData } = data;
    const kyc = await KYC.findOne({ user: receiver._id });

    if (!qrData) {
        throw new Error("QR data is required.");
    }

    let payload;

    try {

        payload = JSON.parse(qrData);

    } catch {

        throw new Error("Invalid QR Code.");

    }

    if (!payload.payAddress) {
        throw new Error("Invalid QR payload.");
    }

    const receiver = await User.findOne({
        payAddress: payload.payAddress,
    });

    if (!receiver) {
        throw new Error("Receiver not found.");
    }

    if (!kyc || kyc.status !== "VERIFIED") {
    throw new Error("Receiver is not eligible to receive payments.");
    }

    return {

        displayName: receiver.displayName,

        payAddress: receiver.payAddress,

        avatar: receiver.avatar,

    };

};