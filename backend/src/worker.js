/** PRF Study API — Cloudflare Worker + D1 (SQLite remoto).
 * Conta pessoal única, autenticada por senha armazenada como secret do Worker.
 * NUNCA armazene APP_PASSWORD ou SIGNING_SECRET no GitHub.
 */
const TABLE_COLUMNS = {
  tasks: ['study_date', 'task_index', 'completed', 'updated_at'],
  journals: ['study_date', 'notes', 'questions_correct', 'questions_total', 'confidence', 'updated_at'],
  errors: ['id', 'study_date', 'subject', 'description', 'reviewed', 'created_at'],
  sessions: ['id', 'study_date', 'minutes', 'created_at'],
  quotes: ['study_date', 'content', 'author', 'source'],
  prefs: ['key', 'value']
};
const TABLE_NAMES = {tasks:'task_progress',journals:'day_journal',errors:'error_notebook',sessions:'focus_sessions',quotes:'quotes',prefs:'preferences'};
const MAX_IMPORT = {tasks:1460,journals:365,errors:3000,sessions:5000,quotes:365,prefs:100};
const encoder = new TextEncoder();
const json = (obj, status=200, cors={}) => new Response(JSON.stringify(obj), {
  status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store', ...cors}
});
const base64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const unbase64url = (value) => {
  const normalized=value.replace(/-/g,'+').replace(/_/g,'/');
  return Uint8Array.from(atob(normalized.padEnd(Math.ceil(normalized.length/4)*4,'=')),c=>c.charCodeAt(0));
};
async function hmacKey(secret) {
  return crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);
}
async function signToken(env) {
  const payload=base64url(encoder.encode(JSON.stringify({sub:'prf-owner',exp:Math.floor(Date.now()/1000)+60*60*24*30})));
  const sig=await crypto.subtle.sign('HMAC',await hmacKey(env.SIGNING_SECRET),encoder.encode(payload));
  return payload+'.'+base64url(new Uint8Array(sig));
}
async function validToken(env, authorization) {
  if(!authorization?.startsWith('Bearer '))return false;
  try{
    const token=authorization.slice(7),parts=token.split('.');
    if(parts.length!==2)return false;
    const valid=await crypto.subtle.verify('HMAC',await hmacKey(env.SIGNING_SECRET),unbase64url(parts[1]),encoder.encode(parts[0]));
    if(!valid)return false;
    const body=JSON.parse(new TextDecoder().decode(unbase64url(parts[0])));
    return body.sub==='prf-owner' && Number.isFinite(body.exp) && body.exp>Math.floor(Date.now()/1000);
  }catch{return false;}
}
async function passwordMatches(password,secret) {
  if(typeof password!=='string'||password.length<1||password.length>300||typeof secret!=='string'||!secret)return false;
  const [left,right]=await Promise.all([crypto.subtle.digest('SHA-256',encoder.encode(password)),crypto.subtle.digest('SHA-256',encoder.encode(secret))]);
  const a=new Uint8Array(left), b=new Uint8Array(right);let difference=0;
  for(let i=0;i<a.length;i++)difference|=a[i]^b[i];
  return difference===0;
}
function allowedOrigin(origin, env) {
  // CORS permite o domínio do GitHub Pages e ambientes locais de desenvolvimento.
  // Importante: CORS não é controle de acesso; todas as rotas de dados exigem token.
  return !!origin && (origin===env.ALLOWED_ORIGIN || origin==='http://localhost:8000'||origin==='http://127.0.0.1:8000');
}
const dateValid = (v) => typeof v==='string' && /^20\d{2}-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/.test(v) && v>='2026-11-13' && v<='2027-11-12';
const boolInt = v => v===true||v===1||v==='1' ? 1:0;
const rangeInt = (v,lo,hi) => Number.isFinite(Number(v))&&Number.isInteger(Number(v))&&Number(v)>=lo&&Number(v)<=hi;
const cut = (v,n) => String(v??'').slice(0,n);
function requireValid(condition,message){if(!condition)throw new Error(message);}
async function readBody(request) {
  const raw=await request.text();
  requireValid(raw.length<=15_000_000,'Requisição muito grande.');
  try{return JSON.parse(raw);}catch{throw new Error('JSON inválido.');}
}
async function readState(env) {
  const [tasks,journals,errors,sessions,quotes,prefs]=await Promise.all([
    env.DB.prepare('SELECT * FROM task_progress').all(),
    env.DB.prepare('SELECT * FROM day_journal').all(),
    env.DB.prepare('SELECT * FROM error_notebook ORDER BY id').all(),
    env.DB.prepare('SELECT * FROM focus_sessions ORDER BY id').all(),
    env.DB.prepare('SELECT * FROM quotes').all(),
    env.DB.prepare('SELECT * FROM preferences').all()
  ]);
  return {tasks:tasks.results,journals:journals.results,errors:errors.results,sessions:sessions.results,quotes:quotes.results,prefs:prefs.results};
}
async function mutation(env,body) {
  const {op}=body;
  const d=body.date;
  switch(op) {
    case 'setTask':
      requireValid(dateValid(d)&&rangeInt(body.index,0,3),'Data ou bloco inválido.');
      await env.DB.prepare(`INSERT INTO task_progress(study_date,task_index,completed) VALUES(?,?,?)
        ON CONFLICT(study_date,task_index) DO UPDATE SET completed=excluded.completed,updated_at=CURRENT_TIMESTAMP`)
        .bind(d,Number(body.index),boolInt(body.completed)).run(); break;
    case 'markDay':
      requireValid(dateValid(d),'Data inválida.');
      await env.DB.batch(Array.from({length:4},(_,i)=>env.DB.prepare(`INSERT INTO task_progress(study_date,task_index,completed) VALUES(?,?,?)
        ON CONFLICT(study_date,task_index) DO UPDATE SET completed=excluded.completed,updated_at=CURRENT_TIMESTAMP`).bind(d,i,boolInt(body.completed))));break;
    case 'updateJournal': {
      const j=body.journal||{};
      requireValid(dateValid(d)&&rangeInt(j.questions_correct,0,100000)&&rangeInt(j.questions_total,0,100000)&&Number(j.questions_correct)<=Number(j.questions_total)&&rangeInt(j.confidence,1,5),'Diário inválido.');
      await env.DB.prepare(`INSERT INTO day_journal(study_date,notes,questions_correct,questions_total,confidence)
       VALUES(?,?,?,?,?) ON CONFLICT(study_date) DO UPDATE SET notes=excluded.notes,questions_correct=excluded.questions_correct,
       questions_total=excluded.questions_total,confidence=excluded.confidence,updated_at=CURRENT_TIMESTAMP`)
       .bind(d,cut(j.notes,12000),Number(j.questions_correct),Number(j.questions_total),Number(j.confidence)).run();break;
    }
    case 'addError':
      requireValid(dateValid(d)&&typeof body.description==='string'&&body.description.trim().length>0,'Registro inválido.');
      await env.DB.prepare('INSERT INTO error_notebook(study_date,subject,description) VALUES(?,?,?)').bind(d,cut(body.subject,120),cut(body.description,2000)).run();break;
    case 'toggleError':
      requireValid(rangeInt(body.id,1,10000000),'ID inválido.');
      await env.DB.prepare('UPDATE error_notebook SET reviewed=? WHERE id=?').bind(boolInt(body.reviewed),Number(body.id)).run();break;
    case 'removeError':
      requireValid(rangeInt(body.id,1,10000000),'ID inválido.');
      await env.DB.prepare('DELETE FROM error_notebook WHERE id=?').bind(Number(body.id)).run();break;
    case 'addFocus':
      requireValid(dateValid(d)&&rangeInt(body.minutes,1,120),'Sessão inválida.');
      await env.DB.prepare('INSERT INTO focus_sessions(study_date,minutes) VALUES(?,?)').bind(d,Number(body.minutes)).run();break;
    case 'setQuote':
      requireValid(dateValid(d),'Data inválida.');
      await env.DB.prepare(`INSERT INTO quotes(study_date,content,author,source) VALUES(?,?,?,'api')
       ON CONFLICT(study_date) DO UPDATE SET content=excluded.content,author=excluded.author`)
       .bind(d,cut(body.content,700),cut(body.author,140)).run(); break;
    case 'setPreference':
      requireValid(typeof body.key==='string'&&body.key.length<=100,'Preferência inválida.');
      await env.DB.prepare('INSERT INTO preferences(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind(body.key,cut(body.value,200)).run();break;
    default:throw new Error('Operação não autorizada.');
  }
  return {ok:true};
}
async function importBackup(env,body) {
  const data=body.data;
  requireValid(data&&typeof data==='object'&&body.confirmReplace===true,'Confirme substituição do backup.');
  // Backup deve ser feito antes; o endpoint restaura o conjunto completo de tabelas.
  const statements=[];
  for(const name of Object.values(TABLE_NAMES))statements.push(env.DB.prepare(`DELETE FROM ${name}`));
  for(const [key,cols] of Object.entries(TABLE_COLUMNS)) {
    const rows=data[key];
    requireValid(Array.isArray(rows)&&rows.length<=MAX_IMPORT[key],`Conjunto de dados ${key} inválido ou excessivo.`);
    for(const row of rows) {
      requireValid(row&&typeof row==='object', 'Linha inválida.');
      if(key!=='prefs')requireValid(dateValid(row.study_date),'Data fora do cronograma no backup.');
      if(key==='tasks')requireValid(rangeInt(row.task_index,0,3),'Bloco fora do cronograma.');
      const values=cols.map(k=>row[k]??null);
      const sql=`INSERT INTO ${TABLE_NAMES[key]} (${cols.join(',')}) VALUES (${cols.map(()=>'?').join(',')})`;
      statements.push(env.DB.prepare(sql).bind(...values));
    }
  }
  // D1.batch executa todos os comandos de forma transacional (falhou => rollback).
  await env.DB.batch(statements);
  return {ok:true,imported:true};
}
export default {
  async fetch(request,env) {
    const origin=request.headers.get('Origin');
    const allowed=allowedOrigin(origin,env);
    const cors=allowed?{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'Authorization, Content-Type','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Vary':'Origin'}:{};
    if(request.method==='OPTIONS')return new Response(null,{status:allowed?204:403,headers:cors});
    if(origin && !allowed)return json({error:'Origem não autorizada. Confira ALLOWED_ORIGIN.'},403);
    if(!env.DB||!env.APP_PASSWORD||!env.SIGNING_SECRET)return json({error:'Servidor não configurado: DB ou secrets ausentes.'},503,cors);
    const pathname=new URL(request.url).pathname;
    try {
      if(pathname==='/api/health'&&request.method==='GET')return json({ok:true,service:'prf-study-api'},200,cors);
      if(pathname==='/api/login'&&request.method==='POST') {
        const body=await readBody(request);
        if(!await passwordMatches(body.password,env.APP_PASSWORD))return json({error:'Senha incorreta.'},401,cors);
        return json({token:await signToken(env)},200,cors);
      }
      if(!await validToken(env,request.headers.get('Authorization')))return json({error:'Sessão expirada. Entre novamente.'},401,cors);
      if(pathname==='/api/state'&&request.method==='GET')return json(await readState(env),200,cors);
      if(pathname==='/api/mutate'&&request.method==='POST')return json(await mutation(env,await readBody(request)),200,cors);
      if(pathname==='/api/import'&&request.method==='POST')return json(await importBackup(env,await readBody(request)),200,cors);
      return json({error:'Rota não encontrada.'},404,cors);
    } catch(e) {
      console.error('PRF Study API error:',e);
      return json({error:e.message||'Falha inesperada no servidor.'},e.message?400:500,cors);
    }
  }
};
