#!/usr/bin/env python3
"""Gera 365 dias do plano PRF baseado no conteúdo do item 24 do edital 2021.
A sequência e a distribuição de tempo são estratégia pedagógica autoral.
"""
from datetime import date,timedelta
from pathlib import Path
import json
ROOT = Path(__file__).resolve().parents[1]
START = date(2026,11,13)
END = date(2027,11,12)
TOPICS = {
 'Língua Portuguesa': [
  'Interpretação de textos: tema, tese, inferência e informação explícita',
  'Tipos e gêneros textuais: estrutura, finalidade e linguagem',
  'Ortografia oficial e emprego de palavras',
  'Coesão: referenciação, substituição, repetição e conectores',
  'Emprego de tempos e modos verbais',
  'Classes de palavras e funções no período',
  'Coordenação de orações e termos da oração',
  'Subordinação de orações e termos da oração',
  'Pontuação e efeitos de sentido',
  'Concordância verbal e nominal',
  'Regência verbal e nominal',
  'Crase: condições de ocorrência e casos especiais',
  'Colocação pronominal',
  'Reescrita de frases e parágrafos: manutenção de sentido',
  'Significação de palavras e substituição de trechos',
  'Reorganização de orações e períodos',
  'Reescrita de textos e níveis de formalidade',
  'Redação oficial: Manual de Redação da Presidência',
  'Expedientes oficiais: finalidade, linguagem e formato',
 ],
 'Raciocínio Lógico-Matemático': [
  'Equações do 1º e 2º graus e problemas contextualizados',
  'Sistemas lineares e modelagem de situações-problema',
  'Noção de função e interpretação de gráficos',
  'Função afim e função quadrática: gráficos e aplicações',
  'Funções exponencial e logarítmica',
  'Razão, proporção e taxas de variação',
  'Regra de três simples e composta',
  'Porcentagem e aplicações em situações reais',
  'Sequências, padrões, progressão aritmética e geométrica',
  'Contagem, análise combinatória e probabilidade básica',
  'Estatística: médias e desvios de conjuntos de dados',
  'Tabelas e gráficos em diferentes representações',
  'Noções de teoria dos conjuntos',
  'Geometria plana, figuras espaciais e escalas',
  'Projeções, planificações e cortes de sólidos',
  'Métrica, áreas, volumes e estimativas',
 ],
 'Informática': [
  'Internet, intranet e conceitos de redes e serviços',
  'Navegadores web e ferramentas de busca e pesquisa',
  'Correio eletrônico, listas e grupos de discussão',
  'Redes sociais e ferramentas colaborativas',
  'Windows: interface, arquivos, pastas e recursos básicos',
  'Acesso remoto a computadores e suas aplicações',
  'Transferência de informações e arquivos',
  'Aplicativos de áudio, vídeo e multimídia',
  'Transformação digital: conceitos e impactos',
  'Internet das Coisas (IoT): cenários de aplicação',
  'Big data: características e usos',
  'Inteligência artificial: conceitos e aplicações',
  'Segurança da informação: proteção e ameaças',
  'Vírus, worms, phishing e pragas virtuais',
  'Antivírus, firewall e anti-spyware',
  'VPN e proteção da comunicação',
  'Cloud computing: serviços, características e riscos',
  'Integração: redes, proteção, nuvem e transformação digital',
 ],
 'Física': [
  'Cinemática escalar: posição, velocidade e aceleração',
  'Cinemática vetorial: vetores e movimentos',
  'Movimento circular e grandezas angulares',
  'Primeira, segunda e terceira leis de Newton',
  'Leis de Newton: exercícios de aplicações práticas',
  'Trabalho de uma força e cálculo de potência',
  'Energia cinética e energia potencial',
  'Atrito e forças dissipativas',
  'Conservação e transformação de energia',
  'Quantidade de movimento e conservação',
  'Impulso e variação da quantidade de movimento',
  'Colisões e problemas de conservação',
 ],
 'Ética e Cidadania': [
  'Ética e moral: diferenças e aproximações',
  'Princípios, valores, integridade e ética pública',
  'Moralidade administrativa: CF art. 37 e Lei 8.112/1990',
  'Governança federal: Decreto 9.203/2017',
  'Código de Ética do Servidor: Decreto 1.171/1994',
  'Comissões de Ética: Decreto 6.029/2007',
  'Código de Conduta da Alta Administração Federal',
  'Ética, cidadania e democracia',
  'Transparência e Lei de Acesso à Informação',
  'Decreto 7.724/2012: acesso à informação',
  'Conflitos de interesse: Lei 12.813/2013',
  'Nepotismo: Decreto 7.203/2010',
 ],
 'Geopolítica': [
  'Brasil político: nação, território e fronteiras',
  'Organização do Estado brasileiro',
  'Divisão inter-regional do trabalho e da produção',
  'Estrutura urbana, metrópoles e urbanização',
  'População e migrações internas',
  'Indústria, estrutura urbana e setor agrícola',
  'Rede de transporte: modais e infraestrutura',
  'Economia brasileira e internacionalização',
  'Geografia e gestão ambiental',
  'Biomas, domínios naturais e ecossistemas',
 ],
 'Língua Estrangeira': [
  'Leitura e compreensão de texto em inglês ou espanhol',
  'Identificação de ideia principal e informações específicas',
  'Inferência lexical a partir do contexto',
  'Conectores e estruturação do texto',
  'Itens gramaticais relevantes para compreender o texto',
  'Leitura de texto sobre mobilidade e segurança viária',
 ],
 'Legislação de Trânsito': [
  'CTB: disposições preliminares e Sistema Nacional de Trânsito',
  'CTB: composição, competências e organização do SNT',
  'CTB: normas gerais de circulação e conduta',
  'CTB: pedestres, ciclistas e circulação',
  'CTB: educação para o trânsito e sinalização',
  'CTB: engenharia de tráfego e operação da via',
  'CTB: veículos, classificação e equipamentos obrigatórios',
  'CTB: registro, licenciamento e identificação veicular',
  'CTB: habilitação e formação de condutores',
  'CTB: infrações e classificação de penalidades',
  'CTB: medidas administrativas',
  'CTB: processo administrativo, autuação e notificações',
  'CTB: crimes de trânsito e disposições penais',
  'CTB e alterações listadas no edital: Lei 14.071/2020',
  'Lei 5.970/1973: acidentes de trânsito e prova pericial',
  'Resoluções CONTRAN: sinalização e fiscalização',
  'Resoluções CONTRAN: equipamentos e requisitos de veículos',
  'Resoluções CONTRAN: transporte de cargas e dimensões',
  'Resoluções CONTRAN: velocidade, alcoolemia e fiscalização',
  'Resoluções CONTRAN: procedimentos administrativos e penalidades',
  'Resoluções CONTRAN: habilitação, registro e licenciamento',
  'Resoluções CONTRAN: revisão do rol listado no item 24',
 ],
 'Direito Administrativo': [
  'Organização administrativa: centralização e descentralização',
  'Concentração, desconcentração e administração direta e indireta',
  'Autarquias, fundações e empresas estatais',
  'Atos administrativos: conceito, requisitos e atributos',
  'Atos administrativos: classificação e espécies',
  'Agentes públicos: conceitos, espécies, cargos e funções',
  'Lei 8.112/1990: direitos, deveres e responsabilidades',
  'Carreira PRF: Lei 9.654/1998 e Decreto 8.282/2014',
  'Indenizações: Leis 12.855/2013 e 13.712/2018',
  'Poderes hierárquico, disciplinar, regulamentar e de polícia',
  'Uso e abuso do poder',
  'Licitações: princípios, modalidades, tipos e procedimento (recorte de 2021)',
  'Contratação direta: dispensa e inexigibilidade',
  'Controle administrativo, judicial e legislativo',
  'Responsabilidade civil do Estado: ação e omissão',
  'Excludentes e atenuantes da responsabilidade do Estado',
  'Regime jurídico-administrativo e princípios expressos e implícitos',
 ],
 'Direito Constitucional': [
  'Poder constituinte: conceito, originário e derivado',
  'Reforma, revisão e emendas constitucionais',
  'Direitos e deveres individuais e coletivos',
  'Vida, liberdade, igualdade, segurança e propriedade',
  'Direitos sociais, nacionalidade e direitos políticos',
  'Garantias fundamentais e remédios constitucionais',
  'Poder Executivo: organização e competências',
  'Chefia de Estado, chefia de governo e responsabilidades',
  'União: bens e competências, arts. 20 a 24',
  'Defesa do Estado e instituições democráticas',
  'Segurança pública e atribuições da PRF: art. 144',
  'Ordem social e seguridade social',
  'Meio ambiente, família, criança, adolescente e idoso',
 ],
 'Direito Penal': [
  'Princípios básicos do Direito Penal',
  'Lei penal no tempo, tempo do crime e conflito de leis',
  'Lei penal no espaço e territorialidade',
  'Extraterritorialidade e lugar do crime',
  'Tipicidade, dolo e culpa',
  'Erro de tipo e suas consequências',
  'Crime tentado, consumado e impossível',
  'Punibilidade e causas de extinção',
  'Ilicitude e excludentes de ilicitude',
  'Excesso punível, culpabilidade e excludentes',
  'Imputabilidade e erro de proibição',
  'Crimes contra a pessoa e o patrimônio',
  'Crimes contra a dignidade sexual e a incolumidade pública',
  'Crimes contra a fé pública',
  'Crimes contra a Administração Pública',
 ],
 'Direito Processual Penal': [
  'Ação penal: conceito, características e espécies',
  'Ação penal: condições e legitimidade',
  'Termo Circunstanciado de Ocorrência e Lei 9.099/1995',
  'Atos processuais: forma, lugar e tempo',
  'Prova: conceito, objeto e classificação',
  'Preservação do local de crime',
  'Requisitos, ônus e provas ilícitas',
  'Prova pericial, interrogatório e confissão',
  'Testemunhas, reconhecimento, acareação e documentos',
  'Busca e apreensão pessoal e domiciliar',
  'Prisões: conceitos, formalidades e espécies',
  'Prisão em flagrante',
  'Identificação criminal: CF e Lei 12.037/2009',
  'Diligências investigatórias: arts. 6º e 13 do CPP',
 ],
 'Legislação Especial': [
  'Documentos de identificação: Leis 5.553/1968 e 12.037/2009',
  'ECA: Lei 8.069/1990',
  'Crimes hediondos: Lei 8.072/1990',
  'Competências da PRF: Decreto 1.655/1995 e Decreto 9.662/2019',
  'Juizados especiais: Lei 9.099/1995',
  'Lei de Tortura: Lei 9.455/1997',
  'Crimes ambientais: Lei 9.605/1998, capítulos III e V',
  'Estatuto do Desarmamento: Lei 10.826/2003, capítulo IV',
  'Lei de Drogas: Lei 11.343/2006',
  'Organizações criminosas: Lei 12.850/2013',
  'SUSP: Lei 13.675/2018',
  'Abuso de autoridade: Lei 13.869/2019',
 ],
 'Direitos Humanos': [
  'Direitos humanos na Constituição Federal',
  'Tratados internacionais de direitos humanos e a CF',
  'Declaração Universal dos Direitos Humanos',
  'Convenção Americana sobre Direitos Humanos',
  'Pacto de San José: Decreto 678/1992',
 ],
}

STAGES = [(0,111,'Fundamentos','Construção da base teórica e criação de repertório de questões.'),
          (112,230,'Consolidação','Retomada dos conteúdos com questões intercaladas e revisões ativas.'),
          (231,320,'Aprofundamento','Maior carga de itens de C/E, estudos de caso e análise de erros.'),
          (321,364,'Reta final','Revisão de pontos frágeis, simulados curtos e caderno de erros.')]
DOW = ['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo']
# Python weekday: 0 monday
PATTERN = {
 0: ('Língua Portuguesa','Legislação de Trânsito'),
 1: ('Informática','Raciocínio Lógico-Matemático'),
 2: ('Legislação de Trânsito','Direito Constitucional'),
 3: ('Direito Administrativo','Direito Penal'),
 4: ('Informática','Física'),
 5: ('Legislação Especial','Direito Processual Penal'),
}
SUPPLEMENTS = ['Ética e Cidadania','Geopolítica','Língua Estrangeira','Direitos Humanos']
counts={s:0 for s in TOPICS}

def next_topic(subject):
    n=counts[subject]
    counts[subject]=n+1
    arr=TOPICS[subject]
    seq=n%len(arr)
    return arr[seq], 1+(n//len(arr))

def make_task(label,subject,content,method,instruction,kind):
    return {'label':label,'subject':subject,'content':content,'minutes':30,
            'method':method,'instruction':instruction,'kind':kind}

result=[]
for offset in range((END-START).days+1):
    d=START+timedelta(days=offset)
    w=offset//7
    stage,next_hint=next(((a[2],a[3]) for a in STAGES if a[0]<=offset<=a[1]),('Reta final',''))
    if d.weekday()==6:
        extra=SUPPLEMENTS[w%len(SUPPLEMENTS)]
        extra_topic,extra_pass=next_topic(extra)
        theme='Revisão semanal + '+extra
        tasks=[
         make_task('Mini simulado · Bloco I','Revisão integrada','Português, raciocínio lógico, informática e física','Certo ou errado','Resolva 10–15 itens C/E sem consulta. Registre acertos e erros no dia.','simulado'),
         make_task('Mini simulado · Blocos II e III','Revisão integrada','Legislação de trânsito + Direito (constitucional, administrativo, penal e especial)','Certo ou errado','Resolva 10–15 itens C/E cronometrados; não consulte gabarito antes de concluir.','simulado'),
         make_task('Rodízio complementar · '+extra,extra,extra_topic,'Revisão dirigida',f'Estude {extra_topic.lower()}, faça 3–5 itens e anote conceitos-chave.','revisao'),
         make_task('Redação e caderno de erros','Redação / revisão','Texto dissertativo até 30 linhas; repertório, estrutura e erros da semana','Produção e correção','Escreva ou reescreva um trecho argumentativo e revise erros registrados na semana.','redacao')
        ]
        main='Revisão integrada'; secondary=extra; main_topic='Mini simulado C/E + produção discursiva'; secondary_topic=extra_topic
    else:
        main,secondary=PATTERN[d.weekday()]
        main_topic, pass_main=next_topic(main)
        secondary_topic, pass_secondary=next_topic(secondary)
        if stage=='Fundamentos':
            a='Teoria ativa'; b='Questões guiadas'; c='Estudo aplicado'; ee='Revisão e fixação'
            inst1='Leia o tópico do edital, produza uma síntese de até 8 linhas e 3 perguntas de autoavaliação.'
            inst2='Resolva 6–10 itens no formato C/E e justifique os erros sem consultar a resposta.'
            inst3='Estude conceitos, normas ou fórmulas e crie 3 exemplos que facilitem sua compreensão.'
            inst4='Resolva 6–10 itens C/E; corrija e registre 1 erro recorrente ou conceito-chave.'
        elif stage=='Consolidação':
            a='Recordação ativa'; b='Questões intermediárias'; c='Conexões e prática'; ee='Correção comentada'
            inst1='Recorde o conteúdo sem consulta por 5 minutos; revise lacunas e faça resumo de 5 linhas.'
            inst2='Resolva 10–12 itens C/E, anotando a regra ou conceito que sustenta a resposta.'
            inst3='Faça mapa comparativo e intercale exemplos de tópicos já estudados.'
            inst4='Resolva 10–12 itens e escreva por que as alternativas falsas estão erradas.'
        else:
            a='Revisão direcionada'; b='Itens difíceis C/E'; c='Aplicação e jurisprudência'; ee='Caderno de erros'
            inst1='Resuma os pontos de maior incidência e confronte com seu caderno de erros.'
            inst2='Faça 12–15 itens C/E com tempo controlado e corrija as justificativas.'
            inst3='Resolva casos, conceitos ou dispositivos relevantes e revise exceções.'
            inst4='Faça 10–12 itens e registre dúvidas, pegadinhas e conceitos para revisar.'
        tasks=[
            make_task(a,main,main_topic,a,inst1,'teoria'),
            make_task(b,main,main_topic,b,inst2,'questoes'),
            make_task(c,secondary,secondary_topic,c,inst3,'teoria'),
            make_task(ee,secondary,secondary_topic,ee,inst4,'questoes'),
        ]
        theme=f'{main} + {secondary}'
    result.append({'id':offset+1,'date':d.isoformat(),'weekday':DOW[d.weekday()],
      'week':w+1,'month_index':(d.year-START.year)*12+d.month-START.month+(1 if d.day>=START.day else 0),
      'phase':stage,'phase_hint':next_hint,'theme':theme,'primary':main,'secondary':secondary,
      'primary_topic':main_topic,'secondary_topic':secondary_topic,'tasks':tasks,
      'tip': 'Itens da banca Cebraspe usam julgamento CERTO/ERRADO; corrija cada erro e mantenha um caderno de revisão.',
      'disclaimer': 'Plano autoral com base no item 24 do edital de 2021; atualize a legislação e verifique editais futuros.'})

assert len(result)==365
assert sum(t['minutes'] for d in result for t in d['tasks'])==365*120
assert len({d['date'] for d in result})==365
(ROOT/'data'/'cronograma.json').write_text(json.dumps(result, ensure_ascii=False,separators=(',', ':')),encoding='utf8')
(ROOT/'data'/'disciplinas.json').write_text(json.dumps([{'name':n,'topics':ts,'count':len(ts)} for n,ts in TOPICS.items()],ensure_ascii=False,indent=2),encoding='utf8')
print('Dias:', len(result),'Total horas:',sum(t['minutes'] for d in result for t in d['tasks'])//60,'Disciplinas:',len(TOPICS))
print('Primeiro:',result[0]['date'],result[0]['theme'])
print('Último:',result[-1]['date'],result[-1]['theme'])
