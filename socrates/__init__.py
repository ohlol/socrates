import os

from flask import Flask

app = Flask(__name__)
app.config.from_pyfile(os.environ.get("SOCRATES_SETTINGS",
                                      os.path.join(os.path.dirname(__file__),
                                                   "..", "settings.py")))
app.debug = os.environ.get("FLASK_DEBUG", app.config.get("DEBUG"))
default_graph = app.config.get('DEFAULT_GRAPH', {'options': {}, 'targets': []})
graphite_url = app.config.get('GRAPHITE_URL', 'http://localhost')

from socrates.views.frontend import frontend
app.register_module(frontend)
