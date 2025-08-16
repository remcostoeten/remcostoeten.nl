import type { TDrizzleSchema, TFieldDefinition, TCodeGenType, TFileSystemSnapshot } from './types';

export function parseDrizzleSchema(content: string): TDrizzleSchema[] {
  const schemas: TDrizzleSchema[] = [];
  const lines = content.split('\n');
  
  let currentTable: TDrizzleSchema | null = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    const tableMatch = trimmed.match(/export const (\w+) = pgTable\("(\w+)",\s*{/);
    if (tableMatch) {
      currentTable = {
        tableName: tableMatch[2],
        fields: [],
        exports: [tableMatch[1]]
      };
      continue;
    }
    
    if (currentTable && trimmed === '});') {
      schemas.push(currentTable);
      currentTable = null;
      continue;
    }
    
    if (currentTable && trimmed.includes(':')) {
      const fieldMatch = trimmed.match(/(\w+):\s*(.+),?/);
      if (fieldMatch) {
        const field: TFieldDefinition = {
          name: fieldMatch[1],
          type: extractFieldType(fieldMatch[2]),
          constraints: extractConstraints(fieldMatch[2])
        };
        currentTable.fields.push(field);
      }
    }
  }
  
  return schemas;
}

function extractFieldType(definition: string): string {
  const typeMatch = definition.match(/(\w+)\(/);
  return typeMatch ? typeMatch[1] : 'unknown';
}

function extractConstraints(definition: string): string[] {
  const constraints: string[] = [];
  
  if (definition.includes('.primaryKey()')) constraints.push('primaryKey');
  if (definition.includes('.notNull()')) constraints.push('notNull');
  if (definition.includes('.unique()')) constraints.push('unique');
  if (definition.includes('.default(')) constraints.push('default');
  if (definition.includes('.defaultNow()')) constraints.push('defaultNow');
  
  return constraints;
}

export function generateSolidStartCode(
  schema: TDrizzleSchema,
  codeType: TCodeGenType
): string {
  switch (codeType) {
    case 'server-functions':
      return generateServerFunctions(schema);
    case 'api-routes':
      return generateApiRoutes(schema);
    case 'crud-operations':
      return generateCrudOperations(schema);
    case 'type-definitions':
      return generateTypeDefinitions(schema);
    default:
      return '';
  }
}

function generateServerFunctions(schema: TDrizzleSchema): string {
  const tableName = schema.tableName;
  const exportName = schema.exports[0];
  const typeName = `T${capitalizeFirst(tableName)}`;
  
  return `import { action, query } from "@solidjs/router";
import { eq } from "drizzle-orm";
import { createDb } from "~/db/client";
import { ${exportName} } from "~/db/schema";

export type ${typeName} = typeof ${exportName}.$inferSelect;
export type ${typeName}Insert = typeof ${exportName}.$inferInsert;

export const get${capitalizeFirst(tableName)}s = query(async () => {
  "use server";
  const db = createDb();
  return await db.select().from(${exportName});
}, "${tableName}s");

export const get${capitalizeFirst(tableName)}ById = query(async (id: number) => {
  "use server";
  const db = createDb();
  const [result] = await db.select().from(${exportName}).where(eq(${exportName}.id, id)).limit(1);
  return result || null;
}, "${tableName}ById");

export const create${capitalizeFirst(tableName)} = action(async (data: ${typeName}Insert) => {
  "use server";
  const db = createDb();
  const [result] = await db.insert(${exportName}).values(data).returning();
  return result;
});

export const update${capitalizeFirst(tableName)} = action(async (id: number, data: Partial<${typeName}Insert>) => {
  "use server";
  const db = createDb();
  const [result] = await db.update(${exportName}).set(data).where(eq(${exportName}.id, id)).returning();
  return result;
});

export const delete${capitalizeFirst(tableName)} = action(async (id: number) => {
  "use server";
  const db = createDb();
  await db.delete(${exportName}).where(eq(${exportName}.id, id));
  return { success: true };
});`;
}

function generateApiRoutes(schema: TDrizzleSchema): string {
  const tableName = schema.tableName;
  const exportName = schema.exports[0];
  
  return `import { json } from "@solidjs/router";
import { eq } from "drizzle-orm";
import { createDb } from "~/db/client";
import { ${exportName} } from "~/db/schema";

export async function GET() {
  const db = createDb();
  const results = await db.select().from(${exportName});
  return json(results);
}

export async function POST(event: any) {
  const data = await event.request.json();
  const db = createDb();
  const [result] = await db.insert(${exportName}).values(data).returning();
  return json(result, { status: 201 });
}

export async function PUT(event: any) {
  const data = await event.request.json();
  const { id, ...updateData } = data;
  
  if (!id) {
    return json({ error: "ID is required" }, { status: 400 });
  }
  
  const db = createDb();
  const [result] = await db.update(${exportName}).set(updateData).where(eq(${exportName}.id, id)).returning();
  
  if (!result) {
    return json({ error: "${capitalizeFirst(tableName)} not found" }, { status: 404 });
  }
  
  return json(result);
}

export async function DELETE(event: any) {
  const url = new URL(event.request.url);
  const id = url.searchParams.get("id");
  
  if (!id) {
    return json({ error: "ID is required" }, { status: 400 });
  }
  
  const db = createDb();
  await db.delete(${exportName}).where(eq(${exportName}.id, parseInt(id)));
  return json({ success: true });
}`;
}

function generateCrudOperations(schema: TDrizzleSchema): string {
  const tableName = schema.tableName;
  const exportName = schema.exports[0];
  const typeName = `T${capitalizeFirst(tableName)}`;
  
  return `import { eq, and, or, desc, asc } from "drizzle-orm";
import { createDb } from "~/db/client";
import { ${exportName} } from "~/db/schema";

export type ${typeName} = typeof ${exportName}.$inferSelect;
export type ${typeName}Insert = typeof ${exportName}.$inferInsert;
export type ${typeName}Update = Partial<${typeName}Insert>;

export class ${capitalizeFirst(tableName)}Service {
  private db = createDb();

  async findAll(): Promise<${typeName}[]> {
    return await this.db.select().from(${exportName});
  }

  async findById(id: number): Promise<${typeName} | null> {
    const [result] = await this.db.select().from(${exportName}).where(eq(${exportName}.id, id)).limit(1);
    return result || null;
  }

  async findMany(limit = 10, offset = 0): Promise<${typeName}[]> {
    return await this.db.select().from(${exportName}).limit(limit).offset(offset);
  }

  async create(data: ${typeName}Insert): Promise<${typeName}> {
    const [result] = await this.db.insert(${exportName}).values(data).returning();
    return result;
  }

  async update(id: number, data: ${typeName}Update): Promise<${typeName} | null> {
    const [result] = await this.db.update(${exportName}).set(data).where(eq(${exportName}.id, id)).returning();
    return result || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.delete(${exportName}).where(eq(${exportName}.id, id));
    return result.rowCount > 0;
  }

  async exists(id: number): Promise<boolean> {
    const [result] = await this.db.select({ id: ${exportName}.id }).from(${exportName}).where(eq(${exportName}.id, id)).limit(1);
    return !!result;
  }
}

export const ${tableName}Service = new ${capitalizeFirst(tableName)}Service();`;
}

function generateTypeDefinitions(schema: TDrizzleSchema): string {
  const tableName = schema.tableName;
  const exportName = schema.exports[0];
  const typeName = `T${capitalizeFirst(tableName)}`;
  
  const fields = schema.fields.map(field => {
    const optional = field.constraints.includes('default') || field.constraints.includes('defaultNow') ? '?' : '';
    return `  ${field.name}${optional}: ${mapDrizzleTypeToTS(field.type)};`;
  }).join('\n');
  
  return `export type ${typeName} = {
${fields}
};

export type ${typeName}Insert = Omit<${typeName}, 'id' | 'createdAt' | 'updatedAt'>;

export type ${typeName}Update = Partial<${typeName}Insert>;

export type ${typeName}Response = {
  data: ${typeName};
  success: boolean;
  error?: string;
};

export type ${typeName}ListResponse = {
  data: ${typeName}[];
  total: number;
  page: number;
  limit: number;
  success: boolean;
  error?: string;
};`;
}

function mapDrizzleTypeToTS(drizzleType: string): string {
  switch (drizzleType) {
    case 'serial':
    case 'integer':
      return 'number';
    case 'varchar':
    case 'text':
      return 'string';
    case 'boolean':
      return 'boolean';
    case 'timestamp':
      return 'Date';
    case 'jsonb':
      return 'any';
    default:
      return 'unknown';
  }
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function findSchemaFiles(snapshot: TFileSystemSnapshot): string[] {
  return Object.keys(snapshot.files).filter(path => 
    path.includes('schema') && (path.endsWith('.ts') || path.endsWith('.tsx'))
  );
}

export function getAllSchemas(snapshot: TFileSystemSnapshot): TDrizzleSchema[] {
  const schemaFiles = findSchemaFiles(snapshot);
  const allSchemas: TDrizzleSchema[] = [];
  
  for (const filePath of schemaFiles) {
    const content = snapshot.files[filePath];
    const schemas = parseDrizzleSchema(content);
    allSchemas.push(...schemas);
  }
  
  return allSchemas;
}
