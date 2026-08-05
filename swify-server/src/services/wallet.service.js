import Wallet from "../models/wallet.model.js";

export const getWalletService = async (userId) => {
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
        throw new Error("Wallet not found for the user");
    }
    return wallet;
};

export const getWalletbyUserId = async (userId) => {
    return await Wallet.findOne({ user: userId });
};

export const debitWallet = async (wallet, amount, session) => {
    wallet.balance -= amount;
    wallet.dailyTransferredAmount += amount;
    wallet.lastTransactionAt = new Date();
    await wallet.save({ session });
    return wallet;
}

export const creditWallet = async (wallet, amount, session) => {
    wallet.balance += amount;
    wallet.lastTransactionAt = new Date();
    await wallet.save({ session });
    return wallet;
}

export const getWalletBalanceService = async(userId) =>{
    const wallet = await Wallet.findOne({user: userId});
     if (!wallet) {
        throw new Error("Wallet not found for the user");
    }
    return {
        balance: wallet.balance,
        currency: wallet.currency,
        status: wallet.status,
    };
};