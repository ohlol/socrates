import json
import requests

from werkzeug.contrib.cache import SimpleCache

from socrates import graphite_url


class Metrics(object):

    def __init__(self):
        self._cache = SimpleCache()
        self._metrics = []

    def build_keyspace(self, fields):
        """
        Given: ["one", "two", "three"]
        Yield: "one", "one.two", "one.two.three"
        """
        current = set()
        for field in fields:
            current.add(field)
            yield ".".join(current)

    def index(self):
        if not self._metrics:
            r = requests.get("%s/metrics/index.json" % graphite_url)
            self._metrics = json.loads(r.text)

    def search(self, term):
        cache_key = term
        rv = self._cache.get(cache_key)

        if not rv:
            rv = [metric for metric in self._metrics if term in metric]

        self._cache.set(cache_key, rv, timeout=86400)
        return rv
