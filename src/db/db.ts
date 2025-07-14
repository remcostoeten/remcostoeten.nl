import 'dotenv/config';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

const client = createClient({

url:'libsql://liberal-maximus-remcostoeten.aws-eu-west-1.turso.io',
	authToken:'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NTI0NTQ1ODYsImlkIjoiNmRkNzc3NGMtNGQ2ZS00MzFkLTgyYWItMDkwZjNhZWVlODFjIiwicmlkIjoiYjJmNzdhM2QtZDRiMi00OGYyLThlYTktODIzZmJmOGQyOTVlIn0.PxDz-jXyJFi9l1-gDrL74ieU-_8m-xmukG2oIuKm348Bcj9kQdEYkbD7MewIuYIOHLw6TIE_xTWRe3Bi_40QAQ'
});

export const db = drizzle({ client });
