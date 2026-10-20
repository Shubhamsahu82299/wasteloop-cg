import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, request) => {
  const pathname = request.nextUrl.pathname;
  const isPublic = pathname === "/" || pathname.startsWith("/field") || pathname.startsWith("/supervisor") || pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up") || pathname.startsWith("/citizen") || pathname.startsWith("/api");
  if (isPublic) return;

  const { userId } = await auth();
  if (userId) return;

  const signInPath = pathname.startsWith("/supervisor") ? "/supervisor/sign-in" : "/citizen/sign-in";
  const signInUrl = new URL(signInPath, request.url);
  signInUrl.searchParams.set("redirect_url", `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(signInUrl);
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
