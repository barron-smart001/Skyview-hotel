"use client";

import {useEffect,useState} from "react";

export function CallbackVerifier({reference}:{reference:string}){
  const [msg,setMsg]=useState("Verifying payment…");

  useEffect(()=>{
    if(!reference)return;

    let cancelled=false;
    fetch("/api/paystack/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reference})})
      .then(r=>r.json())
      .then(x=>{
        if(!cancelled)setMsg(x.success?"Payment confirmed. Your reservation is confirmed.":`Payment status: ${x.status||x.error||"not confirmed"}`);
      })
      .catch(()=>{
        if(!cancelled)setMsg("We could not verify the payment automatically. Please contact reception.");
      });

    return ()=>{cancelled=true};
  },[reference]);

  return <p style={{margin:"25px 0",fontWeight:700}}>{reference?msg:"No payment reference was returned."}</p>;
}
