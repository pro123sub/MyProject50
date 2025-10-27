const UserDocumentModel = require('../models/documentModel');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { BadRequestError, NotFoundError } = require('../GlobalExceptionHandler/exception');
const { supabase } = require('../config/supabase');
const fs = require("fs").promises;
const path = require("path");
const crypto = require('crypto');

class DocumentService {

  /**
   * Upload Bank Statements, Salary Slips & Selfie
   */
  async uploadUserKycDocs(userId, files) {
    const bankStatements = files?.bankStatements || [];
    const salarySlips = files?.salarySlips || [];
    // Handle both single file and array
    const selfie = Array.isArray(files?.selfie) ? files.selfie[0] : files?.selfie;

    if (bankStatements.length < 3) {
      throw new BadRequestError("At least 3 bank statements required");
    }
    if (salarySlips.length < 3) {
      throw new BadRequestError("At least 3 salary slips required");
    }
    if (!selfie) {
      throw new BadRequestError("Selfie is required for KYC verification");
    }

    return prisma.$transaction(async (tx) => {
      const uploadedDocs = [];

      // Upload bank statements
      for (const file of bankStatements) {
        const filePath = `KycDocs/bank-statements/${userId}/${Date.now()}_${file.originalname}`;
        const doc = await this.uploadToSupabaseAndSave(file, userId, filePath, "BANK_STATEMENT", tx);
        uploadedDocs.push(doc);
      }

      // Upload salary slips
      for (const file of salarySlips) {
        const filePath = `KycDocs/salary-slips/${userId}/${Date.now()}_${file.originalname}`;
        const doc = await this.uploadToSupabaseAndSave(file, userId, filePath, "PAY_SLIP", tx);
        uploadedDocs.push(doc);
      }

      // Upload selfie image
  const selfiePath = `UserImages/selfie/${userId}/${Date.now()}_${selfie.originalname}`;
  // map selfie to PHOTO enum in Prisma
  const selfieDoc = await this.uploadToSupabaseAndSave(selfie, userId, selfiePath, "PHOTO", tx);
      uploadedDocs.push(selfieDoc);

      return {
        message: "KYC documents uploaded successfully",
        uploadedDocs
      };
    });
  }

  // Helper for Supabase Upload + DB Store
  async uploadToSupabaseAndSave(file, userId, filePath, type, tx) {
    const fileBuffer = await fs.readFile(file.path);

    const { error: uploadError } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(filePath, fileBuffer);

    if (uploadError) {
      throw new BadRequestError(`Failed uploading ${type}: ${uploadError.message}`);
    }

    // Getting public URL
    const { data: urlData } = supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .getPublicUrl(filePath);

    // compute metadata
    const mimeType = file.mimetype || null;
    const size = file.size || (fileBuffer ? Buffer.byteLength(fileBuffer) : null);
    const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Save metadata to DB (store both fileUrl and filePath for reliable deletion)
    const document = await UserDocumentModel.createDocument(userId, {
      fileName: file.originalname,
      filePath, // store the storage path used in Supabase
      type,
      fileUrl: urlData.publicUrl,
      mimeType,
      size,
      checksum,
      status: 'SUBMITTED',
    }, tx);

    // Remove temp file stored by Multer
    await fs.unlink(file.path);

    return document;
  }

  /**
   * Get list of user documents
   */
  async getUserDocuments(userId) {
    return await UserDocumentModel.getDocumentsByUserId(userId);
  }

  /**
   * Get a single document metadata
   */
  async getDocument(id) {
    const doc = await UserDocumentModel.getDocumentById(id);
    if (!doc) throw new NotFoundError("Document not found");
    return doc;
  }

  /**
   * Update verification status
   */
  async updateDocumentStatus(id, status) {
    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      throw new BadRequestError("Invalid status type");
    }

    return prisma.$transaction(async (tx) => {
      const document = await UserDocumentModel.getDocumentById(id, tx);
      if (!document) throw new NotFoundError("Document not found");

      await UserDocumentModel.updateDocument(id, { status }, tx);

      return { message: "Document status updated" };
    });
  }

  /**
   * Hard delete doc + remove from Supabase
   */
  async deleteDocument(id) {
    return prisma.$transaction(async (tx) => {
      const document = await UserDocumentModel.getDocumentById(id, tx);
      if (!document) throw new NotFoundError("Document not found");

      // Use stored filePath (the path within the bucket) for removal. This is
      // more reliable than trying to parse the public URL.
      const relativePath = document.filePath || document.fileUrl.split(`/${process.env.SUPABASE_BUCKET}/`)[1];

      if (relativePath) {
        await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([relativePath]);
      } else {
        // If we couldn't determine a path, log a warning and continue;
        // do not fail the whole transaction because of storage removal issues.
        // (Alternatively, throw if you prefer strict behavior.)
        // eslint-disable-next-line no-console
        console.warn('Could not determine file path to remove from Supabase for document id=', id);
      }
      await UserDocumentModel.deleteDocument(id, tx);

      return { message: "Document deleted successfully" };
    });
  }
}

module.exports = new DocumentService();
