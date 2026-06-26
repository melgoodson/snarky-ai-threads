if (typeof window !== "undefined" && window.location.hash) {
  const hash = window.location.hash;
  if (hash.includes("type=signup") || hash.includes("type=invite")) {
    (window as any).__supabase_signup_hash = hash;
  }
}
export {};
