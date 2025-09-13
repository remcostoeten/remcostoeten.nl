import { readFileSync, existsSync } from 'fs'
import { resolve, join } from 'path'
import { glob } from 'glob'

/**
 * Find drizzle.config.ts in project root
 */
export function findDrizzleConfig(): string {
  const possibleConfigs = [
    'drizzle.config.ts',
    'drizzle.config.js',
    'drizzle.config.mjs'
  ]
  
  for (const config of possibleConfigs) {
    const configPath = resolve(process.cwd(), config)
    if (existsSync(configPath)) {
      return configPath
    }
  }
  
  throw new Error('drizzle.config.ts not found in project root')
}

/**
 * Load schema from drizzle.config.ts
 */
export async function loadSchemaFromConfig(): Promise<any> {
  try {
    const configPath = findDrizzleConfig()
    
    // Dynamic import the config
    const config = await import(configPath)
    const drizzleConfig = config.default
    
    if (!drizzleConfig.schema) {
      throw new Error('No schema found in drizzle.config.ts')
    }
    
    // Resolve schema pattern to actual files
    const schemaPattern = drizzleConfig.schema
    const schemaFiles = await resolveSchemaFiles(schemaPattern)
    
    // Import all schema files and merge
    const schemas = await Promise.all(
      schemaFiles.map(file => import(resolve(process.cwd(), file)))
    )
    
    // Merge all exports into single schema object
    return mergeSchemas(schemas)
  } catch (error) {
    throw new Error(`Failed to load schema: ${error}`)
  }
}

/**
 * Resolve glob pattern to actual schema files
 */
async function resolveSchemaFiles(pattern: string | string[]): Promise<string[]> {
  const patterns = Array.isArray(pattern) ? pattern : [pattern]
  const files: string[] = []
  
  for (const p of patterns) {
    if (p.includes('*')) {
      // Glob pattern
      const globFiles = await glob(p, { cwd: process.cwd() })
      files.push(...globFiles)
    } else {
      // Single file
      files.push(p)
    }
  }
  
  return files
}

/**
 * Merge multiple schema objects into one
 */
function mergeSchemas(schemas: any[]): any {
  const merged = {}
  
  for (const schema of schemas) {
    Object.assign(merged, schema)
  }
  
  return merged
}