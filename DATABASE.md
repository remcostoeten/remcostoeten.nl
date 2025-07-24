# Database Setup

This project uses **Drizzle ORM** with **PostgreSQL** running in Docker for persistent local development.

## 🚀 Quick Start

1. **Start the database:**
   ```bash
   npm run db:up
   ```

2. **Push the schema to database:**
   ```bash
   npm run db:push
   ```

3. **Seed with sample data:**
   ```bash
   npm run db:seed
   ```

4. **Open Drizzle Studio (optional):**
   ```bash
   npm run db:studio
   ```

## 📋 Available Scripts

### Database Management
- `npm run db:up` - Start PostgreSQL container
- `npm run db:down` - Stop all containers
- `npm run db:logs` - View PostgreSQL logs
- `npm run db:reset` - Reset database (removes all data)

### Schema Management
- `npm run db:generate` - Generate migration files
- `npm run db:migrate` - Run migrations
- `npm run db:push` - Push schema changes directly
- `npm run db:studio` - Open Drizzle Studio

### Data Management
- `npm run db:seed` - Seed database with sample data

### Admin Tools
- `npm run pgadmin` - Start pgAdmin (web interface)

## 🐳 Docker Services

### PostgreSQL
- **Container**: `remco-portfolio-db`
- **Port**: `5432`
- **Database**: `portfolio_db`
- **User**: `portfolio_user`
- **Password**: `portfolio_password`

### pgAdmin (Optional)
- **Container**: `remco-portfolio-pgadmin`
- **Port**: `5050`
- **Email**: `admin@remcostoeten.nl`
- **Password**: `admin_password`

## 📊 Database Schema

### Tables

#### `projects`
- Portfolio projects with metadata
- Technologies, highlights, metrics
- Featured/published flags

#### `skills`
- Technical skills with proficiency levels
- Categorized and ordered

#### `experience`
- Work experience entries
- Achievements and technologies used

#### `contact_submissions`
- Contact form submissions
- Status tracking and metadata

#### `site_settings`
- Key-value configuration store
- Public/private settings

#### `analytics_events`
- Simple analytics tracking
- Page views and user interactions

## 🔧 Configuration

### Environment Variables
```bash
DATABASE_URL="postgresql://portfolio_user:portfolio_password@localhost:5432/portfolio_db"
DB_HOST="localhost"
DB_PORT=5432
DB_NAME="portfolio_db"
DB_USER="portfolio_user"
DB_PASSWORD="portfolio_password"
```

### Drizzle Configuration
Located in `drizzle.config.ts`:
- Schema: `./src/db/schema.ts`
- Migrations: `./src/db/migrations`
- Dialect: `postgresql`

## 📁 File Structure

```
src/db/
├── connection.ts     # Database connection setup
├── schema.ts         # Table definitions and types
├── utils.ts          # Database utility functions
├── seed.ts           # Sample data seeding
└── migrations/       # Generated migration files
```

## 🔗 Usage in Application

```typescript
import { db } from '@/db/connection';
import { getAllProjects, getFeaturedProjects } from '@/db/utils';

// Get all published projects
const projects = await getAllProjects();

// Get only featured projects
const featured = await getFeaturedProjects();
```

## 🛠️ Development Workflow

1. **Make schema changes** in `src/db/schema.ts`
2. **Generate migrations**: `npm run db:generate`
3. **Apply changes**: `npm run db:push` or `npm run db:migrate`
4. **Update seed data** if needed in `src/db/seed.ts`
5. **Test changes** with `npm run db:studio`

## 🗄️ Data Persistence

- Database data is persisted in Docker volume `postgres_data`
- Data survives container restarts
- Use `npm run db:reset` to completely reset (⚠️ **destroys all data**)

## 🔍 Troubleshooting

### Database Connection Issues
```bash
# Check if container is running
docker ps

# View logs
npm run db:logs

# Restart database
npm run db:down && npm run db:up
```

### Schema Sync Issues
```bash
# Force push schema
npm run db:push

# Or reset and reseed
npm run db:reset
sleep 10
npm run db:push
npm run db:seed
```

### Port Conflicts
If port 5432 is in use, edit `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # Use different host port
```

Then update `.env`:
```bash
DATABASE_URL="postgresql://portfolio_user:portfolio_password@localhost:5433/portfolio_db"
```
