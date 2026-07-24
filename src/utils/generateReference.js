import crypto from "crypto";

export const generateReference = () => {
    const timestamp = Date.now().toString().slice(-6); // Get the last 6 digits of the timestamp
    const random = crypto.randomBytes(3).toString("hex").toUpperCase(); // Generate 3 random bytes and convert to hex

    return `SWF${timestamp}${random}`; // Concatenate to form the reference

};