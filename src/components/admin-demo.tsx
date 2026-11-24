"use client";
import { useState } from "react";

const queues = {
  "Usuários": ["Estudante de exemplo", "Perfil profissional de exemplo"],
  "Empresas": ["Empresa de exemplo · Verificação pendente"],
  "Escolas": ["Escola de exemplo · Validação pendente"],
  "Eventos": ["Workshop de exemplo · Aprovação pendente"],
  "Vagas": ["Estágio de exemplo · Moderação pendente"],
  "Denúncias": ["Relato de exemplo · Triagem pendente"],
} as const;
type Queue = keyof typeof queues;
const queueNames=Object.keys(queues) as Queue[];
export function AdminDemo(){
  const [tab,setTab]=useState<Queue|"Categorias"|"Relatórios"|"Configurações">("Empresas");
  const [decisions,setDecisions]=useState<Record<string,string>>({});
  const [categories,setCategories]=useState(["Palestras","Visitas técnicas","Workshops"]);
  const [review,setReview]=useState(true);
  return <><section className="banner"><div className="wrap"><p className="eyebrow">Demonstração administrativa</p><h1>Moderação e operações</h1><p className="muted">Os registros e as decisões são exemplos da sessão atual.</p></div></section><section className="section wrap dashboard"><nav className="card card-body dash-nav" aria-label="Administração">{[...queueNames,"Categorias","Relatórios","Configurações"].map(name=><button aria-current={tab===name?"page":undefined} key={name} onClick={()=>setTab(name as typeof tab)}>{name}</button>)}</nav><div className="dash-content"><h2>{tab}</h2>{tab==="Categorias"?<><ul className="stack">{categories.map(name=><li className="card card-body row" key={name}>{name}<button className="button outline" onClick={()=>setCategories(categories.filter(item=>item!==name))}>Remover</button></li>)}</ul><form className="filters stack" onSubmit={event=>{event.preventDefault();const name=String(new FormData(event.currentTarget).get("name")??"").trim();if(name&&!categories.includes(name)){setCategories([...categories,name]);event.currentTarget.reset();}}}><label className="field">Nova categoria<input required name="name" maxLength={60}/></label><button className="button primary">Adicionar</button></form></>:tab==="Relatórios"?<div className="card card-body"><h3>Decisões nesta sessão</h3><p className="metric">{Object.keys(decisions).length}</p><ul>{Object.entries(decisions).map(([name,status])=><li key={name}>{name} · {status}</li>)}</ul></div>:tab==="Configurações"?<label className="card card-body row">Exigir revisão de eventos (simulação)<input type="checkbox" checked={review} onChange={event=>setReview(event.target.checked)}/></label>:<div className="stack">{queues[tab].map(name=><article key={name} className="card card-body row"><span>{name}</span>{decisions[name]?<strong role="status">{decisions[name]}</strong>:<div className="row"><button className="button primary" onClick={()=>setDecisions({...decisions,[name]:"Revisão concluída"})}>Concluir revisão</button><button className="button outline" onClick={()=>setDecisions({...decisions,[name]:"Devolvido para ajuste"})}>Solicitar ajuste</button></div>}</article>)}</div>}</div></section></>;
}
