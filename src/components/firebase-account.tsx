"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseClient } from "@/lib/firebase/client";
import { useFirebaseSession } from "@/lib/firebase/session";
import { roles, type Role } from "@/lib/demo";
import { OrganizationEvents } from "./firebase-events";
import { Button } from "./ui/button";

const roleLabels: Record<Role, string> = {
  estudante: "Estudante",
  empresa: "Empresa",
  escola: "Escola",
};

function ProfileFields({ initialRole }: { initialRole?: string }) {
  return <>
    <label className="field">Nome<input name="name" autoComplete="name" required minLength={2} maxLength={60}/></label>
    <label className="field">Perfil solicitado<select name="role" defaultValue={initialRole}>
      {roles.map(role => <option key={role} value={role}>{roleLabels[role]}</option>)}
    </select></label>
  </>;
}

async function saveProfile(uid: string, fields: FormData) {
  const client = getFirebaseClient();
  if (!client) throw new Error("Firebase indisponível.");
  const name = String(fields.get("name") ?? "").trim();
  const role = roles.find(value => value === fields.get("role"));
  if (!role || name.length < 2 || name.length > 60) {
    throw new Error("Informe um nome de 2 a 60 caracteres e selecione um perfil.");
  }
  await setDoc(doc(client.firestore, "profiles", uid), {
    name,
    requestedRole: role,
    createdAt: serverTimestamp(),
  });
}

export function FirebaseAccount({ register, initialRole, destination = "/painel" }: { register: boolean; initialRole?: string; destination?: "/painel" | "/admin" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const client = getFirebaseClient();
    if (!client || busy) return;
    const fields = new FormData(event.currentTarget);
    const email = String(fields.get("email") ?? "").trim();
    const password = String(fields.get("password") ?? "");
    setBusy(true);
    setMessage("");

    try {
      if (register) {
        const { user } = await createUserWithEmailAndPassword(client.auth, email, password);
        try {
          await saveProfile(user.uid, fields);
        } catch {
          // The account already exists. The dashboard can finish profile creation.
        }
      } else {
        await signInWithEmailAndPassword(client.auth, email, password);
      }
      router.replace(destination);
    } catch {
      setMessage(register
        ? "Não foi possível criar a conta. Confira os dados ou tente entrar se você já tem uma conta."
        : "Não foi possível entrar. Confira o e-mail e a senha e tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  return <form className="form" onSubmit={submit}>
    {register && <ProfileFields initialRole={initialRole}/>}
    <label className="field">E-mail<input name="email" type="email" autoComplete="email" required/></label>
    <label className="field">Senha<input name="password" type="password" autoComplete={register ? "new-password" : "current-password"} minLength={register ? 8 : undefined} required/></label>
    {message && <p role="alert" className="error">{message}</p>}
    <Button disabled={busy}>{register ? "Criar conta" : "Entrar"}</Button>
  </form>;
}

type ProfileState = { uid: string; name: string; role: Role } | { uid: string; missing: true } | { uid: string; error: true };

export function FirebaseDashboard() {
  const user = useFirebaseSession();
  const uid = user?.uid;
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileState>();
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const client = getFirebaseClient();
    if (!client || !uid) return;
    let active = true;
    getDoc(doc(client.firestore, "profiles", uid)).then(snapshot => {
      if (!active) return;
      if (!snapshot.exists()) {
        setProfile({ uid, missing: true });
        return;
      }
      const data = snapshot.data();
      const role = roles.find(value => value === data.requestedRole);
      if (typeof data.name !== "string" || !role) {
        setProfile({ uid, error: true });
        return;
      }
      setProfile({ uid, name: data.name, role });
    }).catch(() => {
      if (active) setProfile({ uid, error: true });
    });
    return () => { active = false; };
  }, [uid, attempt]);

  async function completeProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!uid || busy) return;
    const fields = new FormData(event.currentTarget);
    setBusy(true);
    setMessage("");
    try {
      await saveProfile(uid, fields);
      setProfile(undefined);
      setAttempt(value => value + 1);
    } catch {
      setMessage("Não foi possível salvar o perfil. Confira os dados e tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  async function leave() {
    const client = getFirebaseClient();
    if (!client || busy) return;
    setBusy(true);
    setMessage("");
    try {
      await signOut(client.auth);
      router.replace("/entrar");
    } catch {
      setMessage("Não foi possível encerrar a sessão. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  if (user === null) return <section className="section wrap"><h1>Meu painel</h1>
    <Button asChild><Link href="/entrar">Entrar</Link></Button>
  </section>;

  const current = profile?.uid === uid ? profile : undefined;
  return <section className="section wrap stack">
    <h1>Meu painel</h1>
    {!current && <p role="status">Carregando sua conta…</p>}
    {current && "error" in current && <>
      <p role="alert">Não foi possível carregar seu perfil.</p>
      <Button onClick={() => { setProfile(undefined); setAttempt(value => value + 1); }}>Tentar novamente</Button>
    </>}
    {current && "missing" in current && <form className="form" onSubmit={completeProfile}>
      <h2>Complete seu perfil</h2>
      <ProfileFields/>
      <Button disabled={busy}>Salvar perfil</Button>
    </form>}
    {current && "name" in current && <div className="card card-body">
      <h2>{current.name}</h2>
      <p>Perfil solicitado: {roleLabels[current.role]}</p>
      <Link href="/eventos">Consultar catálogo de eventos</Link>
    </div>}
    {current && "name" in current && current.role === "empresa" && <OrganizationEvents key={current.uid} uid={current.uid}/>}
    {message && <p role="alert" className="error">{message}</p>}
    {user && <Button variant="outline" disabled={busy} onClick={leave}>Sair da conta</Button>}
  </section>;
}
