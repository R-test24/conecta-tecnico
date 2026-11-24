import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const cookieName = "conecta-admin-demo";
const duration = 3600;
function signature(expiry: string) {
  return createHmac("sha256", process.env.ADMIN_DEMO_SECRET ?? "").update("conecta-admin-demo:" + expiry).digest("hex");
}
function equal(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
export function adminEnabled() {
  return (process.env.ADMIN_DEMO_SECRET?.length ?? 0) >= 32;
}
export async function hasAdminSession() {
  if (!adminEnabled()) return false;
  const [expiry, token] = (await cookies()).get(cookieName)?.value.split(".") ?? [];
  return Boolean(expiry && token && Number(expiry) > Date.now() && equal(signature(expiry), token));
}
export async function openAdminSession(secret: string) {
  if (!adminEnabled() || !equal(secret, process.env.ADMIN_DEMO_SECRET ?? "")) return false;
  const expiry = String(Date.now() + duration * 1000);
  (await cookies()).set(cookieName, expiry + "." + signature(expiry), { httpOnly: true, sameSite: "strict", path: "/admin", maxAge: duration, secure: process.env.NODE_ENV === "production" && process.env.ADMIN_DEMO_LOCAL_HTTP !== "1" });
  return true;
}
