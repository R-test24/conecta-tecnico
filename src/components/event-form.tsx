"use client";

import { useState, type FormEvent } from "react";
import { getFirebaseClient } from "@/lib/firebase/client";
import { createEvent, parseEventFields } from "@/lib/firebase/events";
import { EventBannerField } from "./event-banner-field";
import { Button } from "./ui/button";

export type DemoAdminEvent = Awaited<ReturnType<typeof parseEventFields>>;

type EventFormProps =
  | { uid: string; organizationName: string; direct?: boolean }
  | { onDemoCreate: (event: DemoAdminEvent) => void };

export function EventForm(props: EventFormProps) {
  const demo = "onDemoCreate" in props;
  const direct = demo || props.direct;
  const [bannerKey, setBannerKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; failed?: true }>();
  const action = demo ? "Criar evento de demonstração" : direct ? "Publicar evento" : "Enviar para aprovação";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    setBusy(true);
    setFeedback(undefined);
    try {
      const fields = new FormData(form);
      if (demo) {
        props.onDemoCreate(await parseEventFields(fields));
      } else {
        const client = getFirebaseClient();
        if (!client) throw new Error("O Firebase não está configurado.");
        await createEvent(client.firestore, props.uid, props.organizationName, fields, direct ? "published" : "pending");
      }
      form.reset();
      setBannerKey(value => value + 1);
      setFeedback({ message: demo ? "Evento criado nesta sessão de demonstração." : direct ? "Evento publicado no catálogo." : "Evento enviado para aprovação." });
    } catch (error) {
      setFeedback({ failed: true, message: error instanceof Error && error.constructor === Error
        ? error.message : "Não foi possível salvar o evento. Tente novamente." });
    } finally {
      setBusy(false);
    }
  }

  return <form className="form" onSubmit={submit}>
    <label className="field">Título<input name="title" required minLength={3} maxLength={100}/></label>
    <label className="field">Descrição<textarea name="description" required minLength={10} maxLength={2000} rows={4}/></label>
    <label className="field">Local<input name="location" required minLength={3} maxLength={160}/></label>
    <label className="field">Data e horário de Brasília<input name="startsAt" type="datetime-local" required/></label>
    <label className="field">Vagas<input name="capacity" type="number" required min={1} max={500}/></label>
    <EventBannerField key={bannerKey}/>
    <Button disabled={busy}>{busy ? "Salvando…" : action}</Button>
    {feedback && <p role={feedback.failed ? "alert" : "status"}>{feedback.message}</p>}
  </form>;
}
