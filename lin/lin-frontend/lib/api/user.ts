import client from './client';

export type RegisterPayload = {
  name: string;
  dob: string; // yyyy-mm-dd
  gender: string;
  email?: string;
  password: string;
};

export async function registerUser(token: string, payload: RegisterPayload) {
  return client.post('user/register', payload, token);
}

export async function getProfile(token: string) {
  return client.get('user/me', token);
}

export default { registerUser, getProfile };