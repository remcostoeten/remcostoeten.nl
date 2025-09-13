# Changelog

## [0.0.1] - 2024-01-XX

### Added
- Initial release of CRUD Builder
- Simple WHERE clause syntax with natural operators
- Type-safe CRUD operations for Drizzle ORM
- React hooks for optimistic updates
- Support for PostgreSQL, MySQL, SQLite
- Complete TypeScript support with IntelliSense

### Features
- `crud.create()`, `crud.read()`, `crud.update()`, `crud.delete()` operations
- WHERE clauses: `{ age: '>18' }`, `{ name: '*john*' }`, `{ role: ['admin', 'user'] }`
- Factory functions: `createFn()`, `readFn()`, `updateFn()`, `destroyFn()`
- Client hooks: `useOptimisticCrud()`, `withTransition()`
- Full documentation and examples