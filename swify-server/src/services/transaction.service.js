import Transaction from "../models/transaction.model.js";
import formatTransaction from "../utils/formatTransaction.js";

export const getTransactionHistoryService = async (userId,page,limit) => {
    
    const skip = (page-1) * limit;
    const filter = {
         $or:[
            {sender:userId},
            {receiver:userId},
        ],
    };

    const totalTransactions = await Transaction.countDocuments(filter);

    const transactions = await Transaction.find(filter)
    .sort({createdAt: -1})
    .skip(skip)
    .limit(limit);

    const formattedTransactions = transactions.map((transaction)=> 
            formatTransaction(transaction,userId)
    );

    return{
        page,
        limit,
        totalTransactions,
        totalPages: Math.ceil(
            totalTransactions/limit
        ),
        transactions: formattedTransactions
    };
};

export const createTransaction = async (transactionData, session) => {
    const transaction = await Transaction.create(
        [transactionData],
        { session });

    return transaction[0];
};    

export const getTransactionByReferenceService = async (userId,reference) =>{
        const transaction = await Transaction.findOne(
            {reference,
                $or:[
                    {sender:userId},
                    {receiver:userId}
                ]
            });

        if(!transaction){
            throw new Error ("Transaction not found");
        }

        return formatTransaction(
            transaction,userId
        );
};