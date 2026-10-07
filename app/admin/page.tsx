import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import Link from "next/link";
export default async function Admin() {
    const { supabase, profile } = await
        getProfile().catch(() =>
            ({ supabase: null, profile: null } as any)); if (!profile || !["receptionist", "manager", "administrator"].includes(profile.role)) redirect("/");
    const [{ count: bookings }, { count: rooms }, { count: guests }] =
        await Promise.all([supabase.from("bookings").select("*", { count: "exact", head: true }), supabase.from("rooms").select("*", { count: "exact", head: true }), supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "guest")]); return <main className="container" style={{ padding: "55px 0" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 28 }}><div><span style={{ color: "#155eef", fontWeight: 800, fontSize: 12 }}>STAFF WORKSPACE</span><h1 style={{ fontSize: 42, margin: "8px 0" }}>Good day, {profile.full_name || "Team"}.</h1><p style={{ color: "#6b7280" }}>Role: {profile.role}</p></div></div><div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18, marginBottom: 28 }}>{[["Bookings", bookings], ["Rooms", rooms], ["Guests", guests]].map(([t, c]: any) => <div className="card" style={{ padding: 24 }} key={t}><span style={{ color: "#6b7280", fontSize: 13 }}>{t}</span><div style={{ fontSize: 36, fontWeight: 900, marginTop: 8 }}>{c ?? 0}</div></div>)}</div><div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>{[["Bookings", "/admin/bookings"], ["Rooms", "/admin/rooms"], ["Guests", "/admin/guests"], ["Payments", "/admin/payments"], ["Staff", "/admin/staff"], ["Analytics", "/admin/analytics"]].map(([t, h]) => <Link className="card" style={{ padding: 22, fontWeight: 800 }} href={h} key={t}>{t} <span style={{ float: "right", color: "#155eef" }}>→</span></Link>)}</div></main>
}
