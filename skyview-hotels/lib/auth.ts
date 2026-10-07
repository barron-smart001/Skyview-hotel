import {createClient} from "@/lib/supabase/server";
export async function requireUser(){const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)throw new Error("UNAUTHENTICATED");return {supabase,user}}
export async function getProfile(){const {supabase,user}=await requireUser();const {data}=await supabase.from("profiles").select("*").eq("id",user.id).single();return {supabase,user,profile:data}}
