#!/usr/bin/env python3
"""Verifica um backup .sqlite exportado do site com sqlite3 da biblioteca padrão."""
import argparse
import sqlite3
from pathlib import Path

p = argparse.ArgumentParser(description='Inspeciona um backup SQLite exportado pelo PRF Study')
p.add_argument('arquivo', type=Path)
a = p.parse_args()
with sqlite3.connect(f'file:{a.arquivo.absolute()}?mode=ro', uri=True) as db:
    print('Integridade:', db.execute('PRAGMA integrity_check').fetchone()[0])
    for table in ('task_progress','day_journal','error_notebook','focus_sessions','quotes'):
        print(f'{table}:', db.execute(f'SELECT COUNT(*) FROM {table}').fetchone()[0], 'registros')
    print('Sessões concluídas:', db.execute('SELECT COUNT(*) FROM task_progress WHERE completed=1').fetchone()[0])
