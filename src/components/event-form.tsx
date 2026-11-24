"use client";

import { useState, type FormEvent } from "react";
import { getFirebaseClient } from "@/lib/firebase/client";
import { createEvent } from "@/lib/firebase/events";
import { Button } from "./ui/button";

export function EventForm({ uid, organizationName, direct = false }: {
  uid: string;
  organizationName: string;
  direct?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; failed?: true }>();
  const action = direct ? "Publicar evento" : "Enviar para aprovação";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const client = getFirebaseClient();
    if (!client || busy) return;
    const form = event.currentTarget;
    setBusy(true);
    setFeedback(undefined);
    try {
      await createEvent(client.firestore, uid, organizationName, new FormData(form), direct ? "published" : "pending");
      form.reset();
      setFeedback({ message: direct ? "Evento publicado no catálogo." : "Evento enviado para aprovação." });
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
    <Button disabled={busy}>{busy ? "Salvando…" : action}</Button>
    {feedback && <p role={feedback.failed ? "alert" : "status"}>{feedback.message}</p>}
  </form>;
}
