import Link from "next/link";
import { AudioLines, BookOpen, BriefcaseBusiness, Building2, CodeXml, Factory, GraduationCap, Sparkles, Users, Zap } from "lucide-react";
import { categories, companies, jobs } from "@/lib/catalog";
import { CompanyCard, JobCard } from "@/components/cards";
import { Photo } from "@/components/photo";
import { Reveal } from "@/components/reveal";
import { FirebaseEventCatalog } from "@/components/firebase-events";
import { firebaseConfigured } from "@/lib/firebase/client";
import { CatalogView } from "@/components/catalog-view";

const icons = { mic: AudioLines, factory: Factory, book: BookOpen, code: CodeXml, case: BriefcaseBusiness, users: Users };

export default function Home() {
  return <>
    <section className="hero"><div className="wrap hero-grid">
      <div className="hero-copy"><div className="hero-badge"><Sparkles size={15}/> Uma nova conexão entre educação e mercado.</div>
      <h1>Seu talento merece encontrar grandes <em>oportunidades.</em></h1>
      <p>Conectamos estudantes, escolas e empresas para transformar conhecimento em experiências reais, capacitação e desenvolvimento profissional.</p>
      <div className="actions"><Link className="button primary" href="/oportunidades">Explorar oportunidades</Link><Link className="button outline" href="/empresas"><Building2 size={17}/> Sou uma empresa</Link></div>
      <div className="benefits"><span><GraduationCap/> Ensino técnico</span><span><Users/> Conexões profissionais</span><span><Zap/> Aprendizado na prática</span></div></div>
      <div className="hero-visual"><Photo image="hero" priority/><Link className="float float-top" href="/oportunidades"><span className="tile-icon blue"><Zap size={20}/></span><div><strong>Novas oportunidades</strong><small>Explore vagas e estágios</small></div></Link><Link className="float float-bottom" href="/empresas"><span className="tile-icon green"><Building2 size={20}/></span><div><strong>Empresas parceiras</strong><small>Conheça o catálogo</small></div></Link></div>
    </div></section>
    <section className="section wrap"><Reveal><div className="section-heading centered"><p className="eyebrow">Explore por categoria</p><h2>Encontre seu próximo passo</h2><p>Descubra experiências para aprender, se conectar e começar sua carreira.</p></div></Reveal>
    <div className="categories">{categories.map((cat,index) => {const Icon=icons[cat.icon]; return <Link className="card category" key={cat.name} href={(index < 4 ? "/eventos" : "/oportunidades") + "?categoria=" + encodeURIComponent(cat.name)}><span className={"tile-icon "+cat.color}><Icon size={22}/></span><h3>{cat.name}</h3><p>{cat.text}</p></Link>;})}</div></section>
    <section className="section tinted"><div className="wrap"><div className="section-heading has-action"><div><p className="eyebrow">Próximos eventos</p><h2>Experiências que transformam seu futuro.</h2>{!firebaseConfigured && <p>Explore atividades demonstrativas em tecnologia, indústria e carreira.</p>}</div><Link className="button outline" href="/eventos">Ver todos os eventos</Link></div>{firebaseConfigured ? <FirebaseEventCatalog/> : <CatalogView kind="eventos" initialCategory=""/>}</div></section>
    <section className="section wrap"><div className="section-heading has-action"><div><p className="eyebrow">Carreira</p><h2>Oportunidades para começar</h2><p>Encontre estágios, programas de aprendizagem e vagas de primeiro emprego.</p></div><Link className="button outline" href="/oportunidades">Ver oportunidades</Link></div><div className="grid-three">{jobs.map(item => <JobCard key={item.id} item={item}/>)}</div></section>
    <section className="section tinted"><div className="wrap"><div className="section-heading has-action"><div><p className="eyebrow">Empresas parceiras</p><h2>Conheça quem forma novos talentos</h2><p>Explore os perfis demonstrativos de organizações de diferentes setores.</p></div><Link className="button outline" href="/empresas">Ver catálogo</Link></div><div className="grid-three">{companies.map(item => <CompanyCard key={item.id} item={item}/>)}</div></div></section>
    <section className="section wrap"><div className="cta"><div><h2>Conectando talentos às oportunidades do futuro.</h2><p>Educação, empresas e oportunidades reunidas em um só lugar.</p></div><Link className="button white" href="/cadastro">Criar conta de demonstração</Link></div></section>
  </>;
}
