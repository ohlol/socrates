import json
import requests

from werkzeug.contrib.cache import SimpleCache

from socrates import graphite_url


class Metrics(object):

    def __init__(self):
        self._cache = SimpleCache()
        self._metrics = dict()

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
            for metric in json.loads(r.text):
                fields = metric.strip('.').split('.')
                for pos, field in enumerate(fields):
                    for key in self.build_keyspace(fields[pos:]):
                        self._metrics.setdefault(key, set())
                        self._metrics[key].add(metric)

    def search(self, term):
        cache_key = term
        rv = self._cache.get(cache_key)

        if not rv:
            rv = self._metrics.get(term, None)

        if not rv:
            rv = set()
            for key in self._metrics.iterkeys():
                if term in key:
                    rv |= set(self._metrics[key])

        self._cache.set(cache_key, rv, timeout=5 * 60)
        return rv
