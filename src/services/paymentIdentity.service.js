import User from "../models/user.model.js";

export const resolveUser = async (identifier) => {

    const user = await User.findOne({
        $or: [
            { phone: identifier },
            { payAddress: identifier.toLowerCase() },
            {swifyId: identifier},
        ]
    }).select("-password");

    if (!user) {
        throw new Error("User not found");
    }

    return user;
}