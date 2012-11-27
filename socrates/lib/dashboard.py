import json

from flask import g
from uuid import uuid4

import database


class Dashboard(object):

    def __init__(self, _id = None):
        if _id:
            self._id = _id

    def _find_dashboard(self):
        query = "SELECT settings FROM dashboards WHERE id = ?"
        return database.query_db(query, [self._id], one=True)

    @property
    def dashboard(self):
        if not hasattr(self, "_id"):
            return None

        found = self._find_dashboard()
        if found.get("settings", None):
            self._dashboard = found["settings"]
        else:
            self._dashboard = None

        return self._dashboard

    @dashboard.setter
    def dashboard(self, obj):
        if not hasattr(self, "_id"):
            self._id = uuid4().hex

        self._dashboard = json.loads(obj)

    def save(self):
        if self._find_dashboard():
            query = "UPDATE dashboards SET id = ?, settings = ?"
        else:
            query = "INSERT INTO dashboards (id, settings) VALUES (?, ?)"

        database.query_db(query, [ self._id, json.dumps(self._dashboard) ],
                          commit=True)
        return True
