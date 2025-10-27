const express = require("express");
const router = express.Router();
const {
  submitDocumentVerification,
  getVerificationStatus
} = require("../controllers/documentVerificationController");

const authenticate = require("../middlewares/authMiddleware"); 
const upload = require("../middlewares/uploadMiddleware"); 
// ⚠️ Make sure uploadMiddleware supports multiple fields & file arrays like:
// salarySlips[], bankStatements[], and single selfie file

/**
 * @route POST /api/document/submit
 * @desc Submit Document Verification (Step 5 KYC)
 * @access Private
 */
router.post(
  "/submit",
  authenticate,
  upload.fields([
    { name: "salarySlips", maxCount: 5 },
    { name: "bankStatements", maxCount: 5 },
    { name: "selfie", maxCount: 1 }
  ]),
  submitDocumentVerification
);

/**
 * @route GET /api/document/status
 * @desc Get document verification status for logged-in user
 * @access Private
 */
router.get("/status", authenticate, getVerificationStatus);

module.exports = router;
