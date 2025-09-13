import { readFileSync, existsSync } from 'fs'
import { resolve, join } from 'path'
import { glob } from 'glob'

/**
 * Find drizzle.config.ts file in the project root directory.
 * Searches for common config file extensions in order of preference.
 * 
 * @returns Absolute path to the drizzle config file
 * @throws Error if no config file is found
 * 
 * @example
 * ```typescript
 * const configPath = findDrizzleConfig()
 * console.log(configPath) // '/path/to/project/drizzle.config.ts'
 * ```
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
 * Load and merge schema files from drizzle.config.ts configuration.
 * Automatically resolves glob patterns and imports all schema files.
 * 
 * @returns Promise resolving to merged schema object
 * @throws Error if config file is not found or schema loading fails
 * 
 * @example
 * ```typescript
 * const schema = await loadSchemaFromConfig()
 * console.log(Object.keys(schema)) // ['users', 'posts', 'comments']
 * ```
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
 * Resolve glob patterns to actual schema file paths.
 * Supports both single files and glob patterns like './src/schema/*.ts'.
 * 
 * @param pattern - Single file path or array of file paths/glob patterns
 * @returns Promise resolving to array of resolved file paths
 * 
 * @internal Used internally by loadSchemaFromConfig
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
 * Merge multiple schema objects into a single schema object.
 * Combines all exported tables from different schema files.
 * 
 * @param schemas - Array of imported schema modules
 * @returns Merged schema object containing all tables
 * 
 * @internal Used internally by loadSchemaFromConfig
 */
function mergeSchemas(schemas: any[]): any {
  const merged = {}
  
  for (const schema of schemas) {
    Object.assign(merged, schema)
  }
  
  return merged
}