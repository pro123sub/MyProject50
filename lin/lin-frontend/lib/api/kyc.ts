import client from './client';

export type FullKycPayload = {
  companyName: string;
  companyAddress: string;
  monthlyIncome: string | number;
  stability: string;
  employmentType?: string;

  currentAddress: string;
  permanentAddress: string;
  currentAddressType: string;
  currentCity?: string;
  currentState?: string;
  currentPostalCode?: string;

  loanAmount: string | number;
  purpose: string;
  interestRate?: string | number;
  termMonths?: string | number;
  startDate?: string;
};

export async function submitFullKyc(token: string, payload: FullKycPayload) {
  return client.post('kyc', payload, token);
}

export default { submitFullKyc };