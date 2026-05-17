import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Mitigations for Next.js CVEs that lack a stable patch as of Next.js 16.2.6.
export function middleware(request: NextRequest) {
  const headers = request.headers

  // CVE-2026-44578: SSRF via WebSocket upgrades.
  // This app does not use WebSockets; block all upgrade requests so the
  // framework cannot be coerced into proxying them to internal services.
  if (headers.get('upgrade')?.toLowerCase() === 'websocket') {
    return new NextResponse(null, { status: 426, statusText: 'Upgrade Required' })
  }

  // CVE-2026-44575 / CVE-2026-45109: middleware/proxy bypass via segment-prefetch
  // route injection (RSC + Next-Router-Prefetch headers combined). Rewrite the
  // request so it goes through the full middleware chain instead of the
  // framework's short-circuit prefetch path.
  const isPrefetch = headers.get('Next-Router-Prefetch') === '1'
  const isRSC = headers.get('RSC') === '1'

  if (isPrefetch && isRSC && !request.nextUrl.pathname.startsWith('/_next/')) {
    return NextResponse.rewrite(request.nextUrl.clone())
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
}
