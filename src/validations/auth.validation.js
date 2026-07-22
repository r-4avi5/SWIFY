export const validateRegisterData = (data) => {
    const { fullName, email, password,phone,swifyId } = data;

    if (!fullName || !email || !password || !phone || !swifyId) {
        throw new Error("All fields are required");
    } 
};