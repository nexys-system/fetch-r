import { SQL as BunSQL } from "bun";
import * as T from "./type.js";

export class SQL {
  public pool: BunSQL | null;

  get config() {
    return this.connectionOptions;
  }

  constructor(
    private connectionOptions: T.ConnectionOptions,
    private databaseType: T.DatabaseType
  ) {
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
    const { host, database, user, username, password, port } =
      this.connectionOptions;
    const dbUser = user || username;

    if (!database) {
      throw new Error("Database name is required");
    }

    if (this.databaseType === "PostgreSQL") {
      // PostgreSQL connection string
      const url = `postgres://${dbUser}:${password}@${host}:${port}/${database}`;
      this.pool = new BunSQL(url);
    } else if (this.databaseType === "MySQL") {
      // MySQL connection string
      const url = `mysql://${dbUser}:${password}@${host}:${port}/${database}`;
      this.pool = new BunSQL(url);
    } else if (this.databaseType === "SQLite") {
      // SQLite connection
      const url = database.startsWith(":memory:")
        ? ":memory:"
        : `sqlite://${database}`;
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
      // For SQLite with Bun.SQL, we need to detect if this is a mutation or query
      const isMutation = /^\s*(INSERT|UPDATE|DELETE)/i.test(query);

      if (isMutation && this.databaseType === "SQLite") {
        // For SQLite mutations, we need to execute and then get the metadata
        await this.pool.unsafe(query);

        // For SQLite, we need to get the changes and lastInsertRowid from the database
        // Since Bun.SQL doesn't directly return this info, we'll need to query for it
        try {
          const changesResult = await this.pool.unsafe(
            "SELECT changes() as changes, last_insert_rowid() as lastInsertRowid"
          );
          const metadata = changesResult[0] || {
            changes: 0,
            lastInsertRowid: 0,
          };

          return {
            constructor: { name: "ResultSetHeader" },
            insertId: metadata.lastInsertRowid || 0,
            affectedRows: metadata.changes || 0,
            fieldCount: 0,
            changedRows: metadata.changes || 0,
            serverStatus: 0,
            info: "",
            warningStatus: 0,
          };
        } catch (metaError) {
          // Fallback - assume operation succeeded if no error was thrown
          return {
            constructor: { name: "ResultSetHeader" },
            insertId: 0,
            affectedRows: 1, // Assume at least one row affected if no error
            fieldCount: 0,
            changedRows: 1,
            serverStatus: 0,
            info: "",
            warningStatus: 0,
          };
        }
      }

      if (isMutation && this.databaseType === "PostgreSQL") {
        // For PostgreSQL mutations, we need to handle the response differently
        try {
          const result = await this.pool.unsafe(query);

          // PostgreSQL mutations with RETURNING clauses return affected rows

          // PostgreSQL INSERT with RETURNING clause gives us the inserted data
          let affectedRows = 0;
          let insertId = 0;

          if (Array.isArray(result)) {
            // If we got back rows (e.g., from RETURNING clause), count them
            affectedRows = result.length;
            if (result.length > 0 && result[0] && result[0].id) {
              insertId = result[0].id;
            }
          } else if (result && typeof result === "object") {
            // Handle Bun.SQL result metadata for PostgreSQL
            if ("affectedRows" in result) {
              affectedRows = result.affectedRows || 0;
            } else if ("changes" in result) {
              affectedRows = result.changes || 0;
            } else {
              // For mutations that don't return specific metadata, assume success if no error
              affectedRows = 1;
            }

            if ("insertId" in result) {
              insertId = result.insertId || 0;
            }
          } else {
            // For basic mutations without specific metadata, assume success
            affectedRows = 1;
          }

          return {
            constructor: { name: "ResultSetHeader" },
            insertId: insertId,
            affectedRows: affectedRows,
            fieldCount: 0,
            changedRows: affectedRows,
            serverStatus: 0,
            info: "",
            warningStatus: 0,
          };
        } catch (pgError) {
          throw pgError;
        }
      }

      if (isMutation && this.databaseType === "MySQL") {
        // For MySQL mutations, handle the response similar to PostgreSQL but without RETURNING
        try {
          const result = await this.pool.unsafe(query);

          // MySQL mutations typically return empty arrays, we need to query metadata separately

          let affectedRows = 0;
          let insertId = 0;

          if (Array.isArray(result) && result.length === 0) {
            // MySQL returns empty array for successful mutations
            // We need to get the last insert ID and row count separately
            try {
              if (/^\s*INSERT/i.test(query)) {
                // For INSERT, get the last inserted ID
                const lastIdResult = await this.pool.unsafe(
                  "SELECT LAST_INSERT_ID() as lastInsertId"
                );
                if (lastIdResult && lastIdResult[0]) {
                  insertId = lastIdResult[0].lastInsertId || 0;
                }
                affectedRows = 1; // Assume 1 row inserted if no error
              } else if (/^\s*UPDATE/i.test(query)) {
                // For UPDATE, get affected rows count
                const rowCountResult = await this.pool.unsafe(
                  "SELECT ROW_COUNT() as affectedRows"
                );
                if (rowCountResult && rowCountResult[0]) {
                  affectedRows = rowCountResult[0].affectedRows || 0;
                }
              } else if (/^\s*DELETE/i.test(query)) {
                // For DELETE, get affected rows count
                const rowCountResult = await this.pool.unsafe(
                  "SELECT ROW_COUNT() as affectedRows"
                );
                if (rowCountResult && rowCountResult[0]) {
                  affectedRows = rowCountResult[0].affectedRows || 0;
                }
              } else {
                // For other mutations, assume success
                affectedRows = 1;
              }
            } catch (metaError) {
              // If we can't get metadata, assume success if no error was thrown
              affectedRows = 1;
            }
          } else if (result && typeof result === "object") {
            // Handle other possible result metadata formats
            if ("affectedRows" in result) {
              affectedRows = result.affectedRows || 0;
            } else if ("insertId" in result) {
              insertId = result.insertId || 0;
              affectedRows = 1;
            } else {
              // For mutations that don't return specific metadata, assume success
              affectedRows = 1;
            }
          } else {
            // For basic mutations without specific metadata, assume success
            affectedRows = 1;
          }

          return {
            constructor: { name: "ResultSetHeader" },
            insertId: insertId,
            affectedRows: affectedRows,
            fieldCount: 0,
            changedRows: affectedRows,
            serverStatus: 0,
            info: "",
            warningStatus: 0,
          };
        } catch (mysqlError) {
          throw mysqlError;
        }
      }

      // For SELECT queries or non-SQLite databases
      const result = await this.pool.unsafe(query);

      // For multi-statement queries
      if (
        query.includes(";") &&
        query.split(";").filter((s) => s.trim()).length > 1
      ) {
        return result;
      }

      // Transform the result to match the expected format
      if (Array.isArray(result)) {
        // SELECT query results
        return result;
      } else if (result && typeof result === "object") {
        // INSERT/UPDATE/DELETE results for other databases
        const changes = result.changes || 0;
        const insertId = result.lastInsertRowid || 0;

        return {
          constructor: { name: "ResultSetHeader" },
          insertId: insertId,
          affectedRows: changes,
          fieldCount: 0,
          changedRows: changes,
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
