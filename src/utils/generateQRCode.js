import QRCode from "qrcode";

export const generateQRCode = async(payload) =>{
    try{
        return await QRCode.toDataURL(
            JSON.stringify(payload),
            {
                errorCorrectionLevel: "H",
                margin:2,
                width: 350,
                 color: {
                dark: "#000000",
                light: "#FFFFFF",
            },
            }
        );
        return qrCodeImage;
    } catch(error){
       throw new Error("Failed to generate QR Code")
    }
};