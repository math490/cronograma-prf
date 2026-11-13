/* PRF Study. Vue 3 + Tailwind CSS + daisyUI; SQLite via sql.js em IndexedDB.
   Sem backend: pronto para hospedagem em GitHub Pages. */
(function () {
  'use strict';
  const { createApp, ref, reactive, computed, watch, onMounted, onBeforeUnmount } = Vue;
  const TODAY = (()=>{
    const d=new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  })();
  const START = '2026-11-13';
  const END = '2027-11-12';
  const TOTAL_SECONDS = 30*60;
  const dateObj = (s) => {const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d,12);};
  const isoLocal = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const displayDate = (s,opts) => new Intl.DateTimeFormat('pt-BR',opts).format(dateObj(s));
  const ICONS = {
    home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-8h6v8"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    chart:'<path d="M3 3v18h18"/><path d="m7 16 4-5 4 3 5-7"/>',
    book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
    notebook:'<path d="M4 5h16v16H4zM8 3v4M12 3v4M16 3v4"/><path d="M8 12h8M8 16h6"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.56V21H10v-.07a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.59 15 1.7 1.7 0 0 0 3 14h-.07v-4H3a1.7 1.7 0 0 0 1.59-1.04 1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 10 3v-.07h4V3a1.7 1.7 0 0 0 1.04 1.59 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06a1.7 1.7 0 0 0-.34 1.88A1.7 1.7 0 0 0 21 10h.07v4H21A1.7 1.7 0 0 0 19.4 15Z"/>',
    'chevron-left':'<path d="m15 18-6-6 6-6"/>',
    'chevron-right':'<path d="m9 18 6-6-6-6"/>',
    'chevron-down':'<path d="m6 9 6 6 6-6"/>',
    'chevron-up':'<path d="m18 15-6-6-6 6"/>',
    check:'<path d="m20 6-11 11-5-5"/>',
    'check-circle':'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6M19 5l2-2"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    flame:'<path d="M12 22c4 0 7-3.1 7-7 0-3.2-1.4-5.9-4.2-8.5.2 3-1.2 4.2-2.6 4.5-.2-3.9-2.5-6.5-5.2-8C7.2 6.5 5 10 5 14.7 5 19 8.2 22 12 22Z"/>',
    award:'<circle cx="12" cy="8" r="6"/><path d="m8.2 13-1 9 4.8-2.5 4.8 2.5-1-9"/>',
    database:'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>',
    layers:'<path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5"/>',
    bolt:'<path d="m13 2-9 12h7l-1 8 10-12h-7V2Z"/>',
    refresh:'<path d="M20 11a8 8 0 0 0-14.6-4L3 9m0-6v6h6M4 13a8 8 0 0 0 14.6 4L21 15m0 6v-6h-6"/>',
    play:'<path d="m8 5 11 7-11 7V5Z"/>',
    pause:'<path d="M8 5v14M16 5v14"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    trash:'<path d="M4 7h16M10 11v7M14 11v7M6 7l1 14h10l1-14M9 7V4h6v3"/>',
    download:'<path d="M12 3v13m-5-5 5 5 5-5M4 18v3h16v-3"/>',
    upload:'<path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5"/>',
    save:'<path d="M4 3h14l3 3v15H3V3h1Z"/><path d="M7 3v6h10V3M7 21v-8h10v8"/>',
    info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v6M12 7h.01"/>',
    lightbulb:'<path d="M9 18h6M10 22h4M9 18c0-2-4-4-4-9a7 7 0 0 1 14 0c0 5-4 7-4 9"/>',
    file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
  };
  const AppIcon = {
    props:{name:{type:String,required:true},size:{type:Number,default:20}},
    computed:{path(){return ICONS[this.name] || ICONS.info;}},
    template:`<svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" v-html="path"></svg>`
  };
  const colors = {
    'Língua Portuguesa':'#79b8fc','Raciocínio Lógico-Matemático':'#bb99ff','Informática':'#69d8db',
    'Física':'#e0af75','Ética e Cidadania':'#f58cac','Geopolítica':'#e2b06e',
    'Língua Estrangeira':'#a7ca76','Legislação de Trânsito':'#60aeef','Direito Administrativo':'#dba6ff',
    'Direito Constitucional':'#e59e85','Direito Penal':'#ef8c8c','Direito Processual Penal':'#a5b6ff',
    'Legislação Especial':'#e2bc82','Direitos Humanos':'#a8dcb5','Redação / revisão':'#d3a6ed','Revisão integrada':'#9ebce6'
  };
  const fallbackQuotes = [
    ['O progresso nasce de pequenos compromissos cumpridos todos os dias.','PRF Study'],
    ['Disciplina é escolher o que você mais quer, mesmo quando o caminho é longo.','PRF Study'],
    ['Um tópico dominado hoje é uma preocupação a menos na prova.','PRF Study'],
    ['Consistência supera a pressa: mantenha o passo e continue.','PRF Study'],
    ['Corrigir os próprios erros é uma das formas mais eficientes de aprender.','PRF Study'],
    ['As duas horas de hoje são o investimento no seu futuro.','PRF Study'],
    ['Concentre-se no bloco de agora; o resultado virá da soma dos dias.','PRF Study'],
    ['Cada revisão fortalece o caminho entre entender e lembrar.','PRF Study']
  ];
  const navigation = [
    {id:'today',icon:'home',label:'Meu dia',mobile:'Hoje'},
    {id:'calendar',icon:'calendar',label:'Calendário',mobile:'Agenda'},
    {id:'stats',icon:'chart',label:'Estatísticas',mobile:'Dados'},
    {id:'subjects',icon:'book',label:'Matérias',mobile:'Matérias'},
    {id:'errors',icon:'notebook',label:'Caderno de erros',mobile:'Erros'},
    {id:'settings',icon:'settings',label:'Configurações',mobile:'Ajustes'}
  ];
  createApp({
    components:{AppIcon},
    setup(){
      const loading=ref(true),bootError=ref(''),page=ref('today');
      const days=ref([]),subjects=ref([]),snapshot=ref({tasks:[],journals:[],errors:[],focus:[],prefs:[]});
      const selectedDate=ref(TODAY>=START&&TODAY<=END?TODAY:START);
      const calendarKey=ref(selectedDate.value.slice(0,7));
      const quote=reactive({content:'O progresso começa com o primeiro passo.',author:'PRF Study'});
      const quoteFromAPI=ref(false),quoteLoading=ref(false);
      const journal=reactive({notes:'',questions_correct:0,questions_total:0,confidence:3});
      const subjectQuery=ref(''),expandedSubject=ref(''),errorFilter=ref('pending');
      const newError=reactive({date:selectedDate.value,subject:'Informática',description:''});
      const importFile=ref(null),toastText=ref(''),storageMode=ref('pending');
      const language=ref('Inglês'),reminderTime=ref('20:00'),notificationStatus=ref('Ativar');
      const timerSeconds=ref(TOTAL_SECONDS),timerRunning=ref(false),timerStartedAt=ref(0),timerStartingSeconds=ref(TOTAL_SECONDS),timerDate=ref(selectedDate.value),timerBlock=ref(-1);
      let db,interval=null,reminderInterval=null,toastTimeout=null,quoteRequest=0;
      const mobileNavigation = navigation.filter(x=>x.id!=='settings');
      const daysByDate=computed(()=>Object.fromEntries(days.value.map(d=>[d.date,d])));
      const completedKeys=computed(()=>new Set(snapshot.value.tasks.filter(t=>Number(t.completed)===1).map(t=>`${t.study_date}:${t.task_index}`)));
      const journalMap=computed(()=>Object.fromEntries(snapshot.value.journals.map(j=>[j.study_date,j])));
      const selectedDay=computed(()=>daysByDate.value[selectedDate.value]||days.value[0]||{id:1,date:START,tasks:[],primary:'',secondary:'',weekday:'',theme:'',phase:''});
      const completedTaskCount=computed(()=>snapshot.value.tasks.filter(t=>Number(t.completed)===1).length);
      const completedHours=computed(()=>Number((completedTaskCount.value*.5).toFixed(1)).toLocaleString('pt-BR'));
      const dayDoneCount=(d)=>{let n=0;for(let i=0;i<4;i++) if(completedKeys.value.has(`${d}:${i}`))n++;return n;};
      const isTaskComplete=(d,i)=>completedKeys.value.has(`${d}:${i}`);
      const isDayComplete=(d)=>dayDoneCount(d)===4;
      const completedDays=computed(()=>days.value.reduce((s,d)=>s+(isDayComplete(d.date)?1:0),0));
      const overallPct=computed(()=>Math.round(100*completedDays.value/365));
      const streak=computed(()=>{
        let cursor=TODAY<START?START:(TODAY>END?END:TODAY);
        if(!daysByDate.value[cursor]) return 0;
        if(!isDayComplete(cursor)) {const d=dateObj(cursor);d.setDate(d.getDate()-1);cursor=isoLocal(d);}
        let n=0;while(daysByDate.value[cursor]&&isDayComplete(cursor)){n++;const d=dateObj(cursor);d.setDate(d.getDate()-1);cursor=isoLocal(d);}
        return n;
      });
      const selectedDayDoneCount=computed(()=>dayDoneCount(selectedDay.value.date));
      const selectedDayProgress=computed(()=>Math.round(selectedDayDoneCount.value*25));
      const todayLabel=computed(()=>displayDate(TODAY,{day:'2-digit',month:'short',year:'numeric'}));
      const pageTitle=computed(()=>({today:'Seu foco de hoje.',calendar:'Seu ano, dia a dia.',stats:'Seu progresso importa.',subjects:'Conheça seu edital.',errors:'Aprenda com os erros.',settings:'Seu espaço, suas regras.'})[page.value]||'PRF Study');
      const pageSubtitle=computed(()=>({today:'Pequenos passos, todos os dias. A aprovação é uma construção.',calendar:'Visualize sua jornada e mantenha cada compromisso em dia.',stats:'Acompanhe sua evolução e encontre oportunidades para melhorar.',subjects:'Veja o que estudar, com base no edital PRF de 2021.',errors:'Transforme dúvidas em acertos e fortaleça seus pontos fracos.',settings:'Personalize o aplicativo e mantenha seus dados protegidos.'})[page.value]||'');
      const upcomingDays=computed(()=>days.value.slice(selectedDay.value.id,selectedDay.value.id+5));
      const currentWeekDays=computed(()=>{
        let base=dateObj(selectedDay.value.date);base.setDate(base.getDate()-((base.getDay()+6)%7));
        return Array.from({length:7},(_,i)=>{const d=new Date(base);d.setDate(base.getDate()+i);return daysByDate.value[isoLocal(d)];}).filter(Boolean);
      });
      const calendarMonthName=computed(()=>{const [y,m]=calendarKey.value.split('-').map(Number);return new Intl.DateTimeFormat('pt-BR',{month:'long',year:'numeric'}).format(new Date(y,m-1,10));});
      const calendarCells=computed(()=>{
        const [y,m]=calendarKey.value.split('-').map(Number),start=new Date(y,m-1,1),end=new Date(y,m,0);
        const shift=(start.getDay()+6)%7,items=Array(shift).fill(null);
        for(let day=1;day<=end.getDate();day++) {
          const date=`${y}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          items.push({num:day,date,inPlan:!!daysByDate.value[date]});
        }
        while(items.length%7)items.push(null);
        return items;
      });
      const monthDays=computed(()=>days.value.filter(d=>d.date.startsWith(calendarKey.value)));
      const monthDone=computed(()=>monthDays.value.filter(d=>isDayComplete(d.date)).length);
      const chartDays=computed(()=>{
        let pivot=selectedDate.value;
        return days.value.filter(d=>d.date<=pivot).slice(-14);
      });
      const subjectStats=computed(()=>{
        const map={};for(const s of subjects.value)map[s.name]={name:s.name,total:0,complete:0,color:subjectColor(s.name)};
        for(const d of days.value)for(let i=0;i<4;i++){
          const t=d.tasks[i]; if(map[t.subject]){map[t.subject].total++;if(isTaskComplete(d.date,i))map[t.subject].complete++;}
        }
        return Object.values(map).map(s=>({...s,pct:s.total?Math.round(s.complete/s.total*100):0}));
      });
      const sumQuestions=computed(()=>snapshot.value.journals.reduce((s,j)=>s+Number(j.questions_total||0),0));
      const sumCorrect=computed(()=>snapshot.value.journals.reduce((s,j)=>s+Number(j.questions_correct||0),0));
      const accuracy=computed(()=>sumQuestions.value?Math.round(Math.min(sumQuestions.value,sumCorrect.value)/sumQuestions.value*100):0);
      const cebraspeScore=computed(()=>2*sumCorrect.value-sumQuestions.value);
      const focusHours=computed(()=>Number((snapshot.value.focus.reduce((s,x)=>s+Number(x.minutes||0),0)/60).toFixed(1)).toLocaleString('pt-BR'));
      const unresolvedCount=computed(()=>snapshot.value.errors.filter(e=>!Number(e.reviewed)).length);
      const filteredErrors=computed(()=>snapshot.value.errors.filter(e=>errorFilter.value==='all'||(errorFilter.value==='reviewed'?!!Number(e.reviewed):!Number(e.reviewed))));
      const filteredSubjects=computed(()=>subjects.value.filter(s=>(s.name+' '+s.topics.join(' ')).toLocaleLowerCase('pt-BR').includes(subjectQuery.value.toLocaleLowerCase('pt-BR'))));
      const timerLabel=computed(()=>`${String(Math.floor(timerSeconds.value/60)).padStart(2,'0')}:${String(timerSeconds.value%60).padStart(2,'0')}`);
      const timerPct=computed(()=>Math.round((TOTAL_SECONDS-timerSeconds.value)/TOTAL_SECONDS*100));
      const timerSpent=computed(()=>TOTAL_SECONDS-timerSeconds.value);
      const storageLabel=computed(()=>storageMode.value==='indexeddb'?'SQLite + IndexedDB (persistente)':storageMode.value==='localstorage'?'SQLite + localStorage (reserva)':'Somente nesta sessão — exporte backup');
      const subjectColor=(s)=>colors[s]||'#73a9e3';
      const formatLongDate=(s)=>displayDate(s,{weekday:'long',day:'numeric',month:'long',year:'numeric'});
      const formatShortDate=(s)=>displayDate(s,{day:'2-digit',month:'short',year:'numeric'});
      const dayNum=(s)=>s.slice(8,10);
      const monthShort=(s)=>displayDate(s,{month:'short'}).replace('.','').toUpperCase();
      const localizedTopic=(t)=>language.value==='Espanhol'?t.replace(/inglês ou espanhol/gi,'espanhol').replace(/inglês/gi,'espanhol'):t.replace(/inglês ou espanhol/gi,'inglês');
      function alertUser(msg){toastText.value=msg;clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>toastText.value='',4200);}
      function refresh(){snapshot.value=db.snapshot();storageMode.value=db.storage;}
      function hydrateJournal(){const data=journalMap.value[selectedDate.value]||{};journal.notes=data.notes||'';journal.questions_correct=Number(data.questions_correct||0);journal.questions_total=Number(data.questions_total||0);journal.confidence=Number(data.confidence||3);}
      async function persistSafe(task,successMessage=''){
        try{await task;refresh();if(successMessage)alertUser(successMessage);return true;}
        catch(error){console.error(error);alertUser('Falha ao salvar. Exporte um backup SQLite.');return false;}
      }
      async function toggleTask(d,i){await persistSafe(db.setTask(d,i,!isTaskComplete(d,i)));}
      async function toggleDay(d){const next=!isDayComplete(d);await persistSafe(db.markDay(d,next),next?'Dia inteiro concluído!':'Marcações do dia desfeitas.');}
      async function saveJournal(showToast=true){
        if(!db)return;
        const data={notes:journal.notes,questions_correct:Math.max(0,Number(journal.questions_correct)||0),questions_total:Math.max(0,Number(journal.questions_total)||0),confidence:journal.confidence};
        if(data.questions_correct>data.questions_total){data.questions_total=data.questions_correct;journal.questions_total=data.questions_total;}
        await persistSafe(db.updateJournal(selectedDate.value,data),showToast?'Anotações salvas.':'');
      }
      async function selectDate(d){
        if(!daysByDate.value[d])return;
        if(page.value==='today' && d!==selectedDate.value) await saveJournal(false);
        selectedDate.value=d;newError.date=d;calendarKey.value=d.slice(0,7);
        hydrateJournal();page.value='today';loadQuote();window.scrollTo({top:0,behavior:'smooth'});
      }
      async function shiftDay(n){const next=days.value[selectedDay.value.id-1+n];if(next)await selectDate(next.date);}
      function jumpToday(){selectDate(daysByDate.value[TODAY]?TODAY:START);}
      function navigate(target){if(page.value==='today'&&target!==page.value)saveJournal(false);page.value=target;window.scrollTo({top:0,behavior:'smooth'});}
      function changeMonth(offset){const [y,m]=calendarKey.value.split('-').map(Number);const dt=new Date(y,m-1+offset,1);const key=`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;if(key>='2026-11'&&key<='2027-11') calendarKey.value=key;}
      function calendarGoToday(){calendarKey.value=(TODAY>=START&&TODAY<=END?TODAY:START).slice(0,7);}
      async function loadQuote(force=false){
        if(!db)return;
        const d=selectedDate.value,req=++quoteRequest;
        quoteLoading.value=true;quoteFromAPI.value=false;
        const cached=db.getQuote(d);
        if(cached&&!force){quote.content=cached.content;quote.author=cached.author;quoteFromAPI.value=true;quoteLoading.value=false;return;}
        const fallback=fallbackQuotes[(selectedDay.value.id-1)%fallbackQuotes.length];
        quote.content=fallback[0];quote.author=fallback[1];
        try{
          const ctrl=new AbortController();
          const deadline=setTimeout(()=>ctrl.abort(),5500);
          let res;
          try {res=await fetch('https://dummyjson.com/quotes/random',{signal:ctrl.signal,cache:'no-store'});}
          finally {clearTimeout(deadline);}
          if(!res.ok)throw new Error('API indisponível');
          const data=await res.json();
          if(typeof data.quote!=='string'||typeof data.author!=='string')throw new Error('Formato inválido');
          if(req!==quoteRequest)return;
          quote.content=data.quote;quote.author=data.author;quoteFromAPI.value=true;
          await db.setQuote(d,data.quote,data.author); // uma frase por data, reconsultável offline
        }catch(err){
          if(req!==quoteRequest)return;
          if(cached){quote.content=cached.content;quote.author=cached.author;quoteFromAPI.value=true;}
        }finally {if(req===quoteRequest)quoteLoading.value=false;}
      }
      function tickTimer(){if(!timerRunning.value)return;const elapsed=Math.floor((Date.now()-timerStartedAt.value)/1000);timerSeconds.value=Math.max(0,timerStartingSeconds.value-elapsed);if(timerSeconds.value===0){timerRunning.value=false;logTimer(TOTAL_SECONDS/60,true);}}
      function toggleTimer(){if(timerRunning.value){tickTimer();timerRunning.value=false;return;}
        if(timerSeconds.value<=0)timerSeconds.value=TOTAL_SECONDS;
        timerStartedAt.value=Date.now();timerStartingSeconds.value=timerSeconds.value;timerRunning.value=true;
      }
      function startTimerFor(index){timerBlock.value=index;timerDate.value=selectedDate.value;timerSeconds.value=TOTAL_SECONDS;timerRunning.value=false;toggleTimer();alertUser('Timer iniciado para o bloco '+(index+1)+'.');}
      function resetTimer(){timerRunning.value=false;timerSeconds.value=TOTAL_SECONDS;timerDate.value=selectedDate.value;timerBlock.value=-1;}
      async function logTimer(minutes,automatic=false){const d=timerDate.value;const done=await persistSafe(db.addFocus(d,minutes),automatic?'Bloco de foco finalizado!':`${minutes} minuto(s) registrado(s).`);if(done){timerRunning.value=false;timerSeconds.value=TOTAL_SECONDS;timerBlock.value=-1;}}
      function finishTimer(){if(timerRunning.value)tickTimer();if(timerSeconds.value===0||timerSpent.value<=0)return;timerRunning.value=false;const mins=Math.ceil(timerSpent.value/60);logTimer(mins);}
      async function createError(){const desc=newError.description.trim();if(!desc||!daysByDate.value[newError.date])return;const ok=await persistSafe(db.addError(newError.date,newError.subject,desc),'Erro registrado para revisão.');if(ok)newError.description='';}
      async function markError(e){await persistSafe(db.toggleError(e.id,!e.reviewed));}
      async function deleteError(e){if(!confirm('Excluir este registro do caderno de erros?'))return;await persistSafe(db.removeError(e.id),'Registro excluído.');}
      async function setLanguage(){await persistSafe(db.setPreference('language',language.value),'Preferência atualizada.');}
      async function setReminder(){await persistSafe(db.setPreference('reminder',reminderTime.value),'Horário salvo.');}
      function updateNotificationStatus(){notificationStatus.value=(!('Notification'in window))?'Indisponível':(Notification.permission==='granted'?'Autorizado':Notification.permission==='denied'?'Bloqueado':'Ativar');}
      async function requestNotifications(){if(!('Notification'in window)){alertUser('Seu navegador não oferece notificações.');return;}try{await Notification.requestPermission();updateNotificationStatus();alertUser(notificationStatus.value==='Autorizado'?'Notificações autorizadas.':'Permissão não concedida.');}catch(err){alertUser('Não foi possível pedir permissão.');}}
      function checkReminder(){if(TODAY<START||TODAY>END||!('Notification'in window)||Notification.permission!=='granted')return;
        if(isDayComplete(TODAY)||!reminderTime.value)return;
        const now=new Date(),hhmm=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        if(hhmm<reminderTime.value)return;
        const key='prf-reminder:'+TODAY;
        if(sessionStorage.getItem(key))return;
        sessionStorage.setItem(key,'1');
        try{new Notification('Hora de estudar • PRF Study',{body:'Seu compromisso de 2 horas está esperando. Você consegue!',icon:'./assets/icon.svg'});}catch(err){console.warn(err);}
      }
      function triggerDownload(blob,filename){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);}
      function exportSQLite(){const bytes=db.exportBytes();triggerDownload(new Blob([bytes],{type:'application/x-sqlite3'}),`prf-study-backup-${TODAY}.sqlite`);alertUser('Backup SQLite baixado. Guarde em local seguro.');}
      function openImport(){importFile.value?.click();}
      async function importSQLite(event){const file=event.target.files?.[0];event.target.value='';if(!file)return;
        if(!confirm('Restaurar este arquivo substituirá TODOS os dados de estudo deste navegador. Deseja continuar?'))return;
        try{await db.importBytes(await file.arrayBuffer());refresh();hydrateJournal();language.value=snapshot.value.prefs.find(x=>x.key==='language')?.value||'Inglês';reminderTime.value=snapshot.value.prefs.find(x=>x.key==='reminder')?.value||'20:00';loadQuote();alertUser('Backup importado! Seus registros foram restaurados.');}
        catch(err){console.error(err);alertUser(err.message||'Falha ao importar backup.');}
      }
      function csvCell(v){let s=String(v??'');if(/^[=+@\-]/.test(s.trim()))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
      function exportCSV(){const rows=[['Data','Dia','Fase','Disciplina principal','Disciplina complementar','Blocos concluídos','Minutos previstos','Itens resolvidos','Acertos','Notas']];
        for(const d of days.value){const j=journalMap.value[d.date]||{};rows.push([d.date,d.weekday,d.phase,d.primary,d.secondary,dayDoneCount(d.date),120,j.questions_total||0,j.questions_correct||0,j.notes||'']);}
        const content='\uFEFF'+rows.map(r=>r.map(csvCell).join(';')).join('\r\n');triggerDownload(new Blob([content],{type:'text/csv;charset=utf-8'}),`prf-study-progresso-${TODAY}.csv`);alertUser('Planilha CSV exportada.');
      }
      function windowReload(){window.location.reload();}
      async function boot(){
        try{
          const [dayRes,subjectRes]=await Promise.all([fetch('./data/cronograma.json'),fetch('./data/disciplinas.json')]);
          if(!dayRes.ok||!subjectRes.ok)throw new Error('Os arquivos do cronograma não foram encontrados.');
          const [data,subjectData]=await Promise.all([dayRes.json(),subjectRes.json()]);
          if(!Array.isArray(data)||data.length!==365||!Array.isArray(subjectData))throw new Error('Os arquivos de conteúdo estão incompletos.');
          days.value=data;subjects.value=subjectData;
          db=await new window.StudyDB().init();refresh();hydrateJournal();
          language.value=snapshot.value.prefs.find(x=>x.key==='language')?.value||'Inglês';
          reminderTime.value=snapshot.value.prefs.find(x=>x.key==='reminder')?.value||'20:00';
          updateNotificationStatus();loading.value=false;
          loadQuote();
          interval=setInterval(tickTimer,250);
          reminderInterval=setInterval(checkReminder,60000);
          setTimeout(checkReminder,1200);
          if('serviceWorker'in navigator && window.isSecureContext)navigator.serviceWorker.register('./sw.js').catch(err=>console.info('Service Worker não registrado:',err));
        }catch(err){console.error(err);bootError.value=err.message||'Erro inesperado ao carregar o cronograma.';loading.value=false;}
      }
      onMounted(boot);
      onBeforeUnmount(()=>{clearInterval(interval);clearInterval(reminderInterval);clearTimeout(toastTimeout);});
      return {
        TODAY,loading,bootError,page,navigation,mobileNavigation,daysByDate,subjects,selectedDay,selectedDate,selectedDayDoneCount,selectedDayProgress,
        pageTitle,pageSubtitle,todayLabel,completedDays,completedTaskCount,completedHours,overallPct,streak,upcomingDays,currentWeekDays,
        quote,quoteFromAPI,quoteLoading,journal,subjectQuery,expandedSubject,errorFilter,newError,importFile,toastText,
        language,reminderTime,notificationStatus,focusHours,sumCorrect,sumQuestions,accuracy,cebraspeScore,unresolvedCount,filteredErrors,filteredSubjects,
        timerLabel,timerPct,timerSpent,timerRunning,subjectStats,chartDays,calendarMonthName,calendarKey,calendarCells,monthDays,monthDone,storageLabel,
        isTaskComplete,isDayComplete,dayDoneCount,subjectColor,formatLongDate,formatShortDate,dayNum,monthShort,localizedTopic,
        toggleTask,toggleDay,saveJournal,selectDate,shiftDay,jumpToday,navigate,changeMonth,calendarGoToday,loadQuote,
        toggleTimer,startTimerFor,resetTimer,finishTimer,createError,markError,deleteError,setLanguage,setReminder,requestNotifications,
        exportSQLite,openImport,importSQLite,exportCSV,windowReload
      };
    }
  }).mount('#app');
})();
