import { firebaseConfigured } from "@/lib/firebase/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogView } from "@/components/catalog-view";
import { FirebaseEventCatalog } from "@/components/firebase-events";
import { AccountForm } from "@/components/account";

const headings = {
  eventos: ["Eventos","Experiências que transformam seu futuro.","Encontre palestras, workshops, capacitações e visitas técnicas."],
  oportunidades: ["Carreira","Oportunidades para começar","Encontre vagas alinhadas ao seu curso e à sua cidade."],
  empresas: ["Rede de parceiros","Empresas parceiras","Conheça organizações que aproximam a educação do mercado."],
};
export default async function PublicPage({params,searchParams}:{params:Promise<{area:string}>;searchParams:Promise<{categoria?:string;perfil?:string}>}) {
  const {area} = await params;
  const query = await searchParams;
  if(area === "eventos" || area === "oportunidades" || area === "empresas"){
    const [label,title,description] = headings[area];
    return <><section className="banner"><div className="wrap"><p className="eyebrow">{label}</p><h1>{title}</h1><p className="muted">{description}</p>{area === "empresas" && <div className="actions"><Link href="/cadastro?perfil=empresa" className="button primary">Quero ser empresa parceira</Link></div>}</div></section><section className="section wrap">{area === "eventos" && firebaseConfigured ? <FirebaseEventCatalog/> : <CatalogView key={query.categoria ?? ""} kind={area} initialCategory={query.categoria ?? ""}/>}</section></>;
  }
  if(area === "entrar" || area === "cadastro") return <section className="wrap section form-wrap">{!firebaseConfigured && <p className="eyebrow">Ambiente demonstrativo</p>}<h1>{area === "entrar" ? "Entrar" : "Criar conta"}</h1><AccountForm register={area === "cadastro"} initialRole={query.perfil}/></section>;
  if(area === "como-funciona" || area === "sobre") return <><section className="banner"><div className="wrap"><h1>{area === "sobre" ? "Sobre o Conecta Tec" : "Como funciona"}</h1><p className="muted">Educação, empresas e oportunidades reunidas em um só lugar.</p></div></section><section className="section wrap grid-three">{[
    ["Estudantes","Encontre experiências ligadas ao seu curso, simule inscrições e acompanhe suas candidaturas.","/eventos","Explorar eventos"],
    ["Empresas","Apresente seu trabalho, organize atividades e divulgue oportunidades para novos talentos.","/cadastro?perfil=empresa","Criar perfil de empresa"],
    ["Escolas","Acompanhe a participação dos estudantes e solicite palestras ou visitas técnicas.","/cadastro?perfil=escola","Criar perfil de escola"],
  ].map(([title,copy,url,label])=><article className="card card-body prose" key={title}><h2>{title}</h2><p>{copy}</p><Link className="button outline" href={url}>{label}</Link></article>)}</section></>;
  notFound();
}
