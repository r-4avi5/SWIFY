export const validateRegisterData = (data) => {
    const { fullName, email, password,phone,swifyId } = data;

    if (!fullName || !email || !password || !phone || !swifyId) {
        throw new Error("All fields are required");
    } 
};

export const validateLoginData = (data) => {
    const { email, password } = data;

    if (!email || !password) {
        throw new Error("Email and password are required");
    }
};