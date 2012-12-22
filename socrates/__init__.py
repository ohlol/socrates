import os
import sqlite3

from flask import Flask, abort, g, request

app = Flask(__name__, instance_relative_config=True)
app.config.from_object("socrates.default_settings")
app.config.from_pyfile(os.environ.get("SOCRATES_CONFIG",
                                      "/Users/scott/tmp/socrates.cfg"),
                       silent=True)
app.debug = os.environ.get("FLASK_DEBUG", app.config.get("DEBUG", False))
default_graph = app.config["DEFAULT_GRAPH"]
graphite_url = app.config["GRAPHITE_URL"]
database_path = app.config["DATABASE_PATH"]
schema_sql_file = os.path.join(os.path.dirname(__file__),
                               "static",
                               "schema.sql")

from socrates.views.frontend import frontend
app.register_blueprint(frontend)


@app.before_request
def before_request():
    from socrates.lib.database import connect_db

    try:
        g.db = connect_db()
    except sqlite3.OperationalError:
        abort(500)

    g.default_args = {
        'base_url': request.url_root.rstrip('/'),
        'default_graph': default_graph,
        'graphite_url': graphite_url
    }


@app.teardown_request
def teardown_request(exception):
    if hasattr(g, "db"):
        g.db.close()
