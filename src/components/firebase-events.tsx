"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocFromServer, onSnapshot } from "firebase/firestore";
import { getFirebaseClient } from "@/lib/firebase/client";
import { eventDate, eventOrganizer, registerForEvent, watchEvents, type PilotEvent } from "@/lib/firebase/events";
import { useFirebaseSession } from "@/lib/firebase/session";
import { Photo } from "./photo";
import { EventForm } from "./event-form";
import { Button } from "./ui/button";

function useCurrentTime() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(interval);
  }, []);
  return now;
}

type EventList = { events: PilotEvent[] } | { error: true };

function useEvents(organizationId?: string) {
  const [list, setList] = useState<EventList>();
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const client = getFirebaseClient();
    if (!client) return;
    return watchEvents(client.firestore, events => setList({ events }),
      () => setList({ error: true }), organizationId ? { organizationId } : undefined);
  }, [organizationId, retry]);
  return { list, reload: () => { setList(undefined); setRetry(value => value + 1); } };
}

function EventListStatus({ list, reload }: ReturnType<typeof useEvents>) {
  if (!list) return <p role="status">Carregando eventos…</p>;
  if ("error" in list) return <div className="stack">
    <p role="alert">Não foi possível carregar os eventos.</p>
    <Button variant="outline" onClick={reload}>Tentar novamente</Button>
  </div>;
  if (!list.events.length) return <p className="notice">Nenhum evento encontrado.</p>;
  return null;
}

export function FirebaseEventCatalog() {
  const result = useEvents();
  const now = useCurrentTime();
  return <>
    <EventListStatus {...result}/>
    {result.list && "events" in result.list && <div className="grid-three">
      {result.list.events.map(event => <article className="card card-body stack" key={event.id}>
        {event.banner && <div className="event-banner-preview"><Photo image={event.banner}/></div>}
        <h2><Link href={"/eventos/" + event.id}>{event.title}</Link></h2>
        <p>{eventOrganizer(event)}</p>
        <p className="muted">{eventDate(event)} · {event.location}</p>
        <p>{event.startsAt.toMillis() <= now ? "Inscrições encerradas" : `${event.capacity - event.registeredCount} vagas disponíveis`}</p>
      </article>)}
    </div>}
  </>;
}

export function FirebaseEventDetail({ id }: { id: string }) {
  const [record, setRecord] = useState<PilotEvent | null>();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const client = getFirebaseClient();
    if (!client) return;
    return onSnapshot(doc(client.firestore, "events", id), snapshot => {
      const data = snapshot.data();
      setRecord(data && data.status === "published" && typeof data.capacity === "number"
        ? { ...data, id } as PilotEvent : null);
    }, () => setFailed(true));
  }, [id]);

  return <section className="wrap section detail stack">
    <Link href="/eventos" className="eyebrow">Voltar aos eventos</Link>
    {failed ? <p role="alert">Não foi possível abrir este evento.</p>
      : record === undefined ? <p role="status">Carregando evento…</p>
      : record === null ? <h1>Evento indisponível</h1>
      : <>
        <h1>{record.title}</h1>
        {record.banner && <div className="cover"><Photo image={record.banner}/></div>}
        <p>{eventOrganizer(record)}</p>
        <p className="muted">{eventDate(record)} · {record.location}</p>
        <p>{record.description}</p>
        <p>{record.capacity - record.registeredCount} vagas disponíveis</p>
        <Registration event={record}/>
      </>}
  </section>;
}

function Registration({ event }: { event: PilotEvent }) {
  const user = useFirebaseSession();
  const now = useCurrentTime();
  const uid = user?.uid;
  const [registeredUid, setRegisteredUid] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const client = getFirebaseClient();
    if (!client || !uid) return;
    return onSnapshot(doc(client.firestore, "events", event.id, "attendees", uid), snapshot => {
      setRegisteredUid(snapshot.exists() ? uid : undefined);
    }, () => {});
  }, [event.id, uid]);

  async function join() {
    const client = getFirebaseClient();
    if (!client || !uid || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const profile = (await getDoc(doc(client.firestore, "profiles", uid))).data();
      if (profile?.requestedRole !== "estudante" || typeof profile.name !== "string") {
        setMessage("Para se inscrever, complete seu perfil de estudante no painel.");
        return;
      }
      await registerForEvent(client.firestore, event.id, uid, profile.name);
      setRegisteredUid(uid);
    } catch (error) {
      const latest = await getDocFromServer(doc(client.firestore, "events", event.id))
        .then(snapshot => snapshot.data(), () => undefined);
      if (latest && latest.registeredCount >= latest.capacity) {
        setMessage("As vagas deste evento acabaram.");
      } else {
        setMessage(error instanceof Error && error.constructor === Error
          ? error.message : "Não foi possível confirmar a inscrição. Tente novamente.");
      }
    } finally {
      setBusy(false);
    }
  }

  if (uid && registeredUid === uid) return <p role="status">Inscrição confirmada.</p>;
  if (event.startsAt.toMillis() <= now) return <p>Inscrições encerradas.</p>;
  if (event.registeredCount >= event.capacity) return <p>Vagas esgotadas.</p>;
  if (user === null) return <Button asChild><Link href="/entrar">Entrar para se inscrever</Link></Button>;
  if (!uid) return null;
  return <div className="stack">
    <Button disabled={busy} onClick={join}>{busy ? "Confirmando…" : "Confirmar inscrição"}</Button>
    {message && <p role="alert">{message}</p>}
  </div>;
}

export function OrganizationEvents({ uid }: { uid: string }) {
  const [approval, setApproval] = useState<string | null>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const client = getFirebaseClient();
    if (!client) return;
    return onSnapshot(doc(client.firestore, "approvedOrganizations", uid), snapshot => {
      const name = snapshot.data()?.name;
      setApproval(typeof name === "string" ? name : null);
    }, () => setFailed(true));
  }, [uid]);

  if (failed) return <p role="alert">Não foi possível consultar a aprovação da empresa.</p>;
  if (approval === undefined) return <p role="status">Consultando aprovação…</p>;
  if (approval === null) return <p className="notice">Sua empresa aguarda aprovação para enviar eventos.</p>;
  return <Publication uid={uid} organizationName={approval}/>;
}

function Publication({ uid, organizationName }: { uid: string; organizationName: string }) {
  const result = useEvents(uid);
  const [opened, setOpened] = useState<string>();

  return <div className="stack">
    <h2>Propor evento</h2>
    <EventForm uid={uid} organizationName={organizationName}/>
    <h2>Meus eventos</h2>
    <EventListStatus {...result}/>
    {result.list && "events" in result.list && result.list.events.map(item => <article key={item.id} className="card card-body stack">
      {item.banner && <div className="event-banner-preview"><Photo image={item.banner}/></div>}
      <h3>{item.status === "published" ? <Link href={"/eventos/" + item.id}>{item.title}</Link> : item.title}</h3>
      {item.status !== "published" && <p>{item.status === "pending" ? "Aguardando aprovação" : "Evento recusado"}</p>}
      {item.status === "published" && <>
        <p>{item.registeredCount} de {item.capacity} vagas preenchidas</p>
        <Button variant="outline" aria-expanded={opened === item.id} onClick={() => setOpened(opened === item.id ? undefined : item.id)}>
          {opened === item.id ? "Ocultar inscritos" : "Ver inscritos"}
        </Button>
        {opened === item.id && <Attendees id={item.id}/>}
      </>}
    </article>)}
  </div>;
}

function Attendees({ id }: { id: string }) {
  const [rows, setRows] = useState<{ id: string; name: string }[]>();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const client = getFirebaseClient();
    if (!client) return;
    return onSnapshot(collection(client.firestore, "events", id, "attendees"),
      snapshot => setRows(snapshot.docs.map(item => ({ id: item.id, name: item.data().studentName }))),
      () => setFailed(true));
  }, [id]);

  if (failed) return <p role="alert">Não foi possível carregar a lista de inscritos.</p>;
  if (!rows) return <p role="status">Carregando inscritos…</p>;
  if (!rows.length) return <p>Nenhuma inscrição confirmada.</p>;
  return <ul>{rows.map(row => <li key={row.id}>{row.name}</li>)}</ul>;
}
