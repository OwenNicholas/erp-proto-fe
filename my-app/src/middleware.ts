import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.has('username') // Check for username cookie
  const isLoginPage = request.nextUrl.pathname === '/login'
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin')
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard')

  // If trying to access login page while authenticated, redirect to appropriate page
  if (isLoginPage && isAuthenticated) {
    const role = request.cookies.get('role')?.value
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // If not authenticated and trying to access protected routes, redirect to login
  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check role-based access
  if (isAuthenticated) {
    const role = request.cookies.get('role')?.value
    
    // Prevent non-admin users from accessing admin routes
    if (isAdminPage && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    // Prevent admin users from accessing user routes
    if (isDashboardPage && role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

// Configure which routes to protect
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
} 