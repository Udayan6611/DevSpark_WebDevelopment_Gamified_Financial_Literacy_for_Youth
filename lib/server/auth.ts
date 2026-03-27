import { SignJWT, jwtVerify } from 'jose';

const JWT_COOKIE_NAME = 'finpath_token';
const JWT_ALG = 'HS256';

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured.');
  }
  return new TextEncoder().encode(secret);
}

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
}

export async function signAuthToken(payload: JwtPayload): Promise<string> {
  const secret = getSecret();

  return await new SignJWT({
    email: payload.email,
    username: payload.username,
  })
    .setProtectedHeader({ alg: JWT_ALG })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyAuthToken(token: string): Promise<JwtPayload | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret, { algorithms: [JWT_ALG] });

    if (
      typeof payload.sub !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.username !== 'string'
    ) {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      username: payload.username,
    };
  } catch {
    return null;
  }
}

export function getAuthCookieName(): string {
  return JWT_COOKIE_NAME;
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  };
}
