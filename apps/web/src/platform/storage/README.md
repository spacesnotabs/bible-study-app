# Browser storage boundary

Provide browser persistence for feature modules. Plan to use IndexedDB for notes,
highlights, and saved findings; small display preferences can use localStorage.
Keep browser APIs and schema migrations here, outside shared domain code.

The first implementation should support stable IDs, schema versions, failed-write
handling, and export. Device-only data can be lost when browser storage is cleared;
future cloud backup must be opt-in and describe what it uploads.

Do not create a generic storage framework before implementing the first saved item.
A future mobile client will provide its own device-storage adapter.
