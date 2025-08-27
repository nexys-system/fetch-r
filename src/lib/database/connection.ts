import { SQL as BunSQL } from "bun";
import * as T from "./type.js";

export class SQL {
  public pool: BunSQL | null;
  private connectionOptions: T.ConnectionOptions;
  private databaseType: T.DatabaseType;

  constructor(
    connectionOptions: T.ConnectionOptions,
    databaseType: T.DatabaseType
  ) {
    this.connectionOptions = connectionOptions;
    this.databaseType = databaseType;
    this.pool = null;

    // Set default ports based on database type
    if (!connectionOptions.port) {
      if (databaseType === "PostgreSQL") {
        connectionOptions.port = 5432;
      } else if (databaseType === "MySQL") {
        connectionOptions.port = 3306;
      }
    }

    // Initialize the connection based on database type
    this.initializeConnection();
  }

  private initializeConnection() {
    const { host, database, user, username, password, port } = this.connectionOptions;
    const dbUser = user || username;

    if (!database) {
      throw new Error("Database name is required");
    }

    if (this.databaseType === "PostgreSQL") {
      // PostgreSQL connection string
      const url = `postgres://${dbUser}:${password}@${host}:${port}/${database}`;
      this.pool = new BunSQL(url);
    } else if (this.databaseType === "MySQL") {
      // MySQL support is coming to Bun.SQL soon
      // For now, we'll use PostgreSQL as fallback or throw an error
      throw new Error("MySQL support in Bun.SQL is coming soon. Please use PostgreSQL for now.");
    } else if (this.databaseType === "SQLite") {
      // SQLite connection
      const url = database.startsWith(":memory:") ? ":memory:" : `sqlite://${database}`;
      this.pool = new BunSQL(url);
    } else {
      throw new Error(`Unsupported database type: ${this.databaseType}`);
    }
  }

  execQuery = async (query: string): Promise<any> => {
    if (!this.pool) {
      throw new Error("No pool initialized");
    }

    try {
      // For complex multi-statement queries, use simple() method
      if (query.includes(";") && query.split(";").filter(s => s.trim()).length > 1) {
        const result = await this.pool.unsafe(query);
        
        // Transform result to match expected format
        if (Array.isArray(result)) {
          // For SELECT queries
          return result;
        } else if (result && typeof result === "object") {
          // For INSERT/UPDATE/DELETE - transform to ResultSetHeader format
          return {
            constructor: { name: "ResultSetHeader" },
            insertId: result.lastInsertRowid || 0,
            affectedRows: result.changes || 0,
            fieldCount: 0,
            changedRows: result.changes || 0,
            serverStatus: 0,
            info: "",
            warningStatus: 0,
          };
        }
        return result;
      }

      // For single queries, use the unsafe method (since we're building SQL strings)
      const result = await this.pool.unsafe(query);

      // Transform the result to match the expected format
      if (Array.isArray(result)) {
        // SELECT query results
        return result;
      } else if (result && typeof result === "object") {
        // INSERT/UPDATE/DELETE results - transform to ResultSetHeader format
        return {
          constructor: { name: "ResultSetHeader" },
          insertId: result.lastInsertRowid || 0,
          affectedRows: result.changes || 0,
          fieldCount: 0,
          changedRows: result.changes || 0,
          serverStatus: 0,
          info: "",
          warningStatus: 0,
        };
      }

      return result;
    } catch (error) {
      console.error("Query execution error:", error);
      throw error;
    }
  };

  async close() {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
    }
  }
}

// Stores all connections in a map, can be called on demand
export const databases: Map<string, SQL> = new Map();