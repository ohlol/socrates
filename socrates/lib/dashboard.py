import json

from flask import g
from uuid import uuid4

import database


class Dashboard(object):

    def __init__(self, _id=None):
        if _id:
            self._id = _id
        else:
            self._id = uuid4().hex
        self._dashboard = None

    def _find_dashboard(self):
        query = "SELECT settings FROM dashboards WHERE id = ?"
        return database.query_db(query, [self._id], one=True)

    @property
    def dashboard(self):
        if not hasattr(self, "_id"):
            return None
        if not self._dashboard:
            self._dashboard = self._find_dashboard().get('settings', None)

        return self._dashboard

    @dashboard.setter
    def dashboard(self, obj):
        if not hasattr(self, "_id"):
            self._id = uuid4().hex

        self._dashboard = obj

    def save(self):
        if self._find_dashboard():
            query = "UPDATE dashboards SET name = ?, settings = ? WHERE id = ?"
        else:
            query = "INSERT INTO dashboards (name, settings, id) " +\
                    "VALUES (?, ?, ?)"

        return database.query_db(query, [self.dashboard["name"],
                                         json.dumps(self.dashboard),
                                         self._id])

    @classmethod
    def search(self, term):
        query = "SELECT * from dashboards WHERE name LIKE ?"
        return database.query_db(query, ["%" + term + "%"])
