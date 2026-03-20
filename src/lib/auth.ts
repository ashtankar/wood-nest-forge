export function isLoggedIn(): boolean {
  return localStorage.getItem("algoforge_logged_in") === "true";
}
