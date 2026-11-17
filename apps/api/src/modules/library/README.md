# Cloud library and sync

Own future account-owned notes, highlights, saved findings, backup, and sync.
Guest work stays on the device until the user explicitly opts into cloud storage.

Authenticate cloud requests and authorize every item against its account owner.
Use stable client-generated item IDs so guest work can be imported idempotently.
Define revision/conflict and deletion handling before implementing sync; a failed
upload or account change must not erase the device copy.

This module is not the local save path. The browser has a separate device-storage
adapter. Cloud persistence and the sync protocol are intentionally unimplemented.
