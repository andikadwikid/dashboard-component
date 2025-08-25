/**
 * An array of route that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes: string[] = ["/"];

/**
 * An array of route that are used for authentication
 * These routes will redirect logged-in users to the dashboard
 * @type {string[]}
 */
export const authRoutes: string[] = ["/auth/login", "/auth/register"];

/**
 * These prefix for API authentication routes *  that start with this prefix are used for API authentication purposes
 * @type {string}
 */
export const apiAuthPrefix: string = "/api/auth";

/**
 * Default redirect route for logged-in users
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT: string = "/admin/dashboard";
