export function naira(amount:number){return new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(amount)}
export function nights(checkIn:string,checkOut:string){const a=new Date(checkIn).getTime(),b=new Date(checkOut).getTime();return Math.max(1,Math.ceil((b-a)/86400000))}
export function makeReference(prefix="SV"){return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`}
