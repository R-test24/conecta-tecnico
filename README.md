# Conecta Tec

Plataforma demonstrativa para estudantes do Ensino Médio Integrado ao Técnico, empresas e escolas. Next.js App Router, TypeScript, Tailwind CSS, componentes locais no padrão shadcn/ui, Lucide, Motion, React Hook Form, Zod e Recharts.

## Executar localmente

Com Node.js 22 e npm, entre nesta pasta e execute:

```powershell
npm ci
npm run dev
```

Abra http://localhost:3000. Para validar: `npm run lint` e `npm run build`.

## Fluxos de demonstração

- Catálogos públicos de eventos, oportunidades e empresas com pesquisa, filtros, detalhes e paginação de eventos.
- Em `/cadastro`, crie uma conta de teste de estudante, empresa ou escola com nome, e-mail fictício e senha de pelo menos 8 caracteres. Depois entre em `/entrar` no mesmo navegador. A conta e os registros simulados ficam no armazenamento local.
- Como estudante, abra um evento ou vaga e confirme a simulação. Confira o resultado no painel. Projetos também podem ser adicionados ao portfólio.
- Como empresa, simule a criação de eventos e vagas e registre a presença nos inscritos de exemplo. Os rascunhos ficam no painel local.
- Como escola, simule pedidos de palestras e visitas e explore os relatórios de exemplo.
- Para abrir a demonstração de `/admin` sem Firebase, defina uma chave aleatória de pelo menos 32 caracteres em `ADMIN_DEMO_SECRET` no arquivo `.env.local` e reinicie o servidor. O servidor emite uma sessão separada com validade de uma hora. As ações do painel são demonstrativas e se encerram com a página. Por padrão, a rota retorna 404.

## Firebase

Para testar contas persistentes, copie `.env.example` para `.env.local`, preencha os cinco campos públicos do aplicativo Web e habilite E-mail/Senha no Firebase Authentication. O projeto Firebase precisa ter um banco Firestore e as regras versionadas de perfis aplicadas.

Com a configuração completa, `/cadastro` cria uma conta e grava o perfil privado em `profiles/{uid}`, `/entrar` autentica com e-mail e senha, e `/painel` carrega o perfil ou permite concluir seu preenchimento. O papel solicitado no cadastro não concede permissões institucionais. Com a configuração ausente, os fluxos demonstrativos continuam disponíveis. O catálogo de eventos passa a consultar o Firestore.

Para uma operação real ainda são necessários gestão institucional, autorizações de participação, moderação, trilha administrativa persistente e políticas de privacidade para perfis de menores. As regras precisam ser validadas no Emulator Suite com o esquema definitivo antes de qualquer publicação.

### Piloto de eventos

Com o Firebase configurado, a lista em `/eventos` mostra os eventos publicados no Firestore. O catálogo de demonstração aparece quando falta a configuração do Firebase.

1. Aplique `firestore.rules` ao Firestore do projeto escolhido e habilite E-mail/Senha no Firebase Authentication.
2. Cadastre uma conta do tipo Empresa. O administrador aprova a empresa pelo painel `/admin`.
3. No painel dessa conta, envie um evento futuro. Aprove e publique o evento em `/admin`. Em outra sessão, cadastre um Estudante, abra o evento no catálogo e confirme a inscrição.
4. No painel da empresa, abra **Ver inscritos**. A lista mostra apenas o nome informado pelo estudante, e a vaga é contabilizada na mesma transação da inscrição.

Para testar em casa com dados fictícios, coloque `NEXT_PUBLIC_FIREBASE_EMULATORS=true` no `.env.local`, inicie os serviços com `npx.cmd firebase-tools emulators:start --only auth,firestore --project demo-conecta-tecnico` e rode `npm.cmd run dev` em outro terminal. Use a interface do emulador em `http://localhost:4000` para criar a primeira conta administrativa. Esse modo funciona no servidor de desenvolvimento e dispensa as credenciais do Firebase em nuvem.

O piloto usa horário de Brasília e admite de 1 a 500 vagas por evento. O catálogo externo de vagas e empresas continua demonstrativo.

### Administração

Com Firebase habilitado, acesse `/admin` e entre com uma conta administrativa. Para habilitar o primeiro administrador em um projeto novo, crie uma conta separada em Authentication e, usando o Console Firebase ou o painel do emulador, crie o documento `administrators/{uid}` com `enabled: true`. O campo habilita o acesso. Para revogá-lo, altere o valor para `false` ou remova o documento.

O administrador aprova empresas, revisa eventos enviados por elas e pode publicar um evento diretamente em nome do Conecta Tec. Eventos de empresa começam como **Aguardando aprovação** e aparecem no catálogo depois de aprovados.

## Fotografias

As imagens armazenadas em `public/images` são ilustrativas. As pessoas e locais retratados não representam participantes ou parceiros dos registros fictícios. Consulte a [licença Unsplash](https://unsplash.com/license) e os [termos](https://unsplash.com/terms).

- Hero, © This is Engineering. [Fotografia original](https://unsplash.com/photos/group-of-people-sitting-on-chair-in-front-of-table-with-laptop-computers-FXgbqr-t7uw)
- [Tecnologia](https://images.unsplash.com/photo-1516321318423-f06f85e504b3)
- [Indústria](https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7)
- [Palestra](https://images.unsplash.com/photo-1540575467063-178a50c2df87)
- [Gestão](https://images.unsplash.com/photo-1522071820081-009f0129c71c)
- [Automação](https://images.unsplash.com/photo-1581092160607-ee22621dd758)
- [Carreira](https://images.unsplash.com/photo-1551836022-d5d88e9218df)
