import jwt from 'jsonwebtoken';
export function generateJwtToken() {
  const secretKey = process.env.NEXT_PUBLIC_SECRET_TOKEN_FOR_VINSYS_API
  const payload = {};
  const token = jwt.sign(payload, secretKey, { algorithm: 'HS256' });
  return token;
}
export const genrateApiAccessToken = async () => {
  try {
    const secretKey = process.env.NEXT_PUBLIC_JWT_SECRET_KEY
    const token = await jwt.sign(
      {
        from: "Admin Dashboard"
      },
      secretKey,
      {
        expiresIn: "4s",
        algorithm: 'HS256'
      });
    return token
  } catch (error) {
  }

}