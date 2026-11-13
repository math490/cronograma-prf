/* Camada de persistência: SQLite verdadeiro no navegador + arquivo binário no IndexedDB.
   O IndexedDB guarda somente o .sqlite exportado. Toda consulta é SQL real. */
(function (global) {
  'use strict';
  const DB_NAME = 'prf-study-sqlite-v1';
  const STORE = 'database-files';
  const KEY = 'prf-progress.sqlite';
  const SCHEMA = `
    PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS task_progress (study_date TEXT NOT NULL, task_index INTEGER NOT NULL CHECK(task_index BETWEEN 0 AND 3), completed INTEGER NOT NULL DEFAULT 0 CHECK(completed IN(0,1)), updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(study_date,task_index));
    CREATE TABLE IF NOT EXISTS day_journal (study_date TEXT PRIMARY KEY, notes TEXT NOT NULL DEFAULT '', questions_correct INTEGER NOT NULL DEFAULT 0 CHECK(questions_correct>=0), questions_total INTEGER NOT NULL DEFAULT 0 CHECK(questions_total>=0), confidence INTEGER NOT NULL DEFAULT 3 CHECK(confidence BETWEEN 1 AND 5), updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS error_notebook (id INTEGER PRIMARY KEY AUTOINCREMENT, study_date TEXT NOT NULL, subject TEXT NOT NULL, description TEXT NOT NULL, reviewed INTEGER NOT NULL DEFAULT 0 CHECK(reviewed IN(0,1)), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS focus_sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, study_date TEXT NOT NULL, minutes INTEGER NOT NULL CHECK(minutes BETWEEN 1 AND 120), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS quotes (study_date TEXT PRIMARY KEY, content TEXT NOT NULL, author TEXT NOT NULL, source TEXT NOT NULL DEFAULT 'api');
    CREATE TABLE IF NOT EXISTS preferences (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS ix_error_date ON error_notebook(study_date);
    CREATE INDEX IF NOT EXISTS ix_focus_date ON focus_sessions(study_date);
  `;

  class StudyDB {
    constructor() { this.db = null; this.SQL = null; this.storage = 'pending'; this.saves = Promise.resolve(); }
    async init() {
      if (typeof global.initSqlJs !== 'function') throw new Error('Biblioteca sql.js indisponível. Verifique sua conexão com a internet.');
      this.SQL = await global.initSqlJs({ locateFile: (file) => 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/' + file });
      let bytes = await this._readFile();
      if (bytes) {
        try { this.db = new this.SQL.Database(new Uint8Array(bytes)); }
        catch (err) { console.error('Banco salvo inválido:', err); throw new Error('Banco SQLite local inválido. Importe um backup para recuperar os dados.'); }
      } else {
        // Banco modelo distribuído como arquivo SQLite verdadeiro, somente leitura no GitHub Pages.
        // Cada estudante recebe sua cópia particular no navegador.
        try {
          const response = await fetch(new URL('data/template.sqlite', document.baseURI));
          if (!response.ok) throw new Error('Modelo SQLite indisponível');
          const buffer = await response.arrayBuffer();
          this.db = new this.SQL.Database(new Uint8Array(buffer));
        } catch (error) {
          console.warn('Criando banco SQLite novo localmente:', error);
          this.db = new this.SQL.Database();
        }
      }
      this.db.run(SCHEMA);
      await this.save();
      return this;
    }
    _idb() {
      return new Promise((resolve, reject) => {
        if (!global.indexedDB) return reject(new Error('IndexedDB não suportado'));
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE); };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        request.onblocked = () => reject(new Error('Armazenamento bloqueado por outra aba'));
      });
    }
    async _readFile() {
      try {
        const conn = await this._idb();
        const value = await new Promise((resolve, reject) => {
          const tx = conn.transaction(STORE, 'readonly');
          const req = tx.objectStore(STORE).get(KEY);
          req.onsuccess = () => resolve(req.result ?? null);
          req.onerror = () => reject(req.error);
        });
        conn.close(); this.storage = 'indexeddb'; return value;
      } catch (err) {
        console.warn('IndexedDB indisponível; tentando localStorage', err);
        try {
          const s = localStorage.getItem(KEY);
          this.storage = 'localstorage';
          if (!s) return null;
          const bin = atob(s); const out = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
          return out.buffer;
        } catch (_) { this.storage = 'memory'; return null; }
      }
    }
    async _writeFile(bytes) {
      if (this.storage === 'indexeddb') {
        try {
          const conn = await this._idb();
          await new Promise((resolve, reject) => {
            const tx = conn.transaction(STORE, 'readwrite');
            tx.objectStore(STORE).put(bytes.slice().buffer, KEY);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
            tx.onabort = () => reject(tx.error);
          });
          conn.close(); return;
        } catch (err) { console.warn('Falha no IndexedDB', err); this.storage = 'localstorage'; }
      }
      if (this.storage === 'localstorage') {
        try {
          let binary = ''; const chunk = 8192;
          for (let i=0;i<bytes.length;i+=chunk) binary += String.fromCharCode.apply(null, bytes.subarray(i,i+chunk));
          localStorage.setItem(KEY, btoa(binary)); return;
        } catch(err) { console.warn('Falha no localStorage',err); this.storage = 'memory'; }
      }
      if(this.storage === 'memory') return; // banco ainda funciona nesta sessão; backups continuam disponíveis
    }
    save() {
      if (!this.db) return Promise.resolve();
      const bytes = this.db.export();
      this.saves = this.saves.catch(() => {}).then(() => this._writeFile(bytes));
      return this.saves;
    }
    run(sql, params=[]) { this.db.run(sql, params); return this.save(); }
    select(sql, params=[]) {
      const statement = this.db.prepare(sql);
      try {statement.bind(params); const rows=[]; while(statement.step()) rows.push(statement.getAsObject()); return rows;}
      finally {statement.free();}
    }
    one(sql, params=[]) { return this.select(sql,params)[0] || null; }
    snapshot() {
      return {
        tasks: this.select('SELECT study_date,task_index,completed FROM task_progress WHERE completed=1'),
        journals: this.select('SELECT * FROM day_journal'),
        errors: this.select('SELECT * FROM error_notebook ORDER BY created_at DESC,id DESC'),
        focus: this.select('SELECT study_date,SUM(minutes) AS minutes FROM focus_sessions GROUP BY study_date'),
        prefs: this.select('SELECT key,value FROM preferences')
      };
    }
    async setTask(date,index,completed) {
      await this.run(`INSERT INTO task_progress(study_date,task_index,completed,updated_at)
           VALUES(?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(study_date,task_index)
           DO UPDATE SET completed=excluded.completed,updated_at=CURRENT_TIMESTAMP`,[date,index,completed?1:0]);
    }
    async markDay(date,completed) {
      this.db.run('BEGIN TRANSACTION');
      try {
        for(let i=0;i<4;i++) this.db.run(`INSERT INTO task_progress(study_date,task_index,completed,updated_at) VALUES(?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(study_date,task_index) DO UPDATE SET completed=excluded.completed,updated_at=CURRENT_TIMESTAMP`,[date,i,completed?1:0]);
        this.db.run('COMMIT');
      } catch(e) {this.db.run('ROLLBACK');throw e;}
      await this.save();
    }
    async updateJournal(date, journal) {
      await this.run(`INSERT INTO day_journal(study_date,notes,questions_correct,questions_total,confidence,updated_at)
        VALUES(?,?,?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(study_date) DO UPDATE SET notes=excluded.notes,questions_correct=excluded.questions_correct,questions_total=excluded.questions_total,confidence=excluded.confidence,updated_at=CURRENT_TIMESTAMP`,
        [date, (journal.notes||'').slice(0,12000),Math.max(0,Number(journal.questions_correct)||0), Math.max(0,Number(journal.questions_total)||0), Math.max(1,Math.min(5,Number(journal.confidence)||3))]);
    }
    async addError(date,subject,description) {
      await this.run('INSERT INTO error_notebook(study_date,subject,description) VALUES(?,?,?)',[date,subject,description.slice(0,2000)]);
    }
    async toggleError(id,reviewed) { await this.run('UPDATE error_notebook SET reviewed=? WHERE id=?',[reviewed?1:0,id]); }
    async removeError(id) { await this.run('DELETE FROM error_notebook WHERE id=?',[id]); }
    async addFocus(date,minutes) { await this.run('INSERT INTO focus_sessions(study_date,minutes) VALUES(?,?)',[date,Math.max(1,Math.min(120,minutes))]); }
    async setQuote(date,quote,author) {await this.run(`INSERT INTO quotes(study_date,content,author,source) VALUES(?,?,?,'api') ON CONFLICT(study_date) DO UPDATE SET content=excluded.content,author=excluded.author`,[date,quote.slice(0,700),author.slice(0,140)]);}
    getQuote(date) {return this.one('SELECT content,author FROM quotes WHERE study_date=?',[date]);}
    async setPreference(key,value) {await this.run('INSERT INTO preferences(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',[key,String(value)]);}
    exportBytes() {return this.db.export();}
    async importBytes(buffer) {
      let candidate;
      try {
        candidate = new this.SQL.Database(new Uint8Array(buffer));
        const tableNames = candidate.exec("SELECT name FROM sqlite_master WHERE type='table'")[0]?.values.map(v=>v[0]) || [];
        if (!['task_progress','day_journal','error_notebook','focus_sessions','quotes','preferences'].every(t=>tableNames.includes(t))) throw new Error('Tabelas obrigatórias ausentes.');
        const result = candidate.exec('PRAGMA integrity_check')[0]?.values?.[0]?.[0];
        if (result !== 'ok') throw new Error('Integridade do banco inválida.');
        const old = this.db;
        this.db = candidate;
        try {await this.save(); old?.close();} catch(e) {this.db=old;candidate.close();throw e;}
        return;
      } catch(err) { if(candidate && candidate!==this.db) candidate.close(); throw new Error('Importação recusada: '+err.message);}
    }
  }
  global.StudyDB = StudyDB;
})(window);
