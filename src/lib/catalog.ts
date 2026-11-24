export const companies = [
  { id: "nexora", name: "Nexora Tecnologia", mark: "N", category: "Tecnologia", city: "São Paulo", image: "web", description: "Desenvolvimento de produtos digitais e formação de novos talentos em tecnologia." },
  { id: "vertice", name: "Vértice Industrial", mark: "V", category: "Indústria", city: "Campinas", image: "industry", description: "Soluções industriais em automação, manufatura e manutenção de equipamentos." },
  { id: "horizonte", name: "Instituto Horizonte", mark: "H", category: "Educação", city: "Sorocaba", image: "talk", description: "Formação profissional e orientação para o primeiro emprego." },
];
export const categories = [
  { name: "Palestras", icon: "mic", image: "talk", color: "blue", text: "Aprenda com quem atua no mercado." },
  { name: "Visitas técnicas", icon: "factory", image: "industry", color: "green", text: "Conheça empresas por dentro." },
  { name: "Capacitações", icon: "book", image: "management", color: "purple", text: "Desenvolva novas habilidades." },
  { name: "Workshops", icon: "code", image: "web", color: "orange", text: "Coloque a mão na massa." },
  { name: "Estágios", icon: "case", image: "hero", color: "blue", text: "Comece sua carreira na prática." },
  { name: "Jovem Aprendiz", icon: "users", image: "career", color: "green", text: "Dê o primeiro passo profissional." },
] as const;
export const photographs: Record<string, string> = {
  hero: "Três profissionais consultam um notebook em um ambiente industrial",
  web: "Equipe trabalhando em computadores",
  industry: "Profissionais acompanhando equipamentos em uma fábrica",
  talk: "Público acompanhando uma apresentação",
  management: "Equipe reunida em uma mesa de trabalho",
  automation: "Equipamentos e componentes industriais",
  career: "Profissionais conversando em uma mesa",
};
const eventRows = [
  ["web", "Workshop de Desenvolvimento Web", 3, 0, "2026-12-05", "09:00", 30, "Crie uma página responsiva e publique seu primeiro projeto com orientação de profissionais."],
  ["industry", "Visita Técnica à Indústria", 1, 1, "2026-12-09", "14:00", 25, "Acompanhe uma linha de produção, conheça as etapas de montagem e converse com a equipe técnica."],
  ["talk", "Palestra sobre Inteligência Artificial", 0, 0, "2026-12-12", "10:00", 60, "Veja usos de IA no trabalho técnico e discuta os limites das ferramentas em projetos reais."],
  ["management", "Capacitação em Gestão Empresarial", 2, 2, "2027-01-14", "14:00", 20, "Pratique planejamento, divisão de tarefas e acompanhamento de resultados com um estudo de caso."],
  ["automation", "Introdução à Automação Industrial", 3, 1, "2027-01-20", "09:30", 16, "Explore sensores e controladores e monte uma bancada de automação em equipe."],
  ["career", "Preparação para o Primeiro Emprego", 2, 2, "2027-01-26", "13:30", 35, "Revise seu currículo e simule uma entrevista com orientação de profissionais de recrutamento."],
] as const;
export const events = eventRows.map(([id,title,category,company,date,time,seats,description]) => ({
  id, title, category: categories[category].name, company: companies[company], date, time, seats, description, image: id,
  audience: "Estudantes do Ensino Médio Integrado ao Técnico", location: "Unidade de formação · endereço demonstrativo",
  requirements: id === "industry" ? "Usar calçado fechado e seguir as orientações de segurança da equipe." : "Estar cursando o Ensino Médio Integrado ao Técnico.",
  contact: "Equipe de formação",
}));
export const jobs = [
  { id: "estagio-web", title: "Estágio em Desenvolvimento Web", category: "Estágios", company: companies[0], course: "Informática", mode: "Híbrido", date: "2027-01-12", description: "Apoie a criação e manutenção de interfaces web.", requirements: "Conhecimentos básicos de HTML e CSS.", benefits: "Bolsa-auxílio, vale-transporte e mentoria." },
  { id: "aprendiz-industrial", title: "Aprendiz de Operações Industriais", category: "Jovem Aprendiz", company: companies[1], course: "Automação Industrial", mode: "Presencial", date: "2027-01-18", description: "Acompanhe rotinas de produção com supervisão técnica.", requirements: "Disponibilidade no período da tarde.", benefits: "Vale-transporte e formação teórica." },
  { id: "assistente", title: "Assistente Administrativo", category: "Primeiro emprego", company: companies[2], course: "Administração", mode: "Presencial", date: "2027-01-25", description: "Apoie rotinas administrativas e atendimento.", requirements: "Formação técnica em Administração.", benefits: "Vale-alimentação e vale-transporte." },
];
export const formatDate = (date: string) => new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(date));
