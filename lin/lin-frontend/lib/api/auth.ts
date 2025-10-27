import client from './client';

export type RequestOtpResponse = { message: string };
export type VerifyOtpResponse = { token: string; user: any };

export async function requestPhoneOtp(phone: string) {
  return client.post('auth/phone/request-otp', { phone });
}

export async function verifyPhoneOtp(phone: string, code: string): Promise<VerifyOtpResponse> {
  return client.post('auth/phone/verify-otp', { phone, code });
}

export default { requestPhoneOtp, verifyPhoneOtp };