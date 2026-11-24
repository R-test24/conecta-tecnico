import { firebaseConfigured } from "@/lib/firebase/client";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CatalogView } from "@/components/catalog-view";
import { FirebaseEventCatalog } from "@/components/firebase-events";
import { FirebaseAccount } from "@/components/firebase-account";

const headings = {
  eventos: ["Eventos","Experiências que transformam seu futuro.","Encontre palestras, workshops, capacitações e visitas técnicas."],
  oportunidades: ["Carreira","Oportunidades para começar","Encontre vagas alinhadas ao seu curso e à sua cidade."],
  empresas: ["Rede de parceiros","Empresas parceiras","Conheça organizações que aproximam a educação do mercado."],
};
export default async function PublicPage({params,searchParams}:{params:Promise<{area:string}>;searchParams:Promise<{categoria?:string;perfil?:string;modo?:string}>}) {
  const {area} = await params;
  const query = await searchParams;
  if (area === "empresa") {
    const register = query.modo === "cadastro";
    return <section className="wrap section form-wrap stack">
      <p className="eyebrow">Área da empresa</p>
      <h1>{register ? "Cadastro de empresa" : "Acesso empresarial"}</h1>
      <p className="muted">{register ? "Crie sua conta para solicitar acesso ao painel de eventos." : "Entre com seu e-mail e senha para gerenciar os eventos da empresa."}</p>
      {!firebaseConfigured && <p className="notice" role="status">O acesso empresarial será liberado após a configuração da autenticação do site.</p>}
      <FirebaseAccount register={register} company/>
      <Link className="button outline" href={register ? "/empresa" : "/empresa?modo=cadastro"}>
        {register ? "Já tenho conta" : "Cadastrar minha empresa"}
      </Link>
    </section>;
  }

  if ((area === "cadastro" || area === "entrar") && query.perfil === "empresa") {
    redirect(area === "cadastro" ? "/empresa?modo=cadastro" : "/empresa");
  }

  if(area === "eventos" || area === "oportunidades" || area === "empresas"){
    const [label,title,description] = headings[area];
    return <><section className="banner"><div className="wrap"><p className="eyebrow">{label}</p><h1>{title}</h1><p className="muted">{description}</p>{area === "empresas" && <div className="actions"><Link href="/empresa?modo=cadastro" className="button primary">Cadastrar empresa</Link><Link href="/empresa" className="button outline">Entrar como empresa</Link></div>}</div></section><section className="section wrap">{area === "eventos" && firebaseConfigured ? <FirebaseEventCatalog/> : <CatalogView key={query.categoria ?? ""} kind={area} initialCategory={query.categoria ?? ""}/>}</section></>;
  }
  if (area === "entrar" || area === "cadastro") {
    const register = area === "cadastro";
    return <section className="wrap section form-wrap stack">
      <h1>{register ? "Cadastro de estudante ou escola" : "Entrar"}</h1>
      <p className="muted">{register ? "Selecione o tipo de conta e informe seu nome, e-mail e senha." : "Use o e-mail e a senha da sua conta."}</p>
      {!firebaseConfigured && <p className="notice" role="status">O envio do formulário será liberado após a configuração da autenticação.</p>}
      <FirebaseAccount register={register} initialRole={query.perfil}/>
      <div className="actions">
        <Link className="button outline" href={register ? "/entrar" : "/cadastro"}>{register ? "Já tenho conta" : "Criar conta"}</Link>
        <Link className="button outline" href={register ? "/empresa?modo=cadastro" : "/empresa"}>Acesso para empresas</Link>
      </div>
    </section>;
  }
  if(area === "como-funciona" || area === "sobre") return <><section className="banner"><div className="wrap"><h1>{area === "sobre" ? "Sobre o Conecta Tec" : "Como funciona"}</h1><p className="muted">Educação, empresas e oportunidades reunidas em um só lugar.</p></div></section><section className="section wrap grid-three">{[
    ["Estudantes","Encontre experiências ligadas ao seu curso, simule inscrições e acompanhe suas candidaturas.","/eventos","Explorar eventos"],
    ["Empresas","Apresente seu trabalho, organize atividades e divulgue oportunidades para novos talentos.","/empresa?modo=cadastro","Cadastrar empresa"],
    ["Escolas","Acompanhe a participação dos estudantes e solicite palestras ou visitas técnicas.","/cadastro?perfil=escola","Criar perfil de escola"],
  ].map(([title,copy,url,label])=><article className="card card-body prose" key={title}><h2>{title}</h2><p>{copy}</p><Link className="button outline" href={url}>{label}</Link></article>)}</section></>;
  notFound();
}
