export const validateTransferData = (data) => {
    const { amount, receiver} = data;

   if(!receiver){
        throw new Error("Receiver is required");
    }
    if(amount === undefined || amount === null){
        throw new Error("Amount is required");
    }
    if (typeof amount !== "number") {
        throw new Error("Amount must be a number");
    }
    if (amount <= 0) {
        throw new Error("Amount must be greater than zero");
    }
   }  