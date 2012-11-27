import os
import sqlite3

from flask import Flask, g

app = Flask(__name__)
app.config.from_pyfile(os.environ.get("SOCRATES_SETTINGS",
                                      os.path.join(os.path.dirname(__file__),
                                                   "..", "settings.py")))
app.debug = os.environ.get("FLASK_DEBUG", app.config.get("DEBUG"))
default_graph = app.config.get("DEFAULT_GRAPH", {"options": {}, "targets": []})
graphite_url = app.config.get("GRAPHITE_URL", "http://localhost")
database_path = app.config.get("DATABASE_PATH",
                               os.path.join(os.path.dirname(__file__),
                                            "..", "socrates.db"))
schema_sql_file = os.path.join(os.path.dirname(__file__),
                               "..", "schema.sql")

from socrates.views.frontend import frontend
app.register_blueprint(frontend)

@app.before_request
def before_request():
    from socrates.lib.database import connect_db

    g.db = connect_db()

@app.teardown_request
def teardown_request(exception):
    if hasattr(g, "db"):
        g.db.close()
