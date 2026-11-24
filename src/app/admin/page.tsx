import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import { adminEnabled, hasAdminSession, openAdminSession } from "./session";
import { FirebaseAdmin } from "@/components/firebase-admin";
import { firebaseConfigured } from "@/lib/firebase/client";
import { AdminDemo } from "@/components/admin-demo";

export default async function Admin({searchParams}:{searchParams:Promise<{erro?:string}>}){
  await connection();
  if (firebaseConfigured) return <FirebaseAdmin/>;
  if(!adminEnabled()) notFound();
  if(await hasAdminSession()) return <AdminDemo/>;
  const {erro}=await searchParams;
  async function authenticate(form:FormData){
    "use server";
    if(await openAdminSession(String(form.get("secret") ?? ""))) redirect("/admin");
    redirect("/admin?erro=1");
  }
  return <section className="wrap section form-wrap"><h1>Acesso administrativo</h1><form action={authenticate} className="form"><label className="field">Chave do painel local<input type="password" name="secret" required maxLength={256}/></label>{erro && <p className="error" role="alert">Chave inválida.</p>}<button className="button primary">Entrar no painel local</button></form></section>;
}
