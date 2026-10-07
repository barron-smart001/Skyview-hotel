import "./globals.css";
import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata={title:"Skyview Hotels","description":"Premium hotel booking and property management platform"};

export default function RootLayout({children}:{children:React.ReactNode}){
  const supabaseConfigured = isSupabaseConfigured();

  return <html lang="en"><body><Navbar/>{!supabaseConfigured&&<div role="status" style={{padding:"12px 20px",background:"#fff4ce",color:"#674d00",textAlign:"center"}}>Supabase isn&apos;t configured. Add a valid project URL and publishable key to .env.local to enable sign-in, bookings, and live room inventory.</div>}{children}</body></html>
}
