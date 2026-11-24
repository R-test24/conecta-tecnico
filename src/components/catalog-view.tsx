"use client";

import { useState } from "react";
import { events, jobs, companies } from "@/lib/catalog";
import { CompanyCard, EventCard, JobCard } from "./cards";

type Kind = "eventos" | "oportunidades" | "empresas";
const normalize = (value: string) => value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
export function CatalogView({ kind, initialCategory }: { kind: Kind; initialCategory: string }) {
  const [filters, setFilters] = useState<Record<string,string>>({ categoria: initialCategory });
  const [page, setPage] = useState(1);
  const update = (key:string, value:string) => {setFilters(previous => ({...previous,[key]:value}));setPage(1);};
  const rows = kind === "eventos" ? events.map(item => ({...item, city:item.company.city, org:item.company.name, course:"",mode:"",element:<EventCard item={item}/>})) : kind === "oportunidades" ? jobs.map(item => ({...item, city:item.company.city,org:item.company.name,element:<JobCard item={item}/>})) : companies.map(item => ({...item,title:item.name,org:item.name,course:"",mode:"",date:"",element:<CompanyCard item={item}/>}));
  const choices = [
    { key:"categoria", label:kind === "empresas" ? "Segmento" : "Categoria", values:rows.map(row=>row.category) },
    { key:"cidade", label:"Cidade",values:rows.map(row=>row.city) },
    ...(kind === "oportunidades" ? [
      { key:"curso",label:"Curso técnico",values:rows.map(row=>row.course) },
      { key:"modalidade",label:"Modalidade",values:rows.map(row=>row.mode) },
      { key:"empresa",label:"Empresa",values:rows.map(row=>row.org) },
    ] : []),
  ];
  const filtered = rows.filter(row =>
    normalize(row.title+" "+row.org).includes(normalize(filters.busca ?? "")) &&
    (!filters.categoria || row.category === filters.categoria) &&
    (!filters.cidade || row.city === filters.cidade) &&
    (!filters.curso || row.course === filters.curso) &&
    (!filters.modalidade || row.mode === filters.modalidade) &&
    (!filters.empresa || row.org === filters.empresa) &&
    (!filters.data || row.date >= filters.data));
  const pageSize = 3;
  const pages = Math.ceil(filtered.length / pageSize);
  return <><div className="filters"><label className="field">Pesquisar<input type="search" placeholder="Pesquisar por nome" value={filters.busca ?? ""} onChange={event=>update("busca",event.target.value)}/></label>{choices.map(choice=><label className="field" key={choice.key}>{choice.label}<select value={filters[choice.key] ?? ""} onChange={event=>update(choice.key,event.target.value)}><option value="">Todas as opções</option>{[...new Set(choice.values)].map(value=><option key={value}>{value}</option>)}</select></label>)}{kind === "eventos" && <label className="field">A partir de<input type="date" value={filters.data ?? ""} onChange={event=>update("data",event.target.value)}/></label>}</div>
    <p className="muted" role="status" style={{marginBottom:14}}>{filtered.length} resultado(s)</p>
    {filtered.length ? <div className="grid-three">{filtered.slice((page-1)*pageSize,page*pageSize).map(row=><div key={row.id}>{row.element}</div>)}</div> : <div className="card card-body"><h3>Nenhum resultado encontrado</h3><button className="button outline" onClick={()=>{setFilters({});setPage(1);}}>Limpar filtros</button></div>}
    {pages > 1 && <div className="pagination"><button className="button outline" disabled={page===1} onClick={()=>setPage(page-1)}>Anterior</button><span>Página {page} de {pages}</span><button className="button outline" disabled={page===pages} onClick={()=>setPage(page+1)}>Próxima</button></div>}</>;
}
