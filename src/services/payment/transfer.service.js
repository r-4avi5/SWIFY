import mongoose from "mongoose";

import User from "../../models/user.model.js";
import Wallet from "../../models/wallet.model.js";
import Transaction from "../../models/transaction.model.js";

import {resolveUser} from "../paymentIdentity.service.js";
import {validateTransferData} from "../../validations/transfer.validation.js";
import {validateTransferBusinessRules} from "../../validations/paymentBusiness.validation.js";
import {generateReference} from "../../utils/generateReference.js";
import {getWalletbyUserId,debitWallet,creditWallet} from "../wallet.service.js";
import { createTransaction } from "../transaction.service.js";

export const transferMoney = async (senderId, transferData) => {

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
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }
}