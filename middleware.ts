import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Mitigation for CVE-2026-44575 and CVE-2026-45109:
// Both CVEs allow middleware/proxy bypass in App Router via crafted segment-prefetch
// requests (RSC + Next-Router-Prefetch headers). By intercepting these requests
// explicitly we ensure they cannot skip the middleware chain.
export function middleware(request: NextRequest) {
  const isPrefetch = request.headers.get('Next-Router-Prefetch') === '1'
  const isRSC = request.headers.get('RSC') === '1'

  if (isPrefetch && isRSC && !request.nextUrl.pathname.startsWith('/_next/')) {
    // Rewrite to the same URL so Next.js re-evaluates the route through the
    // full middleware chain rather than the short-circuit prefetch path.
    return NextResponse.rewrite(request.nextUrl.clone())
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
}
