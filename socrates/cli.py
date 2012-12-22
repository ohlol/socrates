def main():
    import argparse

    parser = argparse.ArgumentParser(description="Socrates server")
    parser.add_argument("--initdb",
                        action="store_true",
                        default=False,
                        help="Initialize the sqlite database")
    parser.add_argument("--listen-address",
                        default="0.0.0.0",
                        help="Listen on this address [default=%(default)s]")
    parser.add_argument("--listen-port",
                        default=5000,
                        type=int,
                        help="Listen on this port [default=%(default)s]")

    args = parser.parse_args()

    if args.initdb:
        from socrates.lib.database import init_db
        init_db()
    else:
        import socrates
        socrates.app.run(host=args.listen_address, port=args.listen_port)
