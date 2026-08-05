export const validateKYCData = (data) =>{
    const{
        aadhaarNumber,
        panNumber,
        aadhaarFront,
        aadhaarBack,
        panCard,
        selfie,
    } = data;
    if (
        !aadhaarNumber|| !panNumber || !aadhaarFront || !aadhaarBack || !panCard || !selfie
    ) {throw new Error("All KYC fields are required.");
     }  if (!/^\d{12}$/.test(aadhaarNumber)) {
        throw new Error("Invalid Aadhaar number.");
    }
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.toUpperCase())) {
        throw new Error("Invalid PAN number.");
    }
};