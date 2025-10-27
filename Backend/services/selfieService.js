const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const saveSelfie = async (userId, fileUrl) => {
    if (!fileUrl) throw new Error("Selfie upload failed: No file received");

    // ✅ Save selfie in UserDocument table
    const selfieDoc = await prisma.userDocument.create({
        data: {
            userId,
            type: "PHOTO",
            fileUrl,
            status: "PENDING"
        }
    });

    // ✅ Update User KYC step
    await prisma.user.update({
        where: { id: userId },
        data: { kycStep: "SELFIE_UPLOADED" }
    });

    return {
        message: "Selfie uploaded successfully",
        selfie: selfieDoc
    };
};

const getSelfieStatus = async (userId) => {
    const selfie = await prisma.userDocument.findFirst({
        where: { userId, type: "PHOTO" },
        orderBy: { createdAt: "desc" }
    });

    return selfie
        ? { uploaded: true, status: selfie.status }
        : { uploaded: false, status: "PENDING" };
};

module.exports = { saveSelfie, getSelfieStatus };
