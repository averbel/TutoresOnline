import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

const protectedRoutes = ['/inicio', '/buscar', '/perfil', '/como-funciona', '/registro-tutor'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get('session')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const session = await verifyToken(token);
  if (!session) {
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.set('session', '', { maxAge: 0, path: '/' });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/inicio/:path*', '/buscar/:path*', '/perfil/:path*', '/como-funciona/:path*', '/registro-tutor/:path*'],
};
