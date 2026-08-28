# Arquitetura e Padrões do Whats Calendar

Este documento serve de guia para futuros agentes de IA e desenvolvedores que trabalharem neste projeto.

## Supabase (Projeto Compartilhado)
O usuário utiliza **UM ÚNICO PROJETO DO SUPABASE** para hospedar a infraestrutura de **múltiplos aplicativos**. 
Para manter a organização e não haver conflito de dados com outros apps, devemos seguir estritamente as regras abaixo:

### 1. Storage (Armazenamento de Arquivos)
- **Bucket:** Usamos um bucket público genérico chamado `images`.
- **Organização (Pastas):** Todos os arquivos e uploads referentes a ESTE aplicativo devem ser salvos dentro do caminho (pasta) `whats-calendar/`.
- **Exemplo de Upload:**
  ```javascript
  // Correto:
  supabase.storage.from('images').upload(`whats-calendar/${fileName}`, file);
  // Incorreto (vai misturar com outros apps):
  supabase.storage.from('images').upload(fileName, file);
  ```

### 2. Database (Tabelas e Dados)
- Atualmente, os projetos e slides são salvos apenas no `localStorage` do navegador.
- **Regra para o Futuro:** Se formos migrar os dados para o banco de dados em nuvem, **NÃO crie tabelas no schema `public` padrão**.
- Devemos utilizar **Database Schemas** (como se fossem pastas para tabelas). 
- O schema dedicado para este app deverá se chamar `whats_calendar`.
- **Exemplo SQL para o futuro:** `CREATE SCHEMA whats_calendar; CREATE TABLE whats_calendar.projetos (...);`

## Tecnologias Atuais
- React + Vite
- TailwindCSS
- Lucide React (Ícones)
- React SortableJS (Drag and drop)
- Armazenamento de estado global simples via hooks locais e LocalStorage.
