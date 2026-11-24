import { BriefcaseBusiness, Building2, Check, Rocket } from "lucide-react";
import { Reveal } from "@/components/reveal";

const plans = [
  {
    name: "Essencial",
    price: 49,
    description: "Para empresas que querem testar a divulgação.",
    features: ["1 vaga ativa", "1 evento por mês", "Lista de inscritos por evento"],
    icon: BriefcaseBusiness,
    color: "blue",
  },
  {
    name: "Parceiro",
    price: 99,
    description: "Para empresas que oferecem oportunidades regularmente.",
    features: ["3 vagas ativas", "3 eventos por mês", "Lista de inscritos e registro de presença"],
    icon: Building2,
    color: "green",
  },
  {
    name: "Institucional",
    price: 199,
    description: "Para empresas que mantêm programas de formação e recrutamento.",
    features: ["10 vagas ativas", "6 eventos por mês", "Relatório de inscrições e participação"],
    icon: Rocket,
    color: "purple",
  },
];

export function CompanyPlans() {
  return <section id="planos" className="section wrap plans-section" aria-labelledby="plans-title">
    <Reveal>
      <div className="section-heading centered">
        <p className="eyebrow">Demonstração</p>
        <h2 id="plans-title">Planos para empresas</h2>
        <p>Divulgue vagas, palestras e visitas técnicas para estudantes.</p>
      </div>
    </Reveal>
    <div className="grid-three plans-grid">
      {plans.map(({ name, price, description, features, icon: Icon, color }, index) =>
        <Reveal key={name} delay={index * 0.06}>
          <article className={"card plan-card" + (index === 1 ? " plan-featured" : "")}>
            <span className={"tile-icon " + color} aria-hidden="true"><Icon size={22}/></span>
            <h3>{name}</h3>
            <p className="muted">{description}</p>
            <p className="plan-price"><strong>R$ {price}</strong><span> / mês</span></p>
            <ul>
              {features.map(feature => <li key={feature}><Check size={17} aria-hidden="true"/>{feature}</li>)}
            </ul>
          </article>
        </Reveal>
      )}
    </div>
    <p className="plans-note muted">Valores e recursos ilustrativos. Sem cobrança ou contratação. O acesso para estudantes é gratuito.</p>
  </section>;
}
