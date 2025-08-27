import { serve } from "bun";
import { port, version, sha } from "./config.js";
import * as Middleware from "./middleware/index.js";
import * as QueryService from "./lib/exec.js";
import * as ModelService from "./service/model/index.js";
import * as DatabaseService from "./service/database/index.js";
import * as AggregateService from "./lib/query-builder/aggregate/index.js";

const databaseType = "MySQL";

interface RequestContext {
  jwtContent?: any;
}

async function parseBody(req: Request) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

async function handleAggregate(req: Request, ctx: RequestContext) {
  const body = await parseBody(req);
  
  try {
    const model = ModelService.getModel(ctx.jwtContent);
    const connectionPool = DatabaseService.getPool(ctx.jwtContent);
    
    const result = await AggregateService.exec(body, model, connectionPool);
    return Response.json(result);
  } catch (err) {
    if ((err as any).message === "could not find model") {
      return new Response(JSON.stringify({ error: "could not find model" }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ error: (err as any).message }), { 
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
}

async function handleQuery(req: Request, ctx: RequestContext) {
  const body = await parseBody(req);
  const url = new URL(req.url);
  const sqlScript = url.searchParams.get("sqlScript");
  
  try {
    const model = ModelService.getModel(ctx.jwtContent);
    const connectionPool = DatabaseService.getPool(ctx.jwtContent);
    
    if (sqlScript) {
      const sql = QueryService.getSQL(body, model, databaseType);
      return Response.json({ sql });
    }
    
    const result = await QueryService.exec(body, model, connectionPool, databaseType);
    return Response.json(result);
  } catch (err) {
    if ((err as any).message === "could not find model") {
      return new Response(JSON.stringify({ error: "could not find model" }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ error: (err as any).message }), { 
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
}

async function handleMutate(req: Request, ctx: RequestContext) {
  const body = await parseBody(req);
  const url = new URL(req.url);
  const sqlScript = url.searchParams.get("sqlScript");
  
  try {
    const model = ModelService.getModel(ctx.jwtContent);
    const connectionPool = DatabaseService.getPool(ctx.jwtContent);
    
    if (sqlScript) {
      const sql = QueryService.getSQLMutate(body, model, databaseType);
      return Response.json({ sql });
    }
    
    const result = await QueryService.mutate(body, model, connectionPool, databaseType);
    return Response.json(result);
  } catch (err) {
    if ((err as any).message === "could not find model") {
      return new Response(JSON.stringify({ error: "could not find model" }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ error: (err as any).message }), { 
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
}

async function authenticate(req: Request): Promise<RequestContext | Response> {
  const headers = req.headers;
  
  try {
    // Check content type
    const contentType = headers.get("content-type");
    if (!contentType || contentType !== "application/json") {
      throw new Error("content type must be json");
    }
    
    // Extract and verify JWT
    const authorization = headers.get("authorization") || undefined;
    const jwtContent = Middleware.extractAndVerify({ authorization });
    
    return { jwtContent };
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export function createServer() {
  return serve({
    port,
    async fetch(req) {
      const url = new URL(req.url);
      const pathname = url.pathname;
      const method = req.method;
      
      // Root route
      if (pathname === "/" && method === "GET") {
        return Response.json({
          msg: "fetch-r",
          sha,
          version,
        });
      }
      
      // Protected routes
      if (pathname === "/aggregate" && method === "POST") {
        const authResult = await authenticate(req);
        if (authResult instanceof Response) return authResult;
        return handleAggregate(req, authResult);
      }
      
      if ((pathname === "/data" || pathname === "/query") && method === "POST") {
        const authResult = await authenticate(req);
        if (authResult instanceof Response) return authResult;
        return handleQuery(req, authResult);
      }
      
      if (pathname === "/mutate" && method === "POST") {
        const authResult = await authenticate(req);
        if (authResult instanceof Response) return authResult;
        return handleMutate(req, authResult);
      }
      
      // Model routes
      if (pathname.startsWith("/model")) {
        return handleModelRoutes(req, pathname);
      }
      
      // Database routes
      if (pathname.startsWith("/database")) {
        return handleDatabaseRoutes(req, pathname);
      }
      
      // GraphQL routes
      if (pathname.startsWith("/graphql")) {
        return handleGraphQLRoutes(req, pathname);
      }
      
      // 404 for everything else
      return new Response("Not Found", { status: 404 });
    },
  });
}

// Handler for model routes
async function handleModelRoutes(req: Request, pathname: string) {
  const authResult = await authenticate(req);
  if (authResult instanceof Response) return authResult;
  
  if (pathname === "/model/set" && req.method === "POST") {
    const body = await parseBody(req);
    try {
      await ModelService.set(authResult.jwtContent, body);
      return Response.json({ success: true });
    } catch (err) {
      return new Response(JSON.stringify({ error: (err as any).message }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  
  if (pathname === "/model" && req.method === "GET") {
    try {
      const model = ModelService.getModel(authResult.jwtContent);
      return Response.json(model);
    } catch (err) {
      return new Response(JSON.stringify({ error: (err as any).message }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  
  return new Response("Not Found", { status: 404 });
}

// Handler for database routes
async function handleDatabaseRoutes(req: Request, pathname: string) {
  const authResult = await authenticate(req);
  if (authResult instanceof Response) return authResult;
  
  if (pathname === "/database/set" && req.method === "POST") {
    const body = await parseBody(req);
    try {
      await DatabaseService.set(authResult.jwtContent, body);
      return Response.json({ success: true });
    } catch (err) {
      return new Response(JSON.stringify({ error: (err as any).message }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  
  if (pathname === "/database" && req.method === "GET") {
    try {
      const database = DatabaseService.get(authResult.jwtContent);
      return Response.json(database);
    } catch (err) {
      return new Response(JSON.stringify({ error: (err as any).message }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  
  return new Response("Not Found", { status: 404 });
}

// Handler for GraphQL routes
async function handleGraphQLRoutes(req: Request, pathname: string) {
  // GraphQL typically doesn't require authentication for introspection
  // but does for actual queries
  
  if (pathname === "/graphql" && req.method === "POST") {
    const authResult = await authenticate(req);
    if (authResult instanceof Response) return authResult;
    
    await parseBody(req); // Parse body but not used yet
    
    try {
      // This would need proper GraphQL handling
      // For now, just return a placeholder
      return Response.json({ 
        error: "GraphQL support needs to be migrated from Koa" 
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: (err as any).message }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  
  return new Response("Not Found", { status: 404 });
}

export default createServer;