# PRF Study — Missão Aprovação

Aplicação **Vue.js 3 + Tailwind CSS 4 + daisyUI 5**, de visual escuro em azul e cinza, para acompanhar um plano de estudos da Polícia Rodoviária Federal baseado no **Edital Concurso PRF nº 1, de 18/01/2021** (arquivo fornecido). Funciona em **GitHub Pages**, incluindo registros persistentes em **SQLite no navegador**.

> **Atenção ao concurso:** o edital usado como referência é **nacional**, para o cargo de **Policial Rodoviário Federal**; não foi um edital específico para uma carreira de informática nem uma seleção exclusiva de Rondônia. A disciplina **Informática** está no Bloco I e foi **reforçada** por escolha pedagógica neste plano. Isso **não** constitui previsão de um concurso em 2027, nem substitui um novo edital. Verifique alterações legislativas e as regras futuras.

## O que o aplicativo oferece

- **365 dias consecutivos:** de **13/11/2026** a **12/11/2027** (12 meses de estudo, 730 horas previstas, inclusive sábados e domingos).
- **4 sessões de 30 minutos por dia**, cada uma marcável de forma independente, com conteúdo, matéria, orientação didática e sugestão de exercícios.
- **Marcar ou desmarcar o dia inteiro** com um único botão, refletindo as 4 sessões.
- **14 disciplinas** do conteúdo programático, com ênfase adicional em Informática, Trânsito e revisões.
- **Revisões aos domingos** com mini simulados Cebraspe (Certo/Errado), rotação de disciplinas complementares, redação e caderno de erros.
- Fases pedagógicas: fundamentos, consolidação, aprofundamento e reta final.
- **Calendário mensal**, datas passadas e futuras, resumo de cada dia, progresso individual e por disciplina.
- Painel com **progresso total, sequência de dias, horas planejadas concluídas, desempenho em questões e tempo de foco**.
- Timer de 30 minutos com **início, pausa, reinício e registro do tempo efetivamente cronometrado**. O cronômetro não marca automaticamente a tarefa como completa: a confirmação é manual.
- **Diário de estudos** por dia, acertos/total de questões e autoavaliação de confiança.
- **Caderno de erros**, com marcação de itens revisados.
- Preferência entre **inglês e espanhol** no conteúdo de língua estrangeira.
- Frase motivacional via **API gratuita [DummyJSON Quotes](https://dummyjson.com/docs/quotes)**. As frases da API são em inglês; uma seleção local em português aparece se a API falhar. A frase retornada é registrada no SQLite para aquele dia.
- Tema escuro, versão responsiva para celular e **manifesto de PWA** para adicionar à tela inicial.
- Backup e restauração **`.sqlite`**, exportação **`.csv`** e teste opcional do banco via Python.
- Avisos locais opcionais *somente enquanto o site estiver aberto* (não são notificações push agendadas em servidor).

## Arquivos do projeto

```text
prf-study/
├── index.html                  # Interface Vue.js
├── assets/
│   ├── app.js                  # Lógica Vue, timer e calendário
│   ├── db.js                   # SQLite/sql.js com IndexedDB
│   ├── style.css               # Tema escuro, responsividade e ajustes da interface
│   ├── icon.svg                # Ícone vetorial
│   ├── icon-192.png            # Ícone PWA
│   └── icon-512.png            # Ícone PWA
├── data/
│   ├── cronograma.json         # TODOS os 365 dias e 1.460 sessões
│   ├── disciplinas.json        # Matérias e tópicos de referência
│   └── schema.sql              # Esquema das tabelas SQLite
├── reference/
│   └── ED_1_PRF_2021_ABERTURA.pdf  # Edital de referência
├── scripts/
│   ├── generate_schedule.py    # Regenera o cronograma
│   ├── validate_project.py     # Testa datas, horas, disciplinas e SQL
│   └── check_backup.py         # Inspeciona um backup SQLite exportado
├── manifest.webmanifest        # Configuração de instalação no celular
├── sw.js                       # Cache para visitas posteriores
├── server.py                   # Servidor Flask LOCAL opcional
├── requirements.txt            # Dependência Python só para o servidor local
├── .nojekyll                   # Compatibilidade GitHub Pages
└── README.md
```

## Como colocar no GitHub Pages (sem contratar servidor)

1. Entre em [github.com](https://github.com/) e faça login.
2. Clique em **New repository** e escolha um nome, por exemplo, `prf-study`. Pode deixar público. Clique em **Create repository**.
3. Faça upload de **todo o conteúdo desta pasta** na **raiz do repositório** — `index.html`, `assets/`, `data/`, `reference/`, `scripts/`, `sw.js`, `manifest.webmanifest`, etc. O `index.html` precisa estar na **raiz**, não dentro de outra pasta `prf-study`.
4. No repositório, vá a **Settings → Pages**.
5. Em **Build and deployment**, selecione **Deploy from a branch**. Selecione a branch **main**, a pasta **/ (root)** e clique em **Save**.
6. O endereço do site será, em geral, `https://SEU_USUARIO.github.io/prf-study/`, substituindo `SEU_USUARIO` e `prf-study` pelos nomes do seu GitHub e do repositório. O endereço exato aparece em **Settings → Pages** depois da publicação.
7. Abra a página no navegador. Na primeira abertura, mantenha internet ativa para carregar Vue, Tailwind, daisyUI, sql.js e o WebAssembly. As alterações de estudo serão gravadas no SQLite local do navegador.

**Importante:** não altere para caminhos absolutos começando com `/assets/`: os recursos usam caminhos relativos (`./assets/...`) para funcionar também em `usuario.github.io/NOME_DO_REPOSITORIO/`.

### Alternativa: enviar pelo Git

Com Git instalado, após criar um repositório vazio no GitHub:

```bash
cd prf-study
git init
git add .
git commit -m "Site PRF Study com SQLite no navegador"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/prf-study.git
git push -u origin main
```

Ative GitHub Pages em **Settings → Pages** conforme descrito acima.

## Por que o SQLite funciona no GitHub Pages?

**GitHub Pages é hospedagem de arquivos estáticos.** Não há processos Python, APIs Flask ou arquivos SQLite no servidor que possam receber gravações feitas pelos visitantes. Por isso, **colocar apenas um `app.py` com SQLite em um repositório Pages não funciona**.

Este projeto inclui também um **banco SQLite modelo de verdade** (`data/template.sqlite`) sem dados pessoais, para iniciar o aplicativo. Cada pessoa que acessar o site recebe sua própria cópia, separada do repositório.

Este projeto utiliza uma arquitetura sem backend, que é compatível com Pages:

```text
GitHub Pages
    │
    ├── index.html / assets/app.js / data/cronograma.json
    │
    └── navegador do estudante
          ├── Vue.js + Tailwind + daisyUI
          ├── sql.js / WebAssembly (mecanismo SQLite real)
          │     ├── task_progress
          │     ├── day_journal
          │     ├── error_notebook
          │     ├── focus_sessions
          │     ├── quotes
          │     └── preferences
          └── IndexedDB (cópia binária persistente do arquivo SQLite)
```

**Como salva:** na primeira execução, o app carrega o modelo `data/template.sqlite` (ou cria um banco novo se o modelo não estiver disponível). Em seguida, `assets/db.js` abre o banco SQLite com a biblioteca [sql.js](https://github.com/sql-js/sql.js), que compila SQLite para WebAssembly. Cada alteração é uma operação SQL real. Ao salvar, exporta o banco SQLite para uma sequência de bytes e grava esse arquivo dentro do IndexedDB do navegador. Na próxima visita *no mesmo navegador e perfil*, o aplicativo lê esse arquivo, reabre o SQLite e recupera os registros. Se IndexedDB não estiver disponível, tenta guardar o arquivo em `localStorage` como reserva (com menor capacidade). Quando o navegador bloqueia ambos, o app informa que os dados são apenas temporários.

**Limitações importantes:**

- O progresso fica no **dispositivo e navegador** em uso, não no repositório GitHub; apenas o `template.sqlite` público contém o esquema vazio. Ele **não é compartilhado nem sincronizado automaticamente** entre computador e celular, navegadores diferentes ou pessoas diferentes.
- Para migrar de dispositivo, use **Configurações → Baixar banco .sqlite** no aparelho antigo e **Configurações → Restaurar backup** no novo. Restaurar substitui os registros locais anteriores.
- A limpeza dos dados do navegador, uso de janela anônima ou restrições de armazenamento podem apagar o progresso. Guarde cópias `.sqlite` com frequência.
- Os dados do estudo não são enviados para a API de frases. O navegador acessa serviços públicos para baixar bibliotecas e buscar frases, como ocorre em qualquer site que use CDN.
- Essa solução não é um banco central para múltiplos usuários. Para ter **login, sincronização online ou banco único**, seria preciso contratar/implantar um backend ou usar um serviço como Supabase. Um servidor Flask + SQLite também pode ser utilizado **fora** do GitHub Pages, mas isso é **outra arquitetura**.

## Executar localmente, com `requirements.txt`

Para desenvolvimento ou teste, você pode usar Flask como servidor local. **O Flask só entrega os arquivos estáticos; o banco SQLite continua no navegador**, exatamente como no GitHub Pages.

Requisitos: Python 3.10+ e internet para as bibliotecas do CDN na primeira visita.

**Windows (PowerShell):**

```powershell
cd caminho\para\prf-study
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python server.py
```

**Linux/macOS:**

```bash
cd /caminho/para/prf-study
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python server.py
```

Depois abra **http://127.0.0.1:8000/**. Se preferir não usar Flask/Python, na raiz do projeto rode `python -m http.server 8000`. **Não abra o `index.html` diretamente com `file://`**: carregamento de JSON, IndexedDB e Service Worker precisam de um servidor HTTP/HTTPS.

### Testar os dados

```bash
python scripts/validate_project.py
```

Após exportar o banco no site, inspecione-o no terminal:

```bash
python scripts/check_backup.py "prf-study-backup-2026-11-13.sqlite"
```

O formato exportado é **SQLite 3 verdadeiro** e pode ser aberto em ferramentas como DB Browser for SQLite e pelo módulo padrão `sqlite3` do Python.

## Como alterar o cronograma

Edite `scripts/generate_schedule.py`, sobretudo o dicionário `TOPICS`, o mapa semanal `PATTERN`, os temas complementares `SUPPLEMENTS` e as fases `STAGES`. Depois rode:

```bash
python scripts/generate_schedule.py
python scripts/validate_project.py
```

Esses comandos atualizam `data/cronograma.json` e `data/disciplinas.json`. Publique os arquivos alterados no GitHub. **Atualizar os arquivos JSON não apaga o progresso**, pois ele é salvo por data e índice do bloco; no entanto, mudar a ordem dos blocos de datas existentes pode fazer marcações antigas corresponderem a novos assuntos. Faça um backup antes de reestruturar o plano.

## Metodologia de estudo e fonte

O cronograma usa como referência a lista de conteúdos do **item 24 do Edital PRF nº 1/2021** e as regras gerais da prova. O edital traz **120 itens objetivos** distribuídos entre **Bloco I (55 itens)**, **Bloco II — Legislação de Trânsito (30 itens)** e **Bloco III (35 itens)**, com julgamento **Certo/Errado** e prova discursiva de até **30 linhas**. Conforme o item 9.12.2, cada item certo soma 1 ponto, cada erro desconta 1 ponto e o item sem marcação/dupla marcação soma 0. No edital 2021, os limites mínimos eliminatórios eram 15 pontos no bloco I, 10 no bloco II, 10 no bloco III e 50 no conjunto. Os assuntos de informática previstos foram internet/intranet, ferramentas web, Windows, acesso remoto, transferência de arquivos, transformação digital, IoT, big data, inteligência artificial, segurança, malware, antivírus, firewall, VPN e computação em nuvem.

A distribuição dos dias, a divisão em quatro blocos e os métodos de estudo são **criações pedagógicas** feitas a partir desse conteúdo, e não um cronograma oficial da PRF. São previstos **52 domingos de revisão**, com mini simulados e prática de redação. Os simulados de 30 minutos não substituem a preparação para o tempo integral de uma prova real.

**Atualidade jurídica:** o rol de resoluções CONTRAN e outras normas reflete o edital de 2021. **Não se deve usar cegamente a versão de 2021 para estudar em 2026/2027**. Verifique novas consolidações, revogações, leis de licitação, jurisprudência e um eventual novo edital. O exercício físico/TAF exige preparação específica, à parte destas 2 horas acadêmicas.

## Sobre o uso de CDNs e offline

Para não exigir `npm install` nem uma etapa de compilação, o HTML usa as versões públicas de Vue, Tailwind, daisyUI e sql.js por CDN. O Tailwind Browser CDN é uma solução sem build que facilita usar o projeto diretamente no Pages, **mas a documentação oficial o destina principalmente a desenvolvimento**, e uma versão de produção otimizada deveria compilar Tailwind com Vite/PostCSS antes da distribuição. O `sw.js` tenta guardar recursos comuns após uma visita conectada, mas **não há garantia de funcionamento 100% offline**, principalmente para a API de frases e dependências externas. Para um projeto corporativo ou com muitos usuários, considere migrar para Vite e arquivos locais compilados.

## Licenças e reconhecimento

- [Vue.js](https://vuejs.org/) — MIT
- [Tailwind CSS](https://tailwindcss.com/) — MIT
- [daisyUI](https://daisyui.com/) — MIT
- [sql.js](https://github.com/sql-js/sql.js) — MIT (SQLite é domínio público)
- [DummyJSON](https://dummyjson.com/) — API pública gratuita de frases (em inglês)

Não é um produto oficial, afiliado ou endossado pela PRF ou pelo Cebraspe.
