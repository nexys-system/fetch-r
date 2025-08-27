# Fetch-R

[![Build and Test Package](https://github.com/nexys-system/fetch-r/actions/workflows/build.yml/badge.svg)](https://github.com/nexys-system/fetch-r/actions/workflows/build.yml)
[![Publish](https://github.com/nexys-system/fetch-r/actions/workflows/publish.yml/badge.svg)](https://github.com/nexys-system/fetch-r/actions/workflows/publish.yml)
[![Deploy to docker](https://github.com/nexys-system/fetch-r/actions/workflows/deploy.yml/badge.svg)](https://github.com/nexys-system/fetch-r/actions/workflows/deploy.yml)
[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
![Code style](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)

**A powerful, type-safe TypeScript ORM supporting MySQL, PostgreSQL, and SQLite with native Bun.SQL integration**

Built for modern applications requiring robust multi-database support with a clean, intuitive API.

[npm-image]: https://img.shields.io/npm/v/@nexys/fetchr.svg
[npm-url]: https://npmjs.org/package/@nexys/fetchr
[downloads-image]: https://img.shields.io/npm/dm/@nexys/fetchr.svg
[downloads-url]: https://npmjs.org/package/@nexys/fetchr.svg

## ✨ Features

- 🗄️ **Multi-Database Support**: MySQL, PostgreSQL, and SQLite
- ⚡ **Native Bun.SQL**: Powered by Bun's high-performance SQL client
- 🏷️ **Type-Safe**: Full TypeScript support with compile-time type checking
- 🔄 **Advanced Relationships**: Complex JOIN queries with nested projections
- 📊 **Flexible Querying**: Filtering, ordering, pagination, and aggregation
- 🔄 **CRUD Operations**: Create, Read, Update, Delete with transaction support

## 🚀 Quick Start

### Installation

```bash
bun add @nexys/fetchr
```

### Basic Usage

```typescript
import FetchR from "@nexys/fetchr";
import { Entity } from "@nexys/fetchr/dist/type";

// Define your data model
const model: Entity[] = [
  {
    name: "User",
    uuid: false,
    fields: [
      { name: "firstName", type: "String", optional: false },
      { name: "lastName", type: "String", optional: false },
      { name: "email", type: "String", optional: false },
      { name: "country", type: "Country", optional: false },
    ],
  },
  {
    name: "Country", 
    uuid: false,
    fields: [
      { name: "name", type: "String", optional: false },
      { name: "code", type: "String", optional: false },
    ],
  },
];

// Configure database connection
const dbConfig = {
  host: "localhost",
  username: "root",
  password: "password",
  database: "myapp",
  port: 3306,
};

const fetchr = new FetchR(dbConfig, model, "MySQL");

// Query with relationships
const users = await fetchr.query({
  User: {
    projection: {
      firstName: true,
      lastName: true,
      email: true,
      country: {
        name: true,
        code: true,
      },
    },
    filters: {
      country: { code: "US" }
    },
    take: 10,
  },
});

// Create new records
await fetchr.mutate({
  User: {
    insert: {
      data: {
        firstName: "John",
        lastName: "Doe", 
        email: "john@example.com",
        country: { id: 1 },
      },
    },
  },
});
```

## 🗄️ Database Support

### Supported Databases

| Database | Support | Features |
|----------|---------|----------|
| **MySQL** | ✅ Full | All ORM features, transactions, migrations |
| **PostgreSQL** | ✅ Full | All ORM features, RETURNING clauses, advanced types |
| **SQLite** | ✅ Full | In-memory & file-based, perfect for testing |

### Connection Examples

```typescript
// MySQL
const mysql = new FetchR({
  host: "localhost",
  port: 3306,
  username: "root", 
  password: "password",
  database: "myapp"
}, model, "MySQL");

// PostgreSQL  
const postgres = new FetchR({
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "password", 
  database: "myapp"
}, model, "PostgreSQL");

// SQLite
const sqlite = new FetchR({
  database: "./myapp.db"
  // or ":memory:" for in-memory
}, model, "SQLite");
```

## 🔍 Querying

### Basic Queries

```typescript
// Get all users
await fetchr.query({ User: {} });

// Get users with specific fields
await fetchr.query({
  User: {
    projection: {
      firstName: true,
      email: true,
    },
  },
});

// Filter users
await fetchr.query({
  User: {
    filters: {
      firstName: "John",
      isActive: true,
    },
  },
});
```

### Advanced Filtering

```typescript
// Operators
await fetchr.query({
  User: {
    filters: {
      age: { "$gt": 18, "$lt": 65 },
      email: { "$regex": "@company\\.com$" },
      country: { "$in": [1, 2, 3] },
    },
  },
});

// Null checks
await fetchr.query({
  User: {
    filters: {
      deletedAt: null, // IS NULL
      profileId: { "$neq": null }, // IS NOT NULL
    },
  },
});
```

### Relationships & JOINs

```typescript
// Deep nested relationships
await fetchr.query({
  UserCertificate: {
    projection: {
      score: true,
      issued: true,
      user: {
        firstName: true,
        lastName: true,
        company: {
          name: true,
          country: {
            name: true,
            code: true,
          },
        },
      },
      certificate: {
        name: true,
        points: true,
      },
    },
    filters: {
      score: { "$gt": 80 },
    },
  },
});
```

### Pagination & Ordering

```typescript
await fetchr.query({
  User: {
    projection: { firstName: true, email: true },
    filters: { isActive: true },
    order: { by: "firstName", desc: false },
    take: 20,
    skip: 40,
  },
});
```

## ✏️ Mutations

### Insert

```typescript
// Single insert
await fetchr.mutate({
  User: {
    insert: {
      data: {
        firstName: "Jane",
        lastName: "Smith", 
        email: "jane@example.com",
        country: { id: 1 },
      },
    },
  },
});

// Batch insert
await fetchr.mutate({
  User: {
    insert: {
      data: [
        { firstName: "User1", email: "user1@example.com" },
        { firstName: "User2", email: "user2@example.com" },
      ],
    },
  },
});
```

### Update

```typescript
await fetchr.mutate({
  User: {
    update: {
      filters: { id: 1 },
      data: {
        firstName: "UpdatedName",
        lastModified: new Date().toISOString(),
      },
    },
  },
});
```

### Delete

```typescript
await fetchr.mutate({
  User: {
    delete: {
      filters: { 
        isActive: false,
        lastLogin: { "$lt": "2023-01-01" },
      },
    },
  },
});
```

## 🏗️ Schema Definition

### Entity Structure

```typescript
interface Entity {
  name: string;           // Entity name (maps to table)
  uuid?: boolean;         // Use UUID primary key instead of auto-increment
  table?: string;         // Custom table name (optional)
  fields: Field[];        // Field definitions
}

interface Field {
  name: string;           // Field name (camelCase)
  type: FieldType;        // Data type or related entity
  optional: boolean;      // Can be null/undefined
  column?: string;        // Custom column name (optional)
}
```

### Supported Field Types

```typescript
type FieldType = 
  | "String"              // VARCHAR/TEXT
  | "Int"                 // INTEGER  
  | "Long"                // BIGINT
  | "Float"               // DECIMAL/FLOAT
  | "Double"              // DOUBLE
  | "Boolean"             // BOOLEAN/TINYINT
  | "LocalDate"           // DATE
  | "LocalDateTime"       // DATETIME/TIMESTAMP
  | "BigDecimal"          // DECIMAL
  | "JSON"                // JSON (MySQL/PostgreSQL)
  | string;               // Related entity name
```

### Naming Conventions

Fetch-R automatically converts between camelCase (TypeScript) and snake_case (SQL):

```typescript
// TypeScript model
{ name: "firstName", type: "String" }
{ name: "country", type: "Country" }

// Generated SQL
`first_name` VARCHAR(255)
`country_id` INT
```

## 🧪 Testing

Fetch-R includes comprehensive integration tests for all database types:

```bash
# Run all tests
bun test

# Test specific database
bun test src/lib/sqlite-integration.test.ts
bun test src/lib/postgresql-integration.test.ts  
bun test src/lib/mysql-integration.test.ts

# Test with real databases (requires setup)
POSTGRES_USER=postgres POSTGRES_PASSWORD=postgres bun test postgresql
MYSQL_USER=root MYSQL_PASSWORD="" bun test mysql
```

### Test Coverage

- ✅ Complex relationship queries
- ✅ All CRUD operations
- ✅ Database-specific SQL generation
- ✅ Error handling and edge cases
- ✅ Performance and concurrency

## 🔄 Migrations

Fetch-R includes a Flyway-inspired migration system:

```typescript
import { migrationToRow, getChecksum } from "@nexys/fetchr/dist/migrations/utils";

// Migration structure
interface Migration {
  version: string;        // e.g., "1.0", "1.1"
  idx: number;           // Sequence number
  name: string;          // Migration name
  sql: string;           // SQL content
}

// Generate migration metadata
const migration = migrationToRow(
  "create_users_table",   // name
  "1.0",                 // version  
  1000,                  // execution time (ms)
  1,                     // success (1 = success, 0 = failed)
  getChecksum(sql),      // checksum for integrity
  1                      // installed_rank
);
```

## 🌐 API Endpoints

When used as a web service, Fetch-R provides REST endpoints:

### Query Endpoint: `POST /query`

```javascript
// Request
{
  "User": {
    "projection": { "firstName": true, "email": true },
    "filters": { "isActive": true },
    "take": 10
  }
}

// Response  
{
  "User": [
    { "firstName": "John", "email": "john@example.com" },
    { "firstName": "Jane", "email": "jane@example.com" }
  ]
}
```

### Mutation Endpoint: `POST /mutate`

```javascript
// Request
{
  "User": {
    "insert": {
      "data": {
        "firstName": "New User",
        "email": "newuser@example.com"
      }
    }
  }
}

// Response
{
  "User": {
    "insert": {
      "success": true,
      "id": 123
    }
  }
}
```

## 🏭 Production Deployment

### Docker

```dockerfile
FROM oven/bun:1.2.21
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build
EXPOSE 3000
CMD ["bun", "start"]
```

### Environment Variables

```bash
# Database connections
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=app_user
DATABASE_PASSWORD=secure_password
DATABASE_NAME=production_db

# Server configuration  
PORT=3000
NODE_ENV=production
JWT_SECRET=your-secret-key
```

### Performance Tips

1. **Connection Pooling**: Fetch-R automatically manages connection pools
2. **Query Optimization**: Use projections to limit returned data
3. **Indexing**: Add database indexes for frequently filtered/ordered fields
4. **Pagination**: Always use `take`/`skip` for large datasets
5. **Relationships**: Be mindful of N+1 query issues with deep nesting

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
git clone https://github.com/nexys-system/fetch-r.git
cd fetch-r
bun install

# Start databases for testing
brew services start postgresql
brew services start mysql

# Run tests
bun test

# Build package
bun run build
```

## 📜 License

AGPL-3.0-or-later - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- **TypeScript Port of**: [Scala version](https://github.com/nexys-system/fetch-r-scala)
- **Documentation**: [API Docs](https://github.com/nexys-system/fetch-r/wiki)
- **Examples**: [Server Boilerplate](https://github.com/nexys-system/server-boilerplate)
- **Issues**: [Bug Reports & Feature Requests](https://github.com/nexys-system/fetch-r/issues)

---

Built with ❤️ by [Nexys](https://nexys.io) • Powered by [Bun](https://bun.sh)
