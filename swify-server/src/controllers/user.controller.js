export const getProfile = async (req, res) => {
    res.status(200).json({
        success: true,
        message: "User profile retrieved successfully",
        data: req.user,
    });
}