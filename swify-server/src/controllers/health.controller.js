export const getHealthStatus = (req, res) => {
    res.status(200).json({
        success: true,
        message: "🚀 Welcome to SWIFY API",
        version: "1.0.0"
    });
};