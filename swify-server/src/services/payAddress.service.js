import User from "../models/user.model.js";

export const generatePayAddress = async (displayName) =>{
    
        if (!displayName || !displayName.trim()) {
    throw new Error("Display name is required.");
}
        const base = displayName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

        let payAddress = `${base}@swify`;

        let counter = 1;

        while(await User.exists({payAddress})
        ) {
    payAddress = `${base}${counter}@swify`;
            counter++;
}
    return payAddress;
};