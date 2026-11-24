import Link from "next/link";
import { AudioLines, BookOpen, BriefcaseBusiness, Building2, CodeXml, Factory, GraduationCap, Sparkles, Users, Zap } from "lucide-react";
import { categories, companies, jobs } from "@/lib/catalog";
import { CompanyCard, JobCard } from "@/components/cards";
import { Photo } from "@/components/photo";
import { CompanyPlans } from "@/components/company-plans";
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
    <div className="categories">
      {categories.map((category, index) => {
        const Icon = icons[category.icon];
        const catalog = index < 4 ? "/eventos" : "/oportunidades";

        return <Reveal key={category.name} delay={index * 0.045}>
          <Link className="card category" href={catalog + "?categoria=" + encodeURIComponent(category.name)}>
            <div className="category-cover">
              <Photo image={category.image} decorative sizes="(max-width: 560px) 50vw, (max-width: 1050px) 33vw, 200px"/>
            </div>
            <div className="category-body">
              <span className={"tile-icon " + category.color} aria-hidden="true"><Icon size={20}/></span>
              <h3>{category.name}</h3>
              <p>{category.text}</p>
            </div>
          </Link>
        </Reveal>;
      })}
    </div></section>
    <section className="section tinted"><div className="wrap"><Reveal><div className="section-heading has-action"><div><p className="eyebrow">Próximos eventos</p><h2>Experiências que transformam seu futuro.</h2>{!firebaseConfigured && <p>Explore atividades demonstrativas em tecnologia, indústria e carreira.</p>}</div><Link className="button outline" href="/eventos">Ver todos os eventos</Link></div></Reveal><Reveal>{firebaseConfigured ? <FirebaseEventCatalog/> : <CatalogView kind="eventos" initialCategory=""/>}</Reveal></div></section>
    <section className="section wrap"><Reveal><div className="section-heading has-action"><div><p className="eyebrow">Carreira</p><h2>Oportunidades para começar</h2><p>Encontre estágios, programas de aprendizagem e vagas de primeiro emprego.</p></div><Link className="button outline" href="/oportunidades">Ver oportunidades</Link></div></Reveal><div className="grid-three">{jobs.map((item, index) => <Reveal key={item.id} delay={index * 0.06}><JobCard item={item}/></Reveal>)}</div></section>
    <section className="section tinted"><div className="wrap"><Reveal><div className="section-heading has-action"><div><p className="eyebrow">Empresas parceiras</p><h2>Conheça quem forma novos talentos</h2><p>Explore os perfis demonstrativos de organizações de diferentes setores.</p></div><Link className="button outline" href="#planos">Ver planos para empresas</Link><Link className="button outline" href="/empresas">Ver catálogo</Link></div></Reveal><div className="grid-three">{companies.map((item, index) => <Reveal key={item.id} delay={index * 0.06}><CompanyCard item={item}/></Reveal>)}</div></div></section>
    <CompanyPlans/>
    <section className="section tinted"><div className="wrap"><Reveal><div className="cta"><div><h2>Conectando talentos às oportunidades do futuro.</h2><p>Educação, empresas e oportunidades reunidas em um só lugar.</p></div><Link className="button white" href="/cadastro">Criar conta de demonstração</Link></div></Reveal></div></section>
  </>;
}
