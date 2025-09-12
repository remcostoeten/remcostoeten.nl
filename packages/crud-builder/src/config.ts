let db: any
let schema: any

function configure(database: any, schemaObj: any) {
  db = database
  schema = schemaObj
}

function getDb() {
  if (!db) {
    throw new Error('Database not configured')
  }
  return db
}

function getSchema() {
  if (!schema) {
    throw new Error('Schema not configured')
  }
  return schema
}

export { configure, getDb, getSchema }
