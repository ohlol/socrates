import sqlite3

from contextlib import closing
from flask import g

from socrates import app, database_path, schema_sql_file


def connect_db():
   return sqlite3.connect(database_path)

def query_db(query, args=(), one=False, commit=False):
   cur = g.db.execute(query, args)
   if commit:
      g.db.commit()
   rv = [dict((cur.description[idx][0], value)
              for idx, value in enumerate(row)) for row in cur.fetchall()]
   return (rv[0] if rv else None) if one else rv

def init_db():
   with closing(connect_db()) as db:
      with app.open_resource(schema_sql_file) as f:
         db.cursor().executescript(f.read())
         db.commit()
