# Family Pom's — site do canil

Site completo (área pública + painel administrativo) para o canil Family Pom's,
especializado em Chihuahua e Spitz Alemão. Construído em Next.js 14 (App
Router) + TypeScript, com banco de dados próprio e painel administrativo sem
necessidade de mexer em código para o dia a dia.

Este projeto segue o planejamento técnico e visual aprovado anteriormente
(arquitetura, entidades, regras de negócio e identidade visual). A única
mudança em relação ao planejamento original é o banco de dados: veja a nota
"Sobre o banco de dados" abaixo.

---

## 1. Requisitos

- Node.js 18.18 ou superior (recomendado 20+)
- npm 9+

Nenhum banco de dados externo, conta de nuvem ou variável de API é necessário
para rodar o projeto localmente — tudo funciona "out of the box".

## 2. Instalação e primeiro uso

```bash
# 1. Instalar as dependências
npm install

# 2. Criar as tabelas do banco de dados
npm run db:migrate

# 3. Popular o banco com o administrador inicial e alguns dados de exemplo
npm run seed

# 4. Rodar em modo desenvolvimento
npm run dev
```

Acesse:
- Site público: http://localhost:3000
- Painel administrativo: http://localhost:3000/admin/login

**Credenciais do administrador inicial** (definidas em `.env`, usadas pelo
`npm run seed`):
- E-mail: `admin@familypoms.com.br`
- Senha: `TrocarSenha123!`

> ⚠️ **Troque essa senha e esse e-mail antes de publicar o site.** Edite as
> variáveis `ADMIN_NOME`, `ADMIN_EMAIL` e `ADMIN_SENHA` no arquivo `.env`
> *antes* de rodar `npm run seed` pela primeira vez em produção — o script só
> cria o administrador se ele ainda não existir, então isso deve ser feito
> uma única vez, num ambiente seguro. Não deixe essas variáveis no `.env` de
> produção depois disso.

Atalho: `npm run setup` roda `db:migrate` + `seed` de uma vez.

## 3. Scripts disponíveis

| Comando | O que faz |
|---|---|
| `npm run dev` | Roda o site em modo desenvolvimento (http://localhost:3000) |
| `npm run build` | Gera a build de produção |
| `npm run start` | Roda a build de produção (rode `npm run build` antes) |
| `npm run db:generate` | Gera novas migrações SQL a partir de alterações em `src/lib/db/schema.ts` |
| `npm run db:migrate` | Aplica as migrações no banco (`dev.db`) |
| `npm run seed` | Popula o banco com o admin inicial e dados de exemplo |

## 4. Estrutura do projeto

```text
family-poms/
├── drizzle/                  # Migrações SQL geradas (não editar à mão)
├── public/
│   ├── assets/logo/          # Logo oficial do canil
│   ├── uploads/              # Fotos enviadas pelo painel (filhotes, institucional)
│   └── favicon.ico, icon-*.png
├── scripts/
│   ├── migrate.ts            # Aplica as migrações no banco
│   └── seed.ts                # Cria o admin inicial e dados de exemplo
├── src/
│   ├── app/
│   │   ├── (public)/         # Área pública: home, sobre, filhotes, quiz...
│   │   ├── admin/            # Painel administrativo (rotas protegidas)
│   │   └── api/quiz/         # Rota usada pelo quiz para calcular o resultado
│   ├── components/
│   │   ├── ui/                # Botão, badge, carrossel, accordion...
│   │   ├── public/            # Header, footer, cards do site público
│   │   └── admin/             # Sidebar, formulários do painel
│   └── lib/
│       ├── db/                 # Conexão + schema do banco (Drizzle ORM)
│       ├── services/           # Regras de negócio (uma por entidade)
│       ├── actions/            # Server Actions chamadas pelos formulários do painel
│       ├── auth.ts             # Sessão, hash de senha
│       ├── storage.ts          # Upload/validação/remoção de imagens
│       ├── utils.ts            # Cálculo de idade, slugs, formatação
│       └── validators.ts       # Schemas de validação (Zod)
└── src/middleware.ts          # Protege todas as rotas /admin/**
```

Cada arquivo em `src/lib/services` e `src/lib/actions` tem comentários
explicando sua finalidade e como se relaciona com o restante do sistema,
como combinado no planejamento.

## 5. Sobre o banco de dados (mudança em relação ao planejamento original)

O planejamento original previa **Prisma + PostgreSQL** em produção (com
SQLite apenas para desenvolvimento). Ao montar o ambiente de implementação,
o binário nativo que o Prisma precisa baixar não pôde ser obtido (rede deste
ambiente de desenvolvimento bloqueia o domínio de onde o Prisma baixa seus
executáveis). Para não travar o projeto, o banco de dados foi implementado
com **Drizzle ORM**, que é 100% JavaScript/TypeScript (sem binário nativo
próprio) e igualmente robusto e tipado.

O que isso muda na prática:
- **Nenhuma entidade, regra de negócio ou funcionalidade foi alterada** — o
  `src/lib/db/schema.ts` implementa exatamente as mesmas tabelas e campos
  descritos no documento de planejamento.
- O banco usado agora é **SQLite** (arquivo local `dev.db`), o que também
  simplifica a demonstração: não é preciso configurar nenhum servidor de
  banco de dados para rodar o projeto.
- Para produção, há duas opções, dependendo do volume esperado:
  1. **Manter SQLite em produção** com um serviço de disco persistente (ex.:
     um volume no provedor de hospedagem, ou serviços como Turso/LiteFS que
     replicam SQLite). Funciona bem para o volume de dados de um canil.
  2. **Migrar para PostgreSQL**, como planejado originalmente — o Drizzle
     suporta Postgres com uma API praticamente idêntica; a migração envolve
     trocar o driver em `src/lib/db/index.ts` (de
     `drizzle-orm/better-sqlite3` para `drizzle-orm/node-postgres` ou
     `drizzle-orm/postgres-js`) e ajustar alguns tipos específicos de SQLite
     no `schema.ts` (ex.: booleans, que no Postgres têm tipo nativo). Os
     serviços em `src/lib/services` não precisam mudar.

Se você preferir seguir com Prisma + Postgres assim que o projeto for
implantado num ambiente com acesso à internet completo, isso é totalmente
viável — me avise e adapto o projeto.

## 6. Armazenamento de imagens

Nesta versão, as imagens enviadas pelo painel são salvas em
`public/uploads/` (no próprio servidor). Cada upload é validado (tipo e
tamanho) e processado com a biblioteca `sharp`, gerando uma versão otimizada
(WEBP, até 1600px) e uma miniatura (400px), como definido no planejamento.

Para produção com múltiplos servidores ou maior volume de imagens,
troque a implementação de `src/lib/storage.ts` por chamadas a um object
storage compatível com S3 (ex.: Cloudflare R2) — a assinatura das funções
`salvarImagem`/`removerImagem` foi projetada para que essa troca não exija
mudanças em nenhum outro arquivo do projeto.

## 7. Autenticação e segurança

- Senha do administrador com hash `bcrypt` (nunca texto puro).
- Sessão via cookie assinado (JWT), `httpOnly`, `secure` em produção,
  `sameSite=strict`.
- `src/middleware.ts` bloqueia qualquer acesso a `/admin/**` sem sessão
  válida (exceto a própria tela de login), redirecionando para o login.
- Toda validação de formulário é refeita no servidor (Zod), mesmo que o
  navegador já valide — o painel nunca confia apenas no front-end.
- Mensagens de erro de login são sempre genéricas ("E-mail ou senha
  inválidos"), sem indicar qual dos dois campos está errado.

### Adicionar mais administradores no futuro

Ainda não há uma tela para isso no painel (fica como próximo passo natural).
Por enquanto, um novo administrador pode ser criado rodando um script
semelhante ao `scripts/seed.ts` com os dados da nova pessoa, ou diretamente
via uma consulta `INSERT` usando o mesmo mecanismo de hash de senha
(`hashSenha`, em `src/lib/auth.ts`).

## 8. O que já está implementado

**Área pública:** Home, Sobre o canil (com tempo de atuação calculado
automaticamente), Galeria institucional, Catálogo de filhotes com filtro por
raça/status, ficha individual do filhote (galeria de fotos com legendas
próprias), Quiz interativo de raças (com resultado educativo, sem promessas),
Depoimentos, FAQ, Contato, política de privacidade e termos de uso.

**Painel administrativo:** login seguro, dashboard com contadores, CRUD
completo de filhotes (incluindo múltiplas fotos com legenda individual, foto
principal, arquivamento e exclusão definitiva com confirmação), galeria
institucional (categorias, destaque, ocultar/reativar), depoimentos (com
moderação — pendente/publicado/oculto), FAQ, quiz (perguntas, alternativas e
pesos de pontuação), conteúdo institucional e configurações gerais
(WhatsApp, Instagram, SEO, textos legais).

Todo o site foi testado de ponta a ponta neste ambiente antes da entrega:
login, proteção de rotas administrativas, criação de filhote, upload de
foto com geração de miniatura, exibição correta de filhotes vendidos vs.
disponíveis, moderação de depoimentos e cálculo do resultado do quiz.

## 9. Próximos passos sugeridos (não implementados nesta versão)

Ficam como evolução natural do projeto, sem bloquear o uso do site:

- Tela de gerenciamento de múltiplos administradores pelo próprio painel.
- Recuperação de senha por e-mail (exige configurar um serviço de envio de
  e-mails, ex. Resend ou SendGrid).
- Conteúdos educativos (seção opcional do planejamento) — a tabela já existe
  no banco (`conteudosEducativos`), faltam as telas.
- Log de alterações (auditoria) — a tabela já existe (`logsAlteracao`),
  falta popular nas ações administrativas.
- Testes automatizados (unitários/E2E) cobrindo os fluxos críticos.
- Deploy: recomendação é Vercel (ou outro host Node) + volume persistente
  para `dev.db` e `public/uploads`, ou migração para Postgres + object
  storage conforme a seção 5 e 6 acima.

## 10. Suporte a acessibilidade e responsividade

- Mobile-first, testado visualmente em larguras pequenas e grandes.
- `prefers-reduced-motion` respeitado (animações desligadas automaticamente).
- Navegação por teclado: menu mobile, carrossel (setas ←/→) e accordion do
  FAQ funcionam sem mouse.
- Textos alternativos em imagens, foco visível em todos os elementos
  interativos, estrutura semântica (landmarks, headings).
