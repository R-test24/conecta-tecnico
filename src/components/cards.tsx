import Link from "next/link";
import { CalendarDays, MapPin, Users, BriefcaseBusiness, Building2 } from "lucide-react";
import { companies, events, jobs, formatDate } from "@/lib/catalog";
import { Photo } from "./photo";

export function EventCard({item}: {item: typeof events[number]}) {
  return <article className="card event-card"><div className="cover"><Photo image={item.image}/><span className="cover-tag">{item.category}</span></div><div className="card-body"><p className="eyebrow">Demonstração</p><h3>{item.title}</h3><p className="muted">{item.company.name}</p><div className="meta"><span><CalendarDays/>{formatDate(item.date)} · {item.time}</span><span><MapPin/>{item.company.city}</span><span><Users/>{item.seats} vagas</span></div><Link className="button outline full" href={"/eventos/" + item.id}>Ver detalhes</Link></div></article>;
}
export function JobCard({item}: {item: typeof jobs[number]}) {
  return <article className="card card-body"><span className="tile-icon blue"><BriefcaseBusiness/></span><p className="eyebrow">{item.category} · Demonstração</p><h3>{item.title}</h3><p className="muted">{item.company.name}</p><div className="meta"><span><MapPin/>{item.company.city} · {item.mode}</span><span><CalendarDays/>Até {formatDate(item.date)}</span></div><Link className="button outline full" href={"/oportunidades/" + item.id}>Ver vaga</Link></article>;
}
export function CompanyCard({item}: {item: typeof companies[number]}) {
  return <article className="card"><div className="cover company-cover"><Photo image={item.image}/></div><div className="card-body"><span className="company-mark">{item.mark}</span><p className="eyebrow">{item.category} · Demonstração</p><h3>{item.name}</h3><div className="meta"><span><Building2/>{item.city}</span></div><p className="muted">{item.description}</p><Link className="button outline full" href={"/empresas/" + item.id}>Conhecer empresa</Link></div></article>;
}
