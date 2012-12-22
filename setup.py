#!/usr/bin/env python

from setuptools import setup, find_packages

version = "0.0.1"

setup(
    name="socrates",
    version=version,
    description="Socrates is a Graphite dashboard",
    long_description="Socrates is a Graphite dashboard",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: System Administrators",
        "License :: OSI Approved :: BSD License",
        "Topic :: System :: Networking :: Monitoring"
    ],
    keywords="",
    author="Scott Smith",
    author_email="scott@ohlol.net",
    license="BSD",
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    install_requires=["Flask", "requests"],
    entry_points={
        "console_scripts": [
            "socrates-server = socrates.cli:main"
        ],
    }
)
