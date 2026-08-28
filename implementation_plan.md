# Plano de Implementação: Migração para a Nuvem (Supabase)

Migrar os dados do calendário (projetos, cartões e textos) do armazenamento local (`localStorage`) para o banco de dados em nuvem do Supabase, permitindo que os dados sejam acessados de qualquer dispositivo.

## 1. Banco de Dados (SQL)
Criaremos um schema dedicado e uma tabela no Supabase para armazenar os projetos, seguindo as regras de arquitetura que definimos:
```sql
CREATE SCHEMA whats_calendar;

CREATE TABLE whats_calendar.projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  updatedAt TEXT,
  isFreeMode BOOLEAN,
  slides JSONB,
  columns JSONB
);

-- Permissões de Acesso (RLS) para permitir uso anônimo no momento
CREATE POLICY "Acesso livre projetos" ON whats_calendar.projects FOR ALL USING (true) WITH CHECK (true);
```

## 2. Refatoração no Código (Frontend)
- **Arquivo Alvo:** `src/hooks/useProjects.js`
- **O que será feito:** 
  - Vamos substituir o `localStorage.getItem` por uma chamada ao banco de dados: `supabase.schema('whats_calendar').from('projects').select('*')`.
  - A função `saveToStorage` que hoje salva no navegador, passará a fazer `upsert` (inserir ou atualizar) no banco de dados da nuvem sempre que um projeto for modificado.
  - Para não travar a interface do usuário com a lentidão da internet, usaremos as atualizações na nuvem de forma assíncrona ("background sync"), enquanto mantemos a interface instantânea.

## 3. Benefícios Esperados
- Você poderá abrir o Whats Calendar no computador e no celular, e verá os mesmos cartões, textos e projetos.
- A segurança dos seus dados não dependerá mais de "não limpar os cookies" do navegador.

## 4. O que o Usuário Precisa Fazer
- Após eu aplicar essas alterações, vou precisar que você abra novamente o **SQL Editor** do Supabase e rode o código SQL de criação da tabela. Apenas isso.

## Aguardando Aprovação
Por favor, clique em "Proceed" se você aprova este plano e deseja iniciar a migração agora!
