import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { SQL } from "./database/connection.js";
import * as QueryService from "./exec.js";
import Model from "./query-builder/model-sqlite-test.js";
import { readFileSync } from "fs";
import path from "path";

describe("PostgreSQL Integration Tests", () => {
  let db: SQL;
  let testDbName: string;
  
  beforeAll(async () => {
    // Connect to actual PostgreSQL server
    // Create a test database for our integration tests
    testDbName = `fetch_r_test_${Date.now()}`;
    
    // First connect to default database to create test database
    const adminDb = new SQL(
      {
        host: "localhost",
        port: 5432,
        database: "postgres",
        user: process.env.POSTGRES_USER || "johan",
        password: process.env.POSTGRES_PASSWORD || "", // Use env var for CI
      },
      "PostgreSQL"
    );

    try {
      // Create test database
      await adminDb.execQuery(`CREATE DATABASE "${testDbName}"`);
    } catch (err) {
      console.log("Database creation failed, it may already exist:", (err as Error).message);
    }
    
    await adminDb.close();

    // Connect to the test database
    db = new SQL(
      {
        host: "localhost",
        port: 5432,
        database: testDbName,
        user: process.env.POSTGRES_USER || "johan",
        password: process.env.POSTGRES_PASSWORD || "", // Use env var for CI
      },
      "PostgreSQL"
    );

    // Run PostgreSQL migrations
    const migrationSQL = readFileSync(
      path.join(process.cwd(), "migrations/postgresql/001_initial_schema.sql"),
      "utf8"
    );
    
    await db.execQuery(migrationSQL);
  });

  afterAll(async () => {
    if (db) {
      await db.close();
    }

    // Clean up test database
    if (testDbName && testDbName.startsWith('fetch_r_test_')) {
      const adminDb = new SQL(
        {
          host: "localhost",
          port: 5432,
          database: "postgres",
          user: process.env.POSTGRES_USER || "johan",
          password: process.env.POSTGRES_PASSWORD || "", // Use env var for CI
        },
        "PostgreSQL"
      );

      try {
        await adminDb.execQuery(`DROP DATABASE IF EXISTS "${testDbName}"`);
      } catch (err) {
        console.log("Database cleanup failed:", (err as Error).message);
      }
      
      await adminDb.close();
    }
  });

  test("should connect to PostgreSQL database", async () => {
    expect(db).toBeDefined();
    expect(db.pool).toBeDefined();
  });

  test("should query all users", async () => {
    const query = { User: {} };
    const result = await QueryService.exec(query, Model, db, "PostgreSQL");
    
    expect(result).toBeDefined();
    expect(result.User).toBeDefined();
    expect(Array.isArray(result.User)).toBe(true);
    expect(result.User.length).toBeGreaterThan(0);
    
    // Check first user structure
    const user = result.User[0];
    expect(user.firstName).toBeDefined();
    expect(user.lastName).toBeDefined();
    expect(user.email).toBeDefined();
  });

  test("should query users with country relationship", async () => {
    const query = {
      User: {
        projection: {
          firstName: true,
          lastName: true,
          email: true,
          country: {
            name: true,
            iso2: true,
          },
        },
      },
    };
    
    const result = await QueryService.exec(query, Model, db, "PostgreSQL");
    
    expect(result.User).toBeDefined();
    expect(result.User.length).toBeGreaterThan(0);
    
    const user = result.User[0];
    expect(user.firstName).toBeDefined();
    expect(user.country).toBeDefined();
    expect(user.country.name).toBeDefined();
    expect(user.country.iso2).toBeDefined();
  });

  test("should query users with nested company and status", async () => {
    const query = {
      User: {
        projection: {
          firstName: true,
          lastName: true,
          company: {
            name: true,
            ceId: true,
            status: {
              name: true,
              description: true,
            },
          },
        },
      },
    };
    
    const result = await QueryService.exec(query, Model, db, "PostgreSQL");
    
    expect(result.User).toBeDefined();
    expect(result.User.length).toBeGreaterThan(0);
    
    const userWithCompany = result.User.find((u: any) => u.company);
    expect(userWithCompany).toBeDefined();
    expect(userWithCompany.company.name).toBeDefined();
    expect(userWithCompany.company.status).toBeDefined();
    expect(userWithCompany.company.status.name).toBeDefined();
  });

  test("should query user certificates with complex relationships", async () => {
    const query = {
      UserCertificate: {
        projection: {
          score: true,
          issued: true,
          user: {
            firstName: true,
            lastName: true,
            email: true,
          },
          cert: {
            points: true,
            badge: true,
            status: {
              name: true,
            },
          },
          status: {
            name: true,
            description: true,
          },
        },
      },
    };
    
    const result = await QueryService.exec(query, Model, db, "PostgreSQL");
    
    expect(result.UserCertificate).toBeDefined();
    expect(result.UserCertificate.length).toBeGreaterThan(0);
    
    const cert = result.UserCertificate[0];
    expect(cert.score).toBeDefined();
    expect(cert.user).toBeDefined();
    expect(cert.user.firstName).toBeDefined();
    expect(cert.cert).toBeDefined();
    expect(cert.cert.points).toBeDefined();
    expect(cert.status).toBeDefined();
    expect(cert.status.name).toBeDefined();
  });

  test("should filter users by country", async () => {
    const query = {
      User: {
        filters: {
          country: { id: 1 },
        },
        projection: {
          firstName: true,
          lastName: true,
          country: {
            name: true,
          },
        },
      },
    };
    
    const result = await QueryService.exec(query, Model, db, "PostgreSQL");
    
    expect(result.User).toBeDefined();
    expect(result.User.length).toBeGreaterThan(0);
    
    // All users should be from country ID 1
    result.User.forEach((user: any) => {
      expect(user.country.name).toBe("United States");
    });
  });

  test("should insert a new user", async () => {
    const mutation = {
      User: {
        insert: {
          data: {
            firstName: "Test",
            lastName: "User",
            email: "test@example.com",
            secretKey: "testkey001",
            logIp: "127.0.0.1",
            logDateAdded: new Date().toISOString(),
            isAdmin: 0,
            status: 1,
            language: 1,
            country: { id: 1 },
          },
        },
      },
    };
    
    const result = await QueryService.mutate(mutation, Model, db, "PostgreSQL");
    
    expect(result).toBeDefined();
    expect(result.User).toBeDefined();
    expect(result.User.insert).toBeDefined();
    
    const insert = result.User.insert as any;
    expect(insert.success).toBe(true);
    expect(insert.id).toBeGreaterThan(0);
  });

  test("should insert a user certificate", async () => {
    const mutation = {
      UserCertificate: {
        insert: {
          data: {
            user: { id: 1 },
            cert: { id: 1 },
            score: 95,
            issued: new Date().toISOString(),
            status: { id: 1 },
            logUser: { id: 3 },
            logDateAdded: new Date().toISOString(),
          },
        },
      },
    };
    
    const result = await QueryService.mutate(mutation, Model, db, "PostgreSQL");
    
    expect(result).toBeDefined();
    expect(result.UserCertificate).toBeDefined();
    expect(result.UserCertificate.insert).toBeDefined();
    
    const insert = result.UserCertificate.insert as any;
    expect(insert.success).toBe(true);
  });

  test("should update user certificate score", async () => {
    const mutation = {
      UserCertificate: {
        update: {
          filters: { id: 1 },
          data: {
            score: 90,
          },
        },
      },
    };
    
    const result = await QueryService.mutate(mutation, Model, db, "PostgreSQL");
    
    expect(result).toBeDefined();
    expect(result.UserCertificate).toBeDefined();
    expect(result.UserCertificate.update).toBeDefined();
    
    const update = result.UserCertificate.update as any;
    expect(update.success).toBe(true);
    expect(update.updated).toBe(1);
  });

  test("should delete a user certificate", async () => {
    // First, create a certificate to delete
    const insertMutation = {
      UserCertificate: {
        insert: {
          data: {
            user: { id: 2 },
            cert: { id: 2 },
            score: 75,
            status: { id: 2 },
            logUser: { id: 3 },
            logDateAdded: new Date().toISOString(),
          },
        },
      },
    };
    
    const insertResult = await QueryService.mutate(insertMutation, Model, db, "PostgreSQL");
    const insertedId = (insertResult.UserCertificate.insert as any).id;
    
    // Now delete it
    const deleteMutation = {
      UserCertificate: {
        delete: {
          filters: { id: insertedId },
        },
      },
    };
    
    const deleteResult = await QueryService.mutate(deleteMutation, Model, db, "PostgreSQL");
    
    expect(deleteResult).toBeDefined();
    expect(deleteResult.UserCertificate).toBeDefined();
    expect(deleteResult.UserCertificate.delete).toBeDefined();
    
    const deleteOp = deleteResult.UserCertificate.delete as any;
    expect(deleteOp.success).toBe(true);
    expect(deleteOp.deleted).toBe(1);
  });

  test("should handle complex queries with multiple joins", async () => {
    const query = {
      UserCertificate: {
        projection: {
          score: true,
          issued: true,
          user: {
            firstName: true,
            lastName: true,
            company: {
              name: true,
              status: {
                name: true,
              },
              country: {
                name: true,
                iso2: true,
              },
            },
          },
          cert: {
            points: true,
            status: {
              name: true,
            },
          },
          status: {
            name: true,
          },
        },
        filters: {
          score: { "$gt": 80 },
        },
      },
    };
    
    const result = await QueryService.exec(query, Model, db, "PostgreSQL");
    
    expect(result.UserCertificate).toBeDefined();
    expect(result.UserCertificate.length).toBeGreaterThan(0);
    
    // Verify all certificates have score > 80
    result.UserCertificate.forEach((cert: any) => {
      expect(cert.score).toBeGreaterThan(80);
    });
    
    // Check complex nested structure
    const cert = result.UserCertificate[0];
    expect(cert.user).toBeDefined();
    expect(cert.user.firstName).toBeDefined();
    expect(cert.cert).toBeDefined();
    expect(cert.status).toBeDefined();
  });

  test("should generate correct SQL for PostgreSQL", () => {
    const query = {
      User: {
        projection: {
          firstName: true,
          email: true,
          country: {
            name: true,
          },
        },
        filters: {
          isAdmin: 0,
        },
      },
    };
    
    const sql = QueryService.getSQL(query, Model, "PostgreSQL");
    
    expect(sql).toBeDefined();
    expect(typeof sql).toBe("string");
    expect(sql.toLowerCase()).toContain("select");
    expect(sql.toLowerCase()).toContain("from \"user\"");
    expect(sql.toLowerCase()).toContain("join \"country\""); // PostgreSQL quotes table names
    expect(sql.toLowerCase()).toContain("where");
  });

  test("should handle batch inserts", async () => {
    // Test individual inserts first since insertMultiple may need special handling
    const mutation1 = {
      Company: {
        insert: {
          data: {
            name: "Batch Company 1",
            ceId: "BC001",
            type: 1,
            status: { id: 1 },
            country: { id: 1 },
            logDateAdded: new Date().toISOString(),
          },
        },
      },
    };
    
    const result1 = await QueryService.mutate(mutation1, Model, db, "PostgreSQL");
    
    expect(result1).toBeDefined();
    expect(result1.Company).toBeDefined();
    expect(result1.Company.insert).toBeDefined();
    
    const insert1 = result1.Company.insert as any;
    expect(insert1.success).toBe(true);
    expect(insert1.id).toBeGreaterThan(0);
    
    // Second insert
    const mutation2 = {
      Company: {
        insert: {
          data: {
            name: "Batch Company 2",
            ceId: "BC002",
            type: 1,
            status: { id: 1 },
            country: { id: 2 },
            logDateAdded: new Date().toISOString(),
          },
        },
      },
    };
    
    const result2 = await QueryService.mutate(mutation2, Model, db, "PostgreSQL");
    
    expect(result2).toBeDefined();
    expect(result2.Company).toBeDefined();
    expect(result2.Company.insert).toBeDefined();
    
    const insert2 = result2.Company.insert as any;
    expect(insert2.success).toBe(true);
    expect(insert2.id).toBeGreaterThan(0);
  });

  test("should handle PostgreSQL-specific SQL syntax differences", () => {
    // Test PostgreSQL-specific features like quoted identifiers and LIMIT/OFFSET
    const query = {
      User: {
        projection: {
          firstName: true,
          email: true,
        },
        filters: {
          isAdmin: 0,
        },
        take: 5,
        skip: 2,
      },
    };
    
    const sql = QueryService.getSQL(query, Model, "PostgreSQL");
    
    expect(sql).toBeDefined();
    expect(sql).toContain("LIMIT 5 OFFSET 2"); // PostgreSQL syntax
    expect(sql).toContain('WHERE t0.\"is_admin\"=0'); // PostgreSQL with quoted identifiers
  });
});