import "./globals.css";
import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
export const metadata: Metadata={title:"Skyview Hotels","description":"Premium hotel booking and property management platform"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Navbar/>{children}</body></html>}
