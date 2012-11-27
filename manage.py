#!/usr/bin/env python

from flask import Flask
from flaskext.actions import Manager
import settings
from socrates import app


app.config.from_object(settings)
manager = Manager(app)

@manager.register("initdb")
def initdb(app):
    def action():
        """
        Initialize the SQLite3 database
        """
        from socrates.lib.database import init_db
        init_db()
    return action

if __name__ == "__main__":
    manager.run()
