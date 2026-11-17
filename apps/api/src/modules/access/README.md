# Access and usage policy

Own the distinction between anonymous visitors, authenticated accounts, and any
future paid entitlements. Reading and local saving remain available without login.

Resolve authentication separately from authorization. Server-owned policy decides
which study capabilities and quotas apply; never trust a client-supplied user ID,
plan name, remaining balance, or subscription status.

Before live model calls, implement a bounded guest allowance, account quotas,
token/output limits, concurrency limits, and a global spending stop. An anonymous
cookie identifies a browser, not a person: pair it with gateway/IP abuse controls
and durable, atomic usage reservations. Budget failed or interrupted calls too.

Introduce identity and billing adapters here when those features are built.
Verified billing events may update entitlements, but study code should consume
capabilities and budgets rather than a payment vendor's subscription objects.

No authentication, subscription, or quota enforcement is implemented yet.
