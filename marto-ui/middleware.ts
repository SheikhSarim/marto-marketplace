import { NextRequest, NextResponse } from 'next/server';

const ROLE_COOKIE_NAME = 'marto_session_role';

function getRequiredRole(pathname: string): 'CUSTOMER' | 'SELLER' | 'SUPER_ADMIN' | null {
  // Public Seller Onboarding / Auth routes
  if (
    pathname === '/seller' ||
    pathname.startsWith('/seller/join') ||
    pathname.startsWith('/seller/login') ||
    pathname.startsWith('/seller/register') ||
    pathname.startsWith('/seller/verify-email')
  ) {
    return null;
  }

  // Protected Seller Panel routes
  if (
    pathname.startsWith('/seller/panel') ||
    pathname.startsWith('/seller/dashboard') ||
    pathname.startsWith('/seller/shop') ||
    pathname.startsWith('/seller/products') ||
    pathname.startsWith('/seller/categories') ||
    pathname.startsWith('/seller/orders') ||
    pathname.startsWith('/seller/revenue') ||
    pathname.startsWith('/seller/settings')
  ) {
    return 'SELLER';
  }

  // Public Admin Login route
  if (pathname.startsWith('/admin/login')) {
    return null;
  }

  // Protected Super Admin routes
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return 'SUPER_ADMIN';
  }

  // Protected Customer Checkout & Account routes
  if (pathname.startsWith('/checkout') || pathname.startsWith('/account')) {
    return 'CUSTOMER';
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const requiredRole = getRequiredRole(pathname);

  if (!requiredRole) {
    return NextResponse.next();
  }

  const sessionRole = request.cookies.get(ROLE_COOKIE_NAME)?.value?.toUpperCase() || '';
  const returnTo = `${pathname}${search}`;

  if (!sessionRole) {
    if (requiredRole === 'CUSTOMER') {
      const loginUrl = new URL('/customer/login', request.url);
      loginUrl.searchParams.set('from', returnTo);
      return NextResponse.redirect(loginUrl);
    }
    if (requiredRole === 'SELLER') {
      const loginUrl = new URL('/seller/login', request.url);
      loginUrl.searchParams.set('from', returnTo);
      return NextResponse.redirect(loginUrl);
    }
    const unauthUrl = new URL('/401', request.url);
    unauthUrl.searchParams.set('reason', 'not_logged_in');
    unauthUrl.searchParams.set('from', returnTo);
    return NextResponse.redirect(unauthUrl);
  }

  // Allow SUPER_ADMIN into /admin/*; SELLER into /seller/*; CUSTOMER into /account/* and /checkout
  if (sessionRole !== requiredRole) {
    const unauthUrl = new URL('/401', request.url);
    unauthUrl.searchParams.set('reason', 'role_mismatch');
    unauthUrl.searchParams.set('from', returnTo);
    unauthUrl.searchParams.set('role', sessionRole);
    unauthUrl.searchParams.set('required', requiredRole);
    return NextResponse.redirect(unauthUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/checkout/:path*',
    '/account/:path*',
    '/seller/:path*',
    '/admin/:path*',
  ],
};
