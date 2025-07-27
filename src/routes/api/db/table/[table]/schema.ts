import { APIEvent } from '@solidjs/start/server';
import { db } from '~/db/connection';
import { sql } from 'drizzle-orm';

export async function GET({ params }: APIEvent) {
  try {
    const tableName = params.table;

    if (!tableName) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Table name is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate table name to prevent SQL injection
    const validTableNameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    if (!validTableNameRegex.test(tableName)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid table name format'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get detailed schema information
    const schemaResult = await db.execute(sql`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length,
        numeric_precision,
        numeric_scale,
        ordinal_position
      FROM information_schema.columns 
      WHERE table_name = ${tableName}
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `);

    if (schemaResult.rows.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Table not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get primary key information
    const primaryKeyResult = await db.execute(sql`
      SELECT 
        kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.table_name = ${tableName}
      AND tc.table_schema = 'public'
      AND tc.constraint_type = 'PRIMARY KEY'
      ORDER BY kcu.ordinal_position
    `);

    const primaryKeys = primaryKeyResult.rows.map((row: any) => row.column_name);

    // Get foreign key information
    const foreignKeyResult = await db.execute(sql`
      SELECT 
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu 
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.table_name = ${tableName}
      AND tc.table_schema = 'public'
      AND tc.constraint_type = 'FOREIGN KEY'
    `);

    const foreignKeys = foreignKeyResult.rows.map((row: any) => ({
      column_name: row.column_name,
      foreign_table_name: row.foreign_table_name,
      foreign_column_name: row.foreign_column_name
    }));

    // Get table statistics
    const statsResult = await db.execute(sql.raw(`
      SELECT 
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation,
        most_common_vals,
        most_common_freqs
      FROM pg_stats 
      WHERE tablename = '${tableName}' 
      AND schemaname = 'public'
      LIMIT 10
    `));

    return new Response(JSON.stringify({
      success: true,
      data: {
        tableName,
        columns: schemaResult.rows,
        primaryKeys,
        foreignKeys,
        statistics: statsResult.rows
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Database schema fetch error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch table schema',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
