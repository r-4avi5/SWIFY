export const validateCreateMpin = (data) =>{
    const {mpin} = data;

    if(!mpin) {
        throw new Error ("MPIN is required.");
    }

    if (!/^\d{6}$/.test(mpin)) {
        throw new Error("MPIN must be exactly 6 digits.");
    }
};

export const validateVerifyMpin = (data) =>{
    const {mpin} = data;

    if(!mpin) {
        throw new Error ("MPIN is required.");
    }

    if (!/^\d{6}$/.test(mpin)) {
        throw new Error("MPIN must be exactly 6 digits.");
    }
};

export const validateChangeMpin = (data) =>{
    const { oldMpin, newMpin } = data;

    if (!oldMpin || !newMpin) {
        throw new Error("Old MPIN and New MPIN are required.");
    }
    if (!/^\d{6}$/.test(oldMpin)) {
        throw new Error("Old MPIN must be exactly 6 digits.");
    }
     if (!/^\d{6}$/.test(newMpin)) {
        throw new Error("New MPIN must be exactly 6 digits.");
    }
    if (oldMpin === newMpin) {
        throw new Error("New MPIN must be different from the old MPIN.");
    }
};