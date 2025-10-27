const asyncHandler = require('express-async-handler');
const logger = require('../utils/logger');
const { BadRequestError } = require('../GlobalExceptionHandler/exception');

// Import services
const panService = require('../services/panService');
const aadhaarService = require('../services/aadharService');
const documentService = require('../services/documentService');
const UserLocationModel = require('../models/userLocationModel');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Controller for Step 5 - Document Verification
 * Handles submission of:
 * - PAN number
 * - Aadhaar number
 * - Salary slips (PDF uploads)
 * - Bank statements (PDF uploads)
 * - Selfie photo (image upload)
 * - GPS location
 * - Consent checkbox
 */
const submitDocumentVerification = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestError('User not authenticated');
    }

    logger.info('[DOCUMENT VERIFICATION] Submission started for userId: %s', userId);

    const { panNumber, aadhaarNumber, latitude, longitude, consent } = req.body;

    // Validate required fields
    if (!panNumber) {
      throw new BadRequestError('PAN number is required');
    }
    if (!aadhaarNumber) {
      throw new BadRequestError('Aadhaar number is required');
    }
    if (!consent) {
      throw new BadRequestError('Consent is required to proceed');
    }
    if (!latitude || !longitude) {
      throw new BadRequestError('Location is required (enable GPS)');
    }

    // Check uploaded files
    const files = req.files;
    const salarySlips = files?.salarySlips || [];
    const bankStatements = files?.bankStatements || [];
    const selfieFile = files?.selfie; // Single file object

    if (salarySlips.length === 0) {
      throw new BadRequestError('At least one salary slip is required');
    }
    if (bankStatements.length === 0) {
      throw new BadRequestError('At least one bank statement is required');
    }
    if (!selfieFile) {
      throw new BadRequestError('Selfie photo is required');
    }

    // Submit PAN
    logger.info('[DOCUMENT VERIFICATION] Submitting PAN for userId: %s', userId);
    const panResult = await panService.submitPAN(userId, panNumber);

    // Submit Aadhaar
    logger.info('[DOCUMENT VERIFICATION] Submitting Aadhaar for userId: %s', userId);
    const aadhaarResult = await aadhaarService.submitAadhaar(userId, aadhaarNumber);

    // Upload documents (salary slips, bank statements, selfie)
    logger.info('[DOCUMENT VERIFICATION] Uploading documents for userId: %s', userId);
    const documentsResult = await documentService.uploadUserKycDocs(userId, {
      bankStatements,
      salarySlips,
      selfie: selfieFile
    });

    // Save location and update status in transaction
    const { location, status } = await prisma.$transaction(async (tx) => {
      // Save location
      logger.info('[DOCUMENT VERIFICATION] Saving location for userId: %s', userId);
      const locationResult = await UserLocationModel.createLocation(
        userId,
        {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          accuracy: req.body.accuracy || null,
          locality: req.body.locality || null,
          city: req.body.city || null,
          state: req.body.state || null,
          country: req.body.country || null,
          postalCode: req.body.postalCode || null,
          placeName: req.body.placeName || null
        },
        tx
      );

      // Update or create UserDocumentStatus
      logger.info('[DOCUMENT VERIFICATION] Updating document status for userId: %s', userId);
      const statusResult = await tx.userDocumentStatus.upsert({
        where: { userId },
        update: {
          status: 'SUBMITTED',
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        },
        create: {
          userId,
          status: 'SUBMITTED',
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        }
      });

      return { location: locationResult, status: statusResult };
    });

    logger.info('[DOCUMENT VERIFICATION] Successfully completed for userId: %s', userId);

    res.status(200).json({
      success: true,
      message: 'Document verification submitted successfully',
      data: {
        panSubmitted: !!panResult,
        aadhaarSubmitted: !!aadhaarResult,
        documentsUploaded: documentsResult?.uploadedDocs?.length || 0,
        locationCaptured: !!location,
        overallStatus: status.status || 'SUBMITTED'
      }
    });

  } catch (error) {
    logger.error('[DOCUMENT VERIFICATION] Error: %s', error.message);
    throw error;
  }
});

/**
 * Get document verification status for a user
 */
const getVerificationStatus = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestError('User not authenticated');
    }

    const [panStatus, aadhaarStatus, documentStatus, documents] = await Promise.all([
      panService.getPanStatus(userId).catch(() => null),
      aadhaarService.getAadhaarStatus(userId).catch(() => null),
      prisma.userDocumentStatus.findUnique({ where: { userId } }),
      documentService.getUserDocuments(userId)
    ]);

    res.status(200).json({
      success: true,
      data: {
        pan: panStatus,
        aadhaar: aadhaarStatus,
        documents: documents || [],
        overallStatus: documentStatus?.status || 'PENDING_UPLOAD'
      }
    });

  } catch (error) {
    logger.error('[DOCUMENT VERIFICATION] Error getting status: %s', error.message);
    throw error;
  }
});

module.exports = {
  submitDocumentVerification,
  getVerificationStatus
};

