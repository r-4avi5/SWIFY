export const validateTransferBusinessRules = ({
    sender,
    receiver,
    senderWallet,
    receiverWallet,
    amount,
    }) => {
    if (!sender) {
        throw new Error("Sender not found");
    }
    if (!receiver) {
        throw new Error("Receiver not found");
    }
    if(sender._id.toString() === receiver._id.toString()){
        throw new Error("Sender and receiver cannot be the same");
    }
    if(senderWallet.isFrozen){
        throw new Error("Your wallet is frozen");
    }
    if(receiverWallet.isFrozen){
        throw new Error("Receiver's wallet is frozen");
    }
    if(senderWallet.status!=="active"){
        throw new Error("Your wallet is not active");
    }
    if(receiverWallet.status!=="active"){
        throw new Error("Receiver's wallet is not active");
    }
    if(senderWallet.balance < amount) {
        throw new Error("Insufficient balance");
    }
    if(senderWallet.dailyTransferredAmount + amount > senderWallet.dailyTransferLimit) {
        throw new Error("Daily transfer limit exceeded");
    }
};