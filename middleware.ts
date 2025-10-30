//Temporarily disabled Clerk middleware for testing
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api/circuits(.*)",
  "/api/categories(.*)",
  "/api/labels(.*)",
  "/circuit(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  // Protects all routes, including api/trpc.
  // See https://clerk.com/docs/references/nextjs/auth-middleware
  // for more information about configuring your Middleware
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

// Temporary: Allow all routes without authentication
// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

// export default function middleware(req: NextRequest) {
//   return NextResponse.next()
// }

// export const config = {
//   matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
// }
