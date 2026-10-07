"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMsg("");

    if (!isSupabaseConfigured()) {
      setMsg("Supabase is not configured with a project URL. In Supabase, open Project Settings → API and copy the Project URL into NEXT_PUBLIC_SUPABASE_URL.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const result = mode === "sign-in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });

      if (result.error) {
        setMsg(result.error.message);
        return;
      }

      if (mode === "sign-up" && !result.data.session) {
        setMsg("Account created. Check your email to confirm your address, then sign in.");
        return;
      }

      router.push("/account");
      router.refresh();
    } catch {
      setMsg("Could not reach Supabase Auth. Verify NEXT_PUBLIC_SUPABASE_URL is the Project URL from Supabase Project Settings → API, then restart the app.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card" style={{ maxWidth: 480, margin: "auto", padding: 32 }}>
      <span style={{ color: "#155eef", fontWeight: 800, fontSize: 12 }}>SKYVIEW HOTELS</span>
      <h1 style={{ fontSize: 34, margin: "8px 0 25px" }}>
        {mode === "sign-in" ? "Welcome back" : "Create your account"}
      </h1>
      {mode === "sign-up" && (
        <div style={{ marginBottom: 16 }}>
          <label className="label" htmlFor="full-name">Full name</label>
          <input id="full-name" name="name" autoComplete="name" className="field" required value={name} onChange={event => setName(event.target.value)} />
        </div>
      )}
      <div style={{ marginBottom: 16 }}>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" autoComplete="email" className="field" type="email" required value={email} onChange={event => setEmail(event.target.value)} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" autoComplete={mode === "sign-in" ? "current-password" : "new-password"} className="field" type="password" minLength={6} required value={password} onChange={event => setPassword(event.target.value)} />
      </div>
      {msg && <p role="status" aria-live="polite" style={{ color: msg.startsWith("Account created") ? "#067647" : "#b42318", fontSize: 13 }}>{msg}</p>}
      <button className="btn btn-primary" disabled={loading} style={{ width: "100%" }}>
        {loading ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Create account"}
      </button>
      <p style={{ fontSize: 13, color: "#6b7280", textAlign: "center" }}>
        {mode === "sign-in"
          ? <>No account? <Link href="/auth/sign-up" style={{ color: "#155eef" }}>Create one</Link></>
          : <>Already registered? <Link href="/auth/sign-in" style={{ color: "#155eef" }}>Sign in</Link></>}
      </p>
    </form>
  );
}
