import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)", // For Clerk webhooks
  "/api/categories", // Public - anyone can view categories
  "/api/prompts", // Public - anyone can view prompts
  "/api/prompts/[id]", // Public - anyone can view individual prompts
  "/api/prompts/[id]/ratings", // Public GET only - POST requires auth (handled in API)
  "/prompt/[id]", // Public - anyone can view prompt pages
  // Note: /prompt/new is protected (requires auth)
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
