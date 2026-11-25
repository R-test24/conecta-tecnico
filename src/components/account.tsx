"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { readData, readProfile, registerDemoAccount, roles, saveData, signInDemoAccount, type Role } from "@/lib/demo";
import { Button } from "./ui/button";
import { FirebaseAccount } from "./firebase-account";
import { firebaseConfigured } from "@/lib/firebase/client";

export function AccountForm({register,initialRole}:{register:boolean;initialRole?:string}) {
  return firebaseConfigured
    ? <FirebaseAccount register={register} initialRole={initialRole}/>
    : <DemoAccount register={register} initialRole={initialRole}/>;
}

function DemoAccount({ register, initialRole }: { register: boolean; initialRole?: string }) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(roles.find(value => value === initialRole) ?? "estudante");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const nameLabel = role === "empresa" ? "Nome da empresa" : role === "escola" ? "Nome da escola" : "Nome do estudante";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const fields = new FormData(event.currentTarget);
    const email = String(fields.get("email") ?? "");
    const password = String(fields.get("password") ?? "");
    setBusy(true);
    setProblem("");
    try {
      if (register) {
        await registerDemoAccount({ name: String(fields.get("name") ?? ""), role, email }, password);
        router.push("/entrar?cadastro=concluido");
      } else {
        await signInDemoAccount(email, password);
        router.push("/painel");
      }
    } catch (error) {
      setProblem(error instanceof Error && error.constructor === Error
        ? error.message : "Não foi possível concluir. Confira se o navegador permite armazenar a conta.");
    } finally {
      setBusy(false);
    }
  }

  return <form className="form" onSubmit={submit}>
    <p className="notice">Conta de demonstração disponível neste navegador. Use um e-mail fictício e uma senha só para este teste.</p>
    {register && <>
      <label className="field">Tipo de perfil
        <select value={role} onChange={event => setRole(event.currentTarget.value as Role)}>
          <option value="estudante">Estudante</option>
          <option value="empresa">Empresa</option>
          <option value="escola">Escola</option>
        </select>
      </label>
      <label className="field">{nameLabel}
        <input name="name" autoComplete={role === "estudante" ? "name" : "organization"} required minLength={2} maxLength={60}/>
      </label>
    </>}
    <label className="field">E-mail<input name="email" type="email" autoComplete="username" required maxLength={254}/></label>
    <label className="field">Senha
      <input name="password" type="password" autoComplete={register ? "new-password" : "current-password"}
        required minLength={register ? 8 : undefined} maxLength={128}/>
      {register && <small>Use pelo menos 8 caracteres.</small>}
    </label>
    {problem && <p role="alert" className="error">{problem}</p>}
    <Button disabled={busy}>{busy ? "Aguarde…" : register ? "Criar conta de teste" : "Entrar"}</Button>
    <Link href={register ? "/entrar" : "/cadastro"}>{register ? "Já tenho conta" : "Criar conta de teste"}</Link>
  </form>;
}

export function DemoAction({id,kind}:{id:string;kind:"event"|"job"}) {
  const [message,setMessage]=useState("");
  const [needsProfile,setNeedsProfile]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null);
  const heading=useId();
  const label=kind==="event"?"Simular inscrição":"Simular candidatura";
  const confirm=()=>{
    dialog.current?.close();
    const profile=readProfile();
    if(!profile || profile.role!=="estudante"){
      setNeedsProfile(true);
      setMessage("Entre na demonstração com um perfil de estudante para continuar.");
      return;
    }
    setNeedsProfile(false);
    try{
      const data=readData(profile);
      const field=kind==="event"?"events":"jobs";
      if(data[field].includes(id)){setMessage("Este item já está registrado no seu painel.");return;}
      saveData(profile,{...data,[field]:[...data[field],id]});
      const feedback=kind==="event"?"Inscrição simulada registrada.":"Candidatura simulada registrada.";
      setMessage(feedback);
      toast.success(feedback);
    }catch{setMessage("O navegador não conseguiu salvar o registro.");}
  };
  if (firebaseConfigured) return null;
  return <div><Button type="button" onClick={()=>{
    if(readProfile()?.role!=="estudante"){
      setNeedsProfile(true);
      setMessage("Entre na demonstração com um perfil de estudante para continuar.");
      return;
    }
    dialog.current?.showModal();
  }}>{label}</Button><p role="status">{message}</p>{needsProfile && <Button asChild variant="outline"><Link href="/entrar">Entrar</Link></Button>}
  <dialog ref={dialog} aria-labelledby={heading} className="demo-dialog"><h2 id={heading}>{label}</h2><p>O registro ficará disponível no seu painel de demonstração neste navegador.</p><div className="actions"><Button type="button" variant="outline" onClick={()=>dialog.current?.close()}>Cancelar</Button><Button type="button" onClick={confirm}>Confirmar simulação</Button></div></dialog></div>;
}
