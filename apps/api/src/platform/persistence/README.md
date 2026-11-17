# Server persistence boundary

Keep future database clients, transactions, migrations, and persistence adapters
here. PostgreSQL is the initial candidate for account-owned cloud records and
durable usage accounting; no database is provisioned or required today.

Modules own their records and operations. Do not return ORM models through HTTP
contracts or put database clients in shared packages. Add a repository interface
only when a real use case needs one.

Budget reservation and reconciliation must be atomic before paid LLM calls are
enabled. If a separate rate-limit service becomes necessary, add it based on actual
deployment needs rather than assuming Redis from the start.
