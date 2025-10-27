const SelfieService = require("../services/selfieService");

exports.uploadSelfie = async (req, res) => {
    try {
        const userId = req.user.id;
        const selfieFile = req.files?.selfie?.[0]; // ✅ Multer File

        const result = await SelfieService.saveSelfie(userId, selfieFile?.path);

        res.status(200).json(result);

    } catch (error) {
        res.status(500).json({
            message: error.message || "Selfie upload failed"
        });
    }
};

exports.getSelfieStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        const status = await SelfieService.getSelfieStatus(userId);

        res.status(200).json(status);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch selfie status" });
    }
};
