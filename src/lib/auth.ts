// This file is kept for backward compatibility but actual auth is in AuthContext
// Use useAuth() hook instead
export function isLoggedIn(): boolean {
  // This is a synchronous fallback; prefer useAuth() in components
  return false;
}
