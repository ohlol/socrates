import json

from flask import Module, abort, g, jsonify, render_template, request

from socrates import default_graph, graphite_url
from socrates.lib.dashboard import Dashboard
from socrates.lib.metrics import Metrics

frontend = Module(__name__)

metrics = Metrics()

@frontend.route("/")
def index():
    return render_template("index.html",
                           dashboard={},
                           default_graph=default_graph,
                           graphite_url=graphite_url,
                           base_url=request.url_root)

@frontend.route("/dashboard/new")
def new_dashboard():
    return render_template("dashboard.html",
                           operation="new",
                           dashboard={},
                           default_graph=default_graph,
                           graphite_url=graphite_url,
                           base_url=request.url_root)

@frontend.route("/dashboard/save", methods=["POST"])
def save_dashboard():
    dashboard_obj = request.form.get("dashboard", None)
    if not dashboard_obj:
        abort(400)

    dashboard = Dashboard(request.form.get("id", None))
    dashboard.dashboard = dashboard_obj

    if dashboard.save():
        return jsonify(message=dashboard._id)
    else:
        abort(500)

@frontend.route("/dashboard/<dashboard_id>")
def view_dashboard(dashboard_id):
    dashboard = Dashboard(dashboard_id)
    if dashboard.dashboard:
        return render_template("dashboard.html",
                               operation="view",
                               dashboard_id=dashboard_id,
                               dashboard=dashboard.dashboard,
                               default_graph=default_graph,
                               graphite_url=graphite_url,
                               base_url=request.url_root)
    else:
        abort(404)

@frontend.route("/dashboard/edit/<dashboard_id>")
def edit_dashboard(dashboard_id):
    dashboard = Dashboard(dashboard_id)
    if dashboard.dashboard:
        return render_template("dashboard.html",
                               operation="edit",
                               dashboard_id=dashboard_id,
                               dashboard=dashboard.dashboard,
                               default_graph=default_graph,
                               graphite_url=graphite_url,
                               base_url=request.url_root)
    else:
        abort(404)

@frontend.route("/dashboard/search/<term>")
def dashboard_search(term):
    return jsonify(message=sorted(Dashboard.search(term)))

@frontend.route("/metrics/search/<term>")
def metrics_search(term):
    metrics.index()
    return jsonify(message=sorted(metrics.search(term)))
