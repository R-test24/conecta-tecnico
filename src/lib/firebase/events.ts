import { readEventBanner } from "@/lib/event-banner";
import {
  addDoc, collection, doc, onSnapshot, query, runTransaction, serverTimestamp,
  Timestamp, where, type Firestore,
} from "firebase/firestore";

export type PilotEvent = {
  id: string;
  status: "pending" | "published" | "rejected";
  title: string;
  description: string;
  location: string;
  startsAt: Timestamp;
  capacity: number;
  registeredCount: number;
  organizationId: string;
  organizationName: string;
  banner?: string;
};

export function watchEvents(db: Firestore, next: (events: PilotEvent[]) => void, error: () => void, filter: { organizationId: string } | { status: "pending" | "published" } = { status: "published" }) {
  const events = query(collection(db, "events"), "organizationId" in filter
    ? where("organizationId", "==", filter.organizationId)
    : where("status", "==", filter.status));
  return onSnapshot(events, snapshot => {
    const items = snapshot.docs.flatMap(item => {
      const data = item.data();
      if (!(data.startsAt instanceof Timestamp) || typeof data.capacity !== "number") return [];
      return [{ ...data, id: item.id } as PilotEvent];
    });
    next(items.sort((first, second) => first.startsAt.toMillis() - second.startsAt.toMillis()));
  }, error);
}

export function eventOrganizer(event: PilotEvent) {
  return event.organizationName === "Conecta Técnico" ? "Conecta Tec" : event.organizationName;
}

export function eventDate(event: PilotEvent) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long", timeStyle: "short", timeZone: "America/Sao_Paulo",
  }).format(event.startsAt.toDate());
}

export async function parseEventFields(fields: FormData) {
  const title = String(fields.get("title") ?? "").trim();
  const description = String(fields.get("description") ?? "").trim();
  const location = String(fields.get("location") ?? "").trim();
  const time = String(fields.get("startsAt") ?? "");
  const startsAt = new Date(time + ":00-03:00");
  const capacity = Number(fields.get("capacity"));

  if (title.length < 3 || title.length > 100 || description.length < 10 || description.length > 2000
    || location.length < 3 || location.length > 160 || !Number.isInteger(capacity)
    || capacity < 1 || capacity > 500 || !Number.isFinite(startsAt.getTime()) || startsAt.getTime() <= Date.now()) {
    throw new Error("Confira o título, a descrição, o local, a data futura e o número de vagas.");
  }

  const banner = await readEventBanner(fields.get("image"));
  return { title, description, location, startsAt, capacity, ...(banner ? { banner } : {}) };
}

export async function createEvent(db: Firestore, uid: string, organizationName: string, fields: FormData, status: "pending" | "published") {
  const event = await parseEventFields(fields);
  await addDoc(collection(db, "events"), {
    ...event, startsAt: Timestamp.fromDate(event.startsAt),
    organizationId: uid, organizationName, status, registeredCount: 0,
    createdAt: serverTimestamp(),
  });
}

export async function registerForEvent(db: Firestore, eventId: string, uid: string, studentName: string) {
  const event = doc(db, "events", eventId);
  const registration = doc(event, "attendees", uid);
  return runTransaction(db, async transaction => {
    const existing = await transaction.get(registration);
    if (existing.exists()) return;
    const data = (await transaction.get(event)).data();
    if (!data || data.status !== "published" || data.startsAt.toMillis() <= Date.now()) {
      throw new Error("As inscrições deste evento foram encerradas.");
    }
    if (data.registeredCount >= data.capacity) throw new Error("As vagas deste evento acabaram.");
    transaction.update(event, { registeredCount: data.registeredCount + 1 });
    transaction.set(registration, { studentName, createdAt: serverTimestamp() });
  });
}
