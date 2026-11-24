"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { collection, doc, onSnapshot, query, setDoc, updateDoc, where } from "firebase/firestore";
import { getFirebaseClient } from "@/lib/firebase/client";
import { eventDate, eventOrganizer, watchEvents, type PilotEvent } from "@/lib/firebase/events";
import { useFirebaseSession } from "@/lib/firebase/session";
import { FirebaseAccount } from "./firebase-account";
import { EventForm } from "./event-form";
import { Button } from "./ui/button";

type Company = { uid: string; name: string };
type AdminAccess = { uid: string; allowed: boolean; failed?: true };
type Feedback = { text: string; failed?: true };

export function FirebaseAdmin() {
  const user = useFirebaseSession();
  const uid = user?.uid;
  const [access, setAccess] = useState<AdminAccess>();
  const [signOutFailed, setSignOutFailed] = useState(false);

  useEffect(() => {
    const client = getFirebaseClient();
    if (!client || !uid) return;
    return onSnapshot(doc(client.firestore, "administrators", uid), { includeMetadataChanges: true },
      snapshot => setAccess({ uid, allowed: snapshot.data()?.enabled === true && !snapshot.metadata.fromCache }),
      () => setAccess({ uid, allowed: false, failed: true }),
    );
  }, [uid]);

  async function leave() {
    const client = getFirebaseClient();
    if (client) await signOut(client.auth).catch(() => setSignOutFailed(true));
  }

  if (user === null) return <section className="wrap section form-wrap stack">
    <h1>Acesso administrativo</h1>
    <FirebaseAccount register={false} destination="/admin"/>
  </section>;

  return <section className="wrap section stack">
    <div className="section-heading has-action">
      <h1>Painel administrativo</h1>
      {user && <Button variant="outline" onClick={leave}>Sair ou trocar de conta</Button>}
    </div>
    {signOutFailed && <p role="alert">Não foi possível encerrar a sessão.</p>}
    {!access || access.uid !== uid ? <p role="status">Verificando acesso…</p>
      : access.failed ? <p role="alert">Não foi possível verificar seu acesso administrativo.</p>
      : access.allowed ? <AdminWorkspace key={access.uid} uid={access.uid}/>
      : <p role="alert">Sua conta precisa de permissão administrativa para acessar este painel.</p>}
  </section>;
}

function AdminWorkspace({ uid }: { uid: string }) {
  const [companies, setCompanies] = useState<Company[]>();
  const [approved, setApproved] = useState<Set<string>>();
  const [pendingEvents, setPendingEvents] = useState<PilotEvent[]>();
  const [publishedEvents, setPublishedEvents] = useState<PilotEvent[]>();
  const [companyError, setCompanyError] = useState(false);
  const [eventError, setEventError] = useState(false);
  const [publishedError, setPublishedError] = useState(false);
  const [busy, setBusy] = useState<string>();
  const [feedback, setFeedback] = useState<Feedback>();

  useEffect(() => {
    const client = getFirebaseClient();
    if (!client) return;
    const { firestore } = client;
    const companyQuery = query(collection(firestore, "profiles"), where("requestedRole", "==", "empresa"));
    const stopCompanies = onSnapshot(companyQuery, snapshot =>
      setCompanies(snapshot.docs.map(item => ({ uid: item.id, name: item.data().name }))),
    () => setCompanyError(true));
    const stopApprovals = onSnapshot(collection(firestore, "approvedOrganizations"), snapshot =>
      setApproved(new Set(snapshot.docs.map(item => item.id))), () => setCompanyError(true));
    const stopPending = watchEvents(firestore, setPendingEvents, () => setEventError(true), { status: "pending" });
    const stopPublished = watchEvents(firestore, setPublishedEvents, () => setPublishedError(true));
    return () => { stopCompanies(); stopApprovals(); stopPending(); stopPublished(); };
  }, []);

  async function mutate(id: string, action: () => Promise<void>, success: string, failure = "Não foi possível salvar a decisão. Confira os dados e tente novamente.") {
    if (busy) return;
    setBusy(id);
    setFeedback(undefined);
    try {
      await action();
      setFeedback({ text: success });
    } catch {
      setFeedback({ failed: true, text: failure });
    } finally {
      setBusy(undefined);
    }
  }

  function approveCompany(company: Company) {
    const client = getFirebaseClient();
    if (!client) return;
    void mutate(company.uid, () => setDoc(doc(client.firestore, "approvedOrganizations", company.uid), {
      name: company.name,
    }), "Empresa aprovada. Ela já pode enviar eventos.");
  }

  function reviewEvent(event: PilotEvent, status: "published" | "rejected") {
    const client = getFirebaseClient();
    if (!client) return;
    void mutate(event.id, () => updateDoc(doc(client.firestore, "events", event.id), { status }),
      status === "published" ? "Evento aprovado e publicado." : "Evento recusado.",
      status === "published" ? "Não foi possível publicar. Confira se o evento ainda está pendente e tem data futura." : undefined);
  }

  const waiting = companies?.filter(company => !approved?.has(company.uid));

  return <>
    <nav className="actions" aria-label="Seções administrativas">
      <a href="#empresas">Empresas</a>
      <a href="#eventos-pendentes">Eventos pendentes</a>
      <a href="#criar-evento">Criar evento</a>
      <a href="#publicados">Publicados</a>
    </nav>
    {feedback && <p className={feedback.failed ? "error" : "notice"} role={feedback.failed ? "alert" : "status"}>{feedback.text}</p>}
    <section id="empresas" className="card card-body stack">
      <h2>Empresas aguardando aprovação</h2>
      {companyError ? <p role="alert">Não foi possível carregar as empresas.</p>
        : !waiting || !approved ? <p role="status">Carregando empresas…</p>
        : !waiting.length ? <p>Nenhuma empresa aguardando aprovação.</p>
        : waiting.map(company => <div key={company.uid} className="row">
          <p>{company.name}</p>
          <Button disabled={Boolean(busy)} onClick={() => approveCompany(company)} aria-label={`Aprovar ${company.name}`}>Aprovar</Button>
        </div>)}
      {companies && approved && <details>
        <summary>Empresas aprovadas</summary>
        <ul>{companies.filter(company => approved.has(company.uid)).map(company => <li key={company.uid}>{company.name}</li>)}</ul>
      </details>}
    </section>
    <section id="eventos-pendentes" className="card card-body stack">
      <h2>Eventos aguardando aprovação</h2>
      {eventError ? <p role="alert">Não foi possível carregar os eventos pendentes.</p>
        : !pendingEvents ? <p role="status">Carregando eventos…</p>
        : !pendingEvents.length ? <p>Nenhum evento aguardando aprovação.</p>
        : pendingEvents.map(event => <article key={event.id} className="card card-body stack">
          <h3>{event.title}</h3>
          <p>{eventOrganizer(event)} · {eventDate(event)} · {event.location} · {event.capacity} vagas</p>
          <p>{event.description}</p>
          <div className="actions">
            <Button disabled={Boolean(busy)} onClick={() => reviewEvent(event, "published")}>Aprovar e publicar</Button>
            <Button variant="outline" disabled={Boolean(busy)} onClick={() => reviewEvent(event, "rejected")}>Recusar</Button>
          </div>
        </article>)}
    </section>
    <section id="criar-evento" className="card card-body stack">
      <h2>Criar evento do Conecta Tec</h2>
      <EventForm uid={uid} organizationName="Conecta Tec" direct/>
    </section>
    <section id="publicados" className="card card-body stack">
      <h2>Eventos publicados</h2>
      {publishedError ? <p role="alert">Não foi possível carregar os eventos publicados.</p>
        : !publishedEvents ? <p role="status">Carregando eventos…</p>
        : !publishedEvents.length ? <p>Nenhum evento publicado.</p>
        : <ul>{publishedEvents.map(event => <li key={event.id}><Link href={"/eventos/" + event.id}>{event.title}</Link></li>)}</ul>}
    </section>
  </>;
}
