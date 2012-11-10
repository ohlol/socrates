import json

from flask import Module, render_template

from socrates import default_graph, graphite_url

frontend = Module(__name__)

@frontend.route("/")
def index():
    return render_template("index.html")

@frontend.route("/dashboard/")
def dashboard():
    return render_template("dashboard.html",
                           default_graph=json.dumps(default_graph),
                           graphite_url=graphite_url)
