export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey || /your_|placeholder|example/i.test(`${url} ${publishableKey}`)) {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    const validProtocol = parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    const isSupabaseWebsite = parsedUrl.hostname === "supabase.com" || parsedUrl.hostname === "www.supabase.com";

    return validProtocol && !isSupabaseWebsite;
  } catch {
    return false;
  }
}
