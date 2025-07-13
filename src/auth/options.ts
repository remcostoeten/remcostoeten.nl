// No-op auth options - better-auth removed
// This file is kept to prevent import errors

export const authOptions = {
  handler: {
    GET: async () => ({ message: 'Auth disabled' }),
    POST: async () => ({ message: 'Auth disabled' })
  }
};
