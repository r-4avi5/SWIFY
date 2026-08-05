 const formatTransaction = (transaction,userId) => {

        const isSender = transaction.sender.toString() === userId.toString();
        return {
            reference: transaction.reference,
            type: isSender ? "Debit" : "Credit",
            amount: transaction.amount,
            status:transaction.status,
            person:isSender
                    ?transaction.receiverSnapshot:transaction.senderSnapshot,
            note:transaction.note,
            createdAt:transaction.createdAt,    
            paymentMethod:transaction.paymentMethod,    
        };
 };

 export default formatTransaction;