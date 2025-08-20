# Noxora - Sistema SaaS Multi-tenant para Barbearia

Sistema completo de agendamento para barbearias com arquitetura multi-tenant.

## 🚀 Setup Rápido

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar banco de dados
Crie um arquivo `.env` na raiz:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/noxora"
```

### 3. Configurar banco
```bash
npx prisma generate
npx prisma db push
```

### 4. Popular dados de teste
```bash
npm run db:seed
```

### 5. Rodar projeto
```bash
npm run dev
```

## 🧪 Testes das APIs

### Listar serviços
```bash
GET /api/services?slug=barbearia-dev
Header: x-tenant-id: dev-tenant-1
```

### Criar serviço
```bash
POST /api/services
Header: x-tenant-id: dev-tenant-1
Body: {
  "slug": "barbearia-dev",
  "name": "Sobrancelha",
  "durationMin": 15,
  "priceCents": 1500
}
```

### Fazer agendamento
```bash
POST /api/booking
Header: x-tenant-id: dev-tenant-1
Body: {
  "slug": "barbearia-dev",
  "serviceId": "<ID_DE_UM_SERVICE>",
  "employeeId": "emp-dev-1",
  "startAt": "2025-08-21T18:00:00.000Z",
  "client": {
    "name": "Maria",
    "phone": "55999999999"
  }
}
```

## 🏗️ Arquitetura

- **Frontend + Backend**: Next.js 15 (App Router)
- **Banco**: PostgreSQL com Prisma ORM
- **Validação**: Zod schemas
- **Multi-tenant**: Isolamento por tenantId
- **Cache**: Redis (Upstash) - próximo passo
- **Deploy**: Vercel

## 📁 Estrutura

```
src/
├── app/
│   └── api/
│       ├── services/route.ts    # CRUD de serviços
│       └── booking/route.ts     # Sistema de agendamentos
├── lib/
│   ├── prisma.ts               # Cliente Prisma
│   └── validators.ts           # Schemas Zod
prisma/
├── schema.prisma               # Schema do banco
└── seed.ts                     # Dados de teste
```
