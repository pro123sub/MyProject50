// Example API integration for the unified document verification controller
// This shows how the frontend can use the new API endpoints

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class DocumentVerificationAPI {
  
  /**
   * Submit complete document verification (PAN + Aadhaar + Files)
   * This is the main endpoint that handles everything in one call
   */
  static async submitDocumentVerification(data) {
    const formData = new FormData();
    
    // Add PAN and Aadhaar numbers
    formData.append('panNumber', data.panNumber);
    formData.append('aadhaarNumber', data.aadhaarNumber);
    
    // Add files if they exist
    if (data.payslipFile) {
      formData.append('payslipFile', data.payslipFile);
    }
    if (data.bankStatementFile) {
      formData.append('bankStatementFile', data.bankStatementFile);
    }

    const response = await fetch(`${API_BASE_URL}/documents/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit document verification');
    }

    return response.json();
  }

  /**
   * Get document verification status
   */
  static async getDocumentStatus() {
    const response = await fetch(`${API_BASE_URL}/documents/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get document status');
    }

    return response.json();
  }

  /**
   * Submit only PAN number (if needed separately)
   */
  static async submitPAN(panNumber) {
    const response = await fetch(`${API_BASE_URL}/documents/pan`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ panNumber }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit PAN');
    }

    return response.json();
  }

  /**
   * Submit only Aadhaar number (if needed separately)
   */
  static async submitAadhaar(aadhaarNumber) {
    const response = await fetch(`${API_BASE_URL}/documents/aadhaar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ aadhaarNumber }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit Aadhaar');
    }

    return response.json();
  }
}

export default DocumentVerificationAPI;
