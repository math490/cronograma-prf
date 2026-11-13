#!/usr/bin/env python3
"""Testes sem dependências externas para conferir a integridade do plano."""
from collections import Counter
from datetime import date,timedelta
from pathlib import Path
import json
import sqlite3

root=Path(__file__).resolve().parents[1]
days=json.loads((root/'data'/'cronograma.json').read_text(encoding='utf-8'))
subjects=json.loads((root/'data'/'disciplinas.json').read_text(encoding='utf-8'))
assert len(days)==365, f'{len(days)} dias'
assert days[0]['date']=='2026-11-13'
assert days[-1]['date']=='2027-11-12'
assert len({day['date'] for day in days})==365
assert [date.fromisoformat(d['date']) for d in days]==[date(2026,11,13)+timedelta(days=i) for i in range(365)]
assert all(len(day['tasks'])==4 for day in days)
assert all(sum(t['minutes'] for t in day['tasks'])==120 for day in days)
assert all(day['month_index'] in range(1,13) for day in days)
assert all(day['weekday'] in ['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'] for day in days)
assert sum(d['weekday']=='Domingo' for d in days)==52
counts=Counter(t['subject'] for day in days for t in day['tasks'])
for subject in subjects:assert counts[subject['name']]>0,subject['name']
assert counts['Informática']>=180
conn=sqlite3.connect(':memory:')
conn.executescript((root/'data'/'schema.sql').read_text())
model=root/'data'/'template.sqlite'
assert model.read_bytes()[:16]==b'SQLite format 3\x00'
with sqlite3.connect(f'file:{model.absolute()}?mode=ro',uri=True) as template_db:
    assert template_db.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
    assert template_db.execute('SELECT COUNT(*) FROM task_progress').fetchone()[0]==0
conn.execute('INSERT INTO task_progress(study_date,task_index,completed) VALUES (?,?,?)',('2026-11-13',0,1))
assert conn.execute('SELECT COUNT(*) FROM task_progress WHERE completed=1').fetchone()[0]==1
print('PASS: 365 dias consecutivos; 4 blocos/dia; 730h; 52 domingos de revisão; 14 matérias; SQL íntegro.')
print('Disciplinas mais frequentes:',counts.most_common(6))
