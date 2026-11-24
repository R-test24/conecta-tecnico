import Link from "next/link";
import { notFound } from "next/navigation";
import { companies, events, jobs, formatDate } from "@/lib/catalog";
import { EventCard, JobCard } from "@/components/cards";
import { Photo } from "@/components/photo";
import { FirebaseEventDetail } from "@/components/firebase-events";
import { firebaseConfigured } from "@/lib/firebase/client";

export default async function Detail({params}: {params:Promise<{area:string;id:string}>}) {
  const {area,id} = await params;
  if(area === "empresas") {
    const company = companies.find(item=>item.id===id);
    if(!company) notFound();
    return <section className="wrap section detail"><Link href="/empresas" className="eyebrow">Voltar ao catálogo</Link><div className="cover"><Photo image={company.image}/></div><span className="company-mark">{company.mark}</span><h1>{company.name}</h1><div className="prose"><p className="muted">{company.category} · {company.city} · Empresa demonstrativa</p><p>{company.description}</p>{!firebaseConfigured && <><h2>Eventos</h2><div className="grid-three">{events.filter(item=>item.company.id===id).map(item=><EventCard key={item.id} item={item}/>)}</div></>}<h2>Oportunidades</h2><div className="grid-three">{jobs.filter(item=>item.company.id===id).map(item=><JobCard key={item.id} item={item}/>)}</div></div></section>;
  }
  if(area === "eventos"){
    if (firebaseConfigured) return <FirebaseEventDetail key={id} id={id}/>;
    const event=events.find(item=>item.id===id);
    if(!event) notFound();
    return <section className="wrap section detail"><Link href="/eventos" className="eyebrow">Voltar aos eventos</Link><div className="cover"><Photo image={event.image}/></div><p className="eyebrow">{event.category} · Demonstração</p><h1>{event.title}</h1><div className="prose"><Link href={"/empresas/"+event.company.id}>{event.company.name}</Link><p>{event.description}</p><h2>Data e local</h2><p>{formatDate(event.date)} às {event.time} · {event.company.city}</p><p>{event.location}</p><h2>Participação</h2><p>{event.audience} · {event.seats} vagas demonstrativas</p><p>{event.requirements}</p><p>Responsável · {event.contact}</p><p className="notice">Evento ilustrativo para explorar o catálogo.</p></div></section>;
  }
  if(area === "oportunidades"){
    const job=jobs.find(item=>item.id===id);
    if(!job) notFound();
    return <section className="wrap section detail"><Link href="/oportunidades" className="eyebrow">Voltar às oportunidades</Link><p className="eyebrow">{job.category} · Demonstração</p><h1>{job.title}</h1><div className="prose"><Link href={"/empresas/"+job.company.id}>{job.company.name}</Link><p className="muted">{job.company.city} · {job.mode} · Até {formatDate(job.date)}</p><p>{job.description}</p><h2>Requisitos</h2><p>{job.course} · {job.requirements}</p><h2>Benefícios</h2><p>{job.benefits}</p><p className="notice">Vaga ilustrativa para explorar o catálogo.</p></div></section>;
  }
  notFound();
}
