# PRF Study — sincronização real de estudos (versão 2)

**GitHub Pages + Vue 3 + Tailwind/daisyUI + Cloudflare Worker + Cloudflare D1 (SQLite remoto).**

Este projeto conserva o cronograma de 365 dias da PRF, com 4 blocos de 30 minutos por dia, calendário, progresso, anotações, timer, simulados, caderno de erros, frases motivacionais e exportação de backup SQLite. **O progresso sincroniza entre navegador, celular e computador depois que a API é configurada e o estudante entra com a mesma senha.**

> Esta versão foi preparada a partir do projeto original. Ela está implementada e validada sintaticamente, mas o deploy real depende das suas contas Cloudflare e GitHub. Não é possível testar o Worker remoto sem as suas credenciais. Esta configuração é para **uma conta pessoal compartilhada entre seus próprios dispositivos**, não para vários usuários com dados independentes.

## 0. ANTES DE QUALQUER ALTERAÇÃO — preserve os dados já estudados

No site ANTIGO, no navegador onde você já marcou atividades:

1. Abra **Configurações → Baixar banco .sqlite**.
2. Guarde o arquivo exportado fora da pasta do repositório (em local privado).
3. Se o site estiver travado, tente `Ctrl+Shift+R` / `Ctrl+F5`; se necessário abra F12 → **Application → Service Workers → Unregister** e em **Cache Storage** remova **somente os caches** com nome `prf-study...`. Não clique em `Clear site data`, pois isso pode apagar o IndexedDB e o progresso antes do backup.
4. Com o backup salvo, continue o procedimento.

O arquivo `data/template.sqlite` incluído no repositório **não contém seu histórico**. Ele é somente o modelo inicial.

## 1. Requisitos

- Conta gratuita no **GitHub** (interface estática).
- Conta na **Cloudflare** (Worker e D1 no plano Free, sujeito a cotas).
- **Node.js 22+** e Git instalados (para rodar `npx wrangler@latest`).
- Python é opcional; `requirements.txt` é somente para rodar o servidor Flask local.
- Endereço GitHub Pages com HTTPS (ex.: `https://SEU_USUARIO.github.io/prf-study/`).

Arquitetura:

```text
GitHub Pages (HTML/Vue/CSS/JS)  -- HTTPS + senha -->  Cloudflare Worker (API)
         |                                                |
         |                                D1: SQLite persistente remoto
         |
         +-- IndexedDB: cache local + exportação de backup .sqlite
```

**GitHub Pages não possui backend e não consegue gravar SQLite no servidor.** O D1 é quem salva imediatamente a cada operação. Nada de enviar senhas, tokens ou arquivos com seu progresso para o repositório.

## 2. Configurar o Cloudflare D1 e o Worker

No terminal, na pasta `backend` deste projeto:

```powershell
cd backend
npx wrangler@latest login
npx wrangler@latest d1 create prf-study-db
```

O comando exibirá um **database_id** (UUID). Edite o arquivo `backend/wrangler.toml`:

```toml
[vars]
ALLOWED_ORIGIN = "https://SEU_USUARIO.github.io"   # origem SEM /prf-study/

[[d1_databases]]
binding = "DB"
database_name = "prf-study-db"
database_id = "COLE_O_UUID_GERADO"
```

> Se o Wrangler perguntar se quer atualizar o arquivo de configuração automaticamente, você pode responder **N** e preencher o `database_id` manualmente, como acima. Não deixe bindings D1 duplicados.

Crie as tabelas no banco remoto (é só na instalação ou ao criar uma nova tabela):

```powershell
npx wrangler@latest d1 execute prf-study-db --remote --file=./schema.sql
```

Crie **duas secrets**. O terminal solicitará os valores, sem colocar esses valores no código:

```powershell
npx wrangler@latest secret put APP_PASSWORD
npx wrangler@latest secret put SIGNING_SECRET
```

- `APP_PASSWORD`: senha **longa, exclusiva e difícil de adivinhar**. É ela que você usará ao entrar no site em todos os aparelhos.
- `SIGNING_SECRET`: texto aleatório **diferente da senha**, preferencialmente 64 caracteres ou mais. Gere em PowerShell com `-join (1..64 | ForEach-Object { 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'[(Get-Random -Max 57)] })` ou use um gerenciador de senhas com gerador forte. **Nunca comite essas secrets.**

Para publicar a API:

```powershell
npx wrangler@latest deploy
```

Copie o endereço retornado, semelhante a:

```
https://prf-study-api.SEU_SUBDOMINIO.workers.dev
```

Abra esse endereço com `/api/health` para confirmar a implantação (ele retorna um JSON de status, sem dados pessoais). Para testar a origem e o login, use o site publicado no GitHub Pages, não o arquivo `file://`.

## 3. Conectar a interface à API

Abra **`assets/config.js`** e configure:

```javascript
window.PRF_CONFIG = {
  apiBase: 'https://prf-study-api.SEU_SUBDOMINIO.workers.dev'
};
```

**A URL é pública; a senha NÃO deve aparecer nesse arquivo.** A senha é inserida pelo usuário na interface e validada pelo Worker, que guarda a secret.

O login é uma **conta pessoal única**. Para sincronizar Chrome, Firefox e celular, entre em todos com a mesma `APP_PASSWORD`. O token assinado fica neste navegador e vence depois de 30 dias. Se o usuário trocar a `SIGNING_SECRET`, precisará entrar novamente.

## 4. Publicar no GitHub Pages

Entre na pasta raiz do projeto, onde está o `index.html`:

```powershell
cd ..
git status
git add -A
git commit -m "Corrige cache e adiciona sincronização SQLite com Cloudflare D1"
git push origin main
```

Se ainda não iniciou o repositório Git:

```powershell
git init
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/prf-study.git
git add -A
git commit -m "PRF Study com sincronização na nuvem"
git push -u origin main
```

No GitHub, ative **Settings → Pages → Deploy from a branch → main → / (root)**. Abra `https://SEU_USUARIO.github.io/prf-study/`.

**Importante:** antes de enviar arquivos, confira `git status`. O `.gitignore` evita publicar backups pessoais, secrets, pastas de trabalho local e arquivos `.sqlite` não previstos. O único banco SQLite versionado é `data/template.sqlite`, vazio.

## 5. Levar os estudos ANTIGOS para a nuvem

Após concluir a instalação e atualizar o GitHub Pages:

1. Entre no novo site com a senha da Cloudflare.
2. Acesse **Configurações → Restaurar backup**.
3. Selecione o **`.sqlite`** que você exportou do site antigo.
4. Confirme a importação: **ela substitui todos os dados da sua conta remota**. Faça isso somente uma vez e antes de começar a marcar atividades em outros dispositivos.
5. No segundo navegador/celular, abra o mesmo endereço e entre com a mesma senha. Seu progresso aparecerá. Se o site já estava aberto, clique em **Sincronizar agora**.

O banco remoto D1 é a fonte oficial. O IndexedDB local serve como cache e como fonte para backups baixados. **Se a conexão cair, as alterações novas serão bloqueadas e um erro será exibido**, evitando fingir que o banco sincronizou quando não sincronizou. O cache do navegador **não deve ser usado para editar offline e sincronizar depois** nesta versão.

## 6. Por que o erro de HTTPS aparecia após F5?

O antigo Service Worker (`sw.js`) utilizava um cache-first sem invalidação automática ao atualizar arquivos. Ele podia entregar `app.js`, `db.js` ou `index.html` desatualizados. O texto sobre HTTPS era **genérico** e aparecia mesmo para outros erros de inicialização. Por isso `Ctrl+F5` podia funcionar.

Nesta versão:

- O Service Worker usa **network-first** para os arquivos do site e atualiza o cache para fallback.
- Arquivos JS têm `?v=2` nas URLs do `index.html`, evitando colisão com entradas antigas do cache.
- O aplicativo exibe a mensagem específica do erro, em vez de atribuir tudo à falta de HTTPS.
- O site precisa de `https://` na internet, e permite `http://localhost:8000` para desenvolvimento.

Para remover um SW antigo sem perder estudos: **primeiro exporte o backup!** Depois F12 → Application → Service Workers → Unregister e Application → Cache Storage → remova apenas os caches do PRF Study. **Não selecione `Clear site data`** antes de exportar.

## 7. Atualizar os dados e fazer backup do SQLite remoto

**Não existe comando Git para atualizar os dados sempre que você marcar uma atividade.** Isso é feito automaticamente pelo Worker em cada operação. O comando `git push` atualiza apenas o código do site.

Para verificar os dados remotos:

```powershell
cd backend
npx wrangler@latest d1 execute prf-study-db --remote --command="SELECT COUNT(*) AS marcacoes FROM task_progress;"
```

Para exportar uma cópia SQL do banco remoto:

```powershell
npx wrangler@latest d1 export prf-study-db --remote --output=backup-prf.sql
```

Guarde o arquivo em local privado, **fora do GitHub**. O backup `.sqlite` da própria interface é outra opção, e pode ser aberto no DB Browser for SQLite.

Se você alterar o **ESQUEMA** (criar tabelas/colunas), crie um arquivo SQL de migração e aplique **depois de fazer backup**, por exemplo:

```powershell
npx wrangler@latest d1 execute prf-study-db --remote --file=./minha_migracao.sql
npx wrangler@latest deploy
```

**Não execute** `DELETE`, `DROP TABLE`, reinicialização do banco nem restauração sobre produção sem backup. Rodar `schema.sql` repetidamente só preserva as tabelas existentes graças a `IF NOT EXISTS`, mas não migra colunas já criadas. Para restaurar um banco de produção, use os procedimentos próprios do D1/Time Travel ou crie uma base nova e valide os dados antes de substituir a produção.

## 8. Desenvolvimento e testes locais

Da pasta raiz:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python server.py
```

Abra `http://127.0.0.1:8000/`. A API remota permite também a origem `http://localhost:8000` para desenvolvimento, mas os dados serão **reais** se usar o Worker publicado. Evite testar importações que substituam dados remotos na sua conta principal.

Valide o cronograma original com:

```powershell
python scripts/validate_project.py
```

O `backend` usa JavaScript executado no Cloudflare; o arquivo `requirements.txt` **não instala nem executa o Worker** e não cria SQLite remoto. Para a API, basta Node.js + Wrangler.

## 9. Segurança e limites

- **Senha e assinatura:** segredos ficam no ambiente do Worker; não os publique. Use uma senha longa e exclusiva. A implementação é para uma conta pessoal, sem cadastro de múltiplas pessoas, sem recuperação por email e sem rate limit próprio; se quiser distribuir a usuários independentes, evolua para autenticação gerenciada e tabelas separadas por `user_id`.
- **Controle de acesso:** as rotas de dados exigem token assinado. CORS limita a origem do site; não substitui autenticação.
- **Sessões:** tokens ficam no armazenamento local do navegador e expiram em 30 dias. Não compartilhe computadores autenticados. Como utiliza bibliotecas CDN, mantenha dependências atualizadas e considere uma compilação com Vite para ambiente de produção.
- **Sincronização:** mudanças feitas em abas diferentes são vistas ao abrir/recarregar ou clicar **Sincronizar agora**. A última gravação de um mesmo campo vence em caso de edições simultâneas. Não há colaboração multiusuário.
- **Backup:** faça download periódico em Configurações. Evite `Clear site data` antes de baixar o histórico se ainda não tiver migrado.
- **Plano gratuito:** o Cloudflare Workers/D1 possui limites de requisições, armazenamento e linhas lidas/escritas. A disponibilidade futura, os limites e custos devem ser conferidos na documentação oficial.
- **Conteúdo de concursos:** o cronograma permanece baseado no **edital nacional PRF 2021**, não em concurso específico de TI ou de Rondônia. Atualize leis e resoluções revogadas quando sair edital novo. A preparação para o TAF deve ser feita à parte.

Documentação: [Cloudflare D1](https://developers.cloudflare.com/d1/get-started/), [comandos Wrangler D1](https://developers.cloudflare.com/workers/wrangler/commands/d1/), [GitHub Pages](https://docs.github.com/en/pages).
