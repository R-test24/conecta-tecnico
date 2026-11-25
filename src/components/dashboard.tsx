"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { categories, companies, events, jobs } from "@/lib/catalog";
import { readData, readProfile, saveData, signOutDemoAccount, type DemoData, type Profile } from "@/lib/demo";
import { EventCard, JobCard, CompanyCard } from "./cards";
import { EventBannerField } from "./event-banner-field";
import { readEventBanner } from "@/lib/event-banner";
import { Photo } from "./photo";

const menus = {
  estudante: ["Visão geral","Meu perfil","Eventos","Minhas inscrições","Oportunidades","Minhas candidaturas","Portfólio","Certificados","Configurações"],
  empresa: ["Visão geral","Perfil empresarial","Meus eventos","Criar evento","Inscrições","Oportunidades","Publicar vaga","Escolas parceiras","Relatórios","Configurações"],
  escola: ["Visão geral","Perfil da escola","Cursos técnicos","Estudantes vinculados","Eventos disponíveis","Empresas parceiras","Solicitar atividade","Relatórios","Configurações"],
};
const roles = {estudante:"Estudante",empresa:"Empresa",escola:"Escola"};
const subscribe = () => () => {};
const client = () => true;
const server = () => false;
export function Dashboard(){
  const ready=useSyncExternalStore(subscribe,client,server);
  if(!ready)return <section className="section wrap" aria-busy="true"><div className="skeleton"/></section>;
  const profile=readProfile();
  if(!profile)return <section className="section wrap"><h1>Painel</h1><p className="notice">Entre para abrir uma sessão de demonstração.</p><Link className="button primary" href="/entrar">Entrar</Link></section>;
  return <Workspace key={profile.email} profile={profile}/>;
}
function Workspace({profile}:{profile:Profile}){
  const router=useRouter();
  const [tab,setTab]=useState("Visão geral");
  const [showMenu,setShowMenu]=useState(true);
  const [data,setData]=useState(()=>readData(profile));
  const [message,setMessage]=useState("");
  const {role}=profile;
  const commit=(next:DemoData,feedback:string)=>{
    try{saveData(profile,next);setData(next);setMessage(feedback);return true;}
    catch{setMessage("O armazenamento local está indisponível ou cheio.");return false;}
  };
  const post=(entry:DemoData["posts"][number])=>commit({...data,posts:[...data.posts,entry]},"Registro salvo na demonstração.");
  const rows=(type:string)=>data.posts.filter(item=>item.type===type);
  const list=(type:string)=> <div className="stack">{rows(type).length ? rows(type).map(item=><article className="card card-body" key={item.id}>{item.image && <div className="cover"><Photo image={item.image}/></div>}<div className="row"><div><h3>{item.title}</h3><p className="muted">{item.description}</p>{item.date && <p>{item.date} · {item.city}</p>}</div><button className="button outline" onClick={()=>commit({...data,posts:data.posts.filter(row=>row.id!==item.id)},"Registro removido.")}>Remover</button></div></article>) : <p className="notice">Nenhum registro nesta seção.</p>}</div>;
  const eventList=(registered=false)=><div className="grid-three">{events.filter(item=>!registered || data.events.includes(item.id)).map(item=><EventCard key={item.id} item={item}/>)}</div>;
  const jobList=(applied=false)=><div className="grid-three">{jobs.filter(item=>!applied || data.jobs.includes(item.id)).map(item=><JobCard key={item.id} item={item}/>)}</div>;
  const chart=<div className="card card-body"><h3>Participação por mês</h3><p className="muted">Dados ilustrativos: setembro 6, outubro 11, novembro 15.</p><div style={{width:"100%",height:200}} aria-hidden="true"><ResponsiveContainer><BarChart data={[{m:"Set",v:6},{m:"Out",v:11},{m:"Nov",v:15}]}><XAxis dataKey="m"/><YAxis allowDecimals={false}/><Tooltip/><Bar name="Participações" dataKey="v" fill="#2563eb" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></div></div>;
  const overview=<><div className="grid-three">{(role==="estudante" ? [["Inscrições",data.events.length],["Candidaturas",data.jobs.length],["Projetos",rows("projeto").length]] : role==="empresa" ? [["Eventos simulados",rows("evento").length],["Inscritos de exemplo",2],["Vagas simuladas",rows("vaga").length]] : [["Cursos de exemplo",3],["Atividades solicitadas",rows("solicitação").length],["Parceiros de exemplo",companies.length]]).map(([label,value])=><div className="card card-body" key={label}><p className="muted">{label}</p><p className="metric">{value}</p></div>)}</div><div className="stack">{role==="estudante"?<><div className="card card-body"><h3>Progresso do perfil</h3><label>Nome e tipo de perfil preenchidos <progress value={2} max={3}/></label></div><h3>Próximos eventos recomendados</h3>{eventList()}<h3>Histórico de inscrições</h3>{data.events.length ? eventList(true) : <p className="notice">Você ainda não tem inscrições simuladas.</p>}</>:<>{chart}{role==="empresa" && <><h3>Próximas atividades</h3>{list("evento")}</>}</>}</div></>;
  let content;
  switch(tab){
    case "Visão geral":content=overview;break;
    case "Eventos":
    case "Eventos disponíveis":content=eventList();break;
    case "Minhas inscrições":content=data.events.length?eventList(true):<p className="notice">Nenhuma inscrição simulada.</p>;break;
    case "Oportunidades":content=role==="empresa"?list("vaga"):jobList();break;
    case "Minhas candidaturas":content=data.jobs.length?jobList(true):<p className="notice">Nenhuma candidatura simulada.</p>;break;
    case "Criar evento":content=<PostForm key={tab} type="evento" post={post}/>;break;
    case "Publicar vaga":content=<PostForm key={tab} type="vaga" post={post}/>;break;
    case "Solicitar atividade":content=<><PostForm key={tab} type="solicitação" post={post}/>{list("solicitação")}</>;break;
    case "Portfólio":content=<><PostForm key={tab} type="projeto" post={post}/>{list("projeto")}</>;break;
    case "Meus eventos":content=list("evento");break;
    case "Relatórios":content=chart;break;
    case "Empresas parceiras":content=<div className="grid-three">{companies.map(item=><CompanyCard key={item.id} item={item}/>)}</div>;break;
    case "Certificados":content=<p className="notice">Nenhum certificado emitido nesta demonstração.</p>;break;
    case "Estudantes vinculados":content=<Sample rows={["Estudante A · Informática","Estudante B · Administração"]}/>;break;
    case "Cursos técnicos":content=<Sample rows={["Informática","Administração","Automação Industrial"]}/>;break;
    case "Escolas parceiras":content=<Sample rows={["Escola Técnica Modelo · Campinas","Instituto Técnico Exemplo · Sorocaba"]}/>;break;
    case "Inscrições":content=<div className="stack">{["Estudante A","Estudante B"].map(name=><label key={name} className="card card-body row">{name} · Inscrição de exemplo<input type="checkbox" checked={rows("presença").some(item=>item.id===name)} onChange={event=>event.target.checked?post({id:name,title:name,type:"presença",description:"Presença simulada"}):commit({...data,posts:data.posts.filter(item=>item.id!==name)},"Presença removida.")}/> Presença</label>)}</div>;break;
    case "Configurações":content=<button className="button outline" onClick={()=>{signOutDemoAccount();router.push("/entrar");}}>Sair da sessão</button>;break;
    default:content=<div className="card card-body prose"><p>Nome de demonstração · {profile.name}</p><p>Perfil · {roles[role]}</p></div>;
  }
  return <><section className="banner"><div className="wrap"><p className="eyebrow">{roles[role]} · Demonstração</p><h1>Olá, {profile.name}</h1><p className="muted">As alterações ficam neste navegador.</p></div></section><section className="section wrap dashboard"><aside className="card card-body"><button className="button outline full" aria-expanded={showMenu} aria-controls="painel-menu" onClick={()=>setShowMenu(!showMenu)}>{showMenu?"Recolher menu":"Abrir menu"}</button>{showMenu&&<nav id="painel-menu" className="dash-nav" aria-label="Painel">{menus[role].map(label=><button key={label} aria-current={tab===label?"page":undefined} onClick={()=>{setTab(label);setMessage("");}}>{label}</button>)}</nav>}</aside><div className="dash-content"><h2>{tab}</h2><p role="status" className={message?"notice":undefined}>{message}</p>{content}</div></section></>;
}
function Sample({rows}:{rows:string[]}){
  return <ul className="stack">{rows.map(row=><li className="card card-body" key={row}>{row}</li>)}</ul>;
}
const schema=z.object({title:z.string().trim().min(3,"Informe pelo menos três caracteres.").max(100),description:z.string().trim().min(10,"Informe pelo menos dez caracteres.").max(2000)});
function PostForm({type,post}:{type:string;post:(item:DemoData["posts"][number])=>boolean}){
  const [problem,setProblem]=useState("");
  const [bannerKey, setBannerKey] = useState(0);
  const form=useForm<z.infer<typeof schema>>({resolver:zodResolver(schema)});
  return <form className="form card card-body" onSubmit={event=>{
    const fields=new FormData(event.currentTarget);
    void form.handleSubmit(async values=>{
      setProblem("");
      const entry:DemoData["posts"][number]={...values,id:crypto.randomUUID(),type};
      if(type==="evento"){
        const read=(key:string)=>String(fields.get(key) ?? "");
        Object.assign(entry,{date:read("date"),time:read("time"),city:read("city"),location:read("location"),course:read("course"),requirements:read("requirements"),seats:Number(read("seats")),description:read("category")+" · "+entry.description});
        try { entry.image = await readEventBanner(fields.get("image")); }
        catch (error) { setProblem(error instanceof Error ? error.message : "Não foi possível abrir a imagem."); return; }
      }
      if(type==="solicitação")entry.description=String(fields.get("company"))+" · "+String(fields.get("activity"))+" · "+entry.description;
      if(post(entry)){form.reset();(event.target as HTMLFormElement).reset();setBannerKey(value => value + 1);}
    })(event);
  }}><label className="field">Título<input {...form.register("title")} maxLength={100}/>{form.formState.errors.title && <small>{form.formState.errors.title.message}</small>}</label><label className="field">Descrição<textarea {...form.register("description")} rows={4} maxLength={2000}/>{form.formState.errors.description && <small>{form.formState.errors.description.message}</small>}</label>{type==="evento" && <><label className="field">Categoria<select name="category">{categories.slice(0,4).map(item=><option key={item.name}>{item.name}</option>)}</select></label><div className="filters"><label className="field">Data<input required type="date" name="date"/></label><label className="field">Horário<input required type="time" name="time"/></label><label className="field">Vagas<input required type="number" min="1" max="500" name="seats"/></label></div>{[["Cidade","city"],["Local","location"],["Cursos recomendados","course"],["Requisitos","requirements"]].map(([label,name])=><label className="field" key={name}>{label}<input required name={name} maxLength={160}/></label>)}<EventBannerField key={bannerKey}/></>}{type==="solicitação" && <><label className="field">Empresa<select name="company">{companies.map(c=><option key={c.id}>{c.name}</option>)}</select></label><label className="field">Atividade<select name="activity"><option>Palestra</option><option>Visita técnica</option></select></label></>}{problem && <p role="alert" className="error">{problem}</p>}<button className="button primary" disabled={form.formState.isSubmitting}>Salvar {type} de demonstração</button></form>;
}
