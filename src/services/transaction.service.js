export const createTransaction = async (transactionData, session) => {
    const transaction = await Transaction.create(
        [transactionData],
        { session });

    return transaction[0];
};    
