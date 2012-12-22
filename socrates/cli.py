def main():
    import argparse

    parser = argparse.ArgumentParser(description="Socrates server")
    parser.add_argument("--initdb",
                        action="store_true",
                        default=False,
                        help="Initialize the sqlite database")

    args = parser.parse_args()

    if args.initdb:
        from socrates.lib.database import init_db
        init_db()
    else:
        import socrates
        socrates.app.run()
