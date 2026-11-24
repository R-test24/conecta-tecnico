"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { readData, readProfile, saveData } from "@/lib/demo";
import { Button } from "./ui/button";
import { FirebaseAccount } from "./firebase-account";
import { firebaseConfigured } from "@/lib/firebase/client";

const schema = z.object({name:z.string().trim().min(2,"Informe pelo menos dois caracteres.").max(60,"Use até 60 caracteres."),role:z.enum(["estudante","escola"])});
export function AccountForm({register,initialRole}:{register:boolean;initialRole?:string}) {
  return firebaseConfigured
    ? <FirebaseAccount register={register} initialRole={initialRole}/>
    : <DemoAccount register={register} initialRole={initialRole}/>;
}

function DemoAccount({register,initialRole}:{register:boolean;initialRole?:string}) {
  const router=useRouter();
  const form=useForm<z.infer<typeof schema>>({resolver:zodResolver(schema),defaultValues:{role:initialRole==="escola" ? initialRole : "estudante"}});
  return <form className="form" onSubmit={form.handleSubmit(data=>{
    try {sessionStorage.setItem("conecta-profile",JSON.stringify(data));window.dispatchEvent(new Event("conecta-session"));router.push("/painel");}
    catch {form.setError("root",{message:"O navegador bloqueou o armazenamento da sessão."});}
  })}><p className="notice">Use um nome fictício. A sessão é simulada neste navegador.</p><label className="field">Nome de demonstração<input autoComplete="off" {...form.register("name")} aria-invalid={!!form.formState.errors.name}/>{form.formState.errors.name && <small>{form.formState.errors.name.message}</small>}</label><label className="field">Perfil<select {...form.register("role")}><option value="estudante">Estudante</option><option value="escola">Escola</option></select></label>{form.formState.errors.root && <p role="alert" className="error">{form.formState.errors.root.message}</p>}<Button>{register ? "Criar perfil demonstrativo" : "Entrar na demonstração"}</Button><Link href={register ? "/empresa?modo=cadastro" : "/empresa"}>Acesso para empresas</Link></form>;
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
