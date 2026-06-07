import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { getDatabaseUrl } from "./config";

const queryClient = postgres(getDatabaseUrl());

export const db = drizzle(queryClient, { schema });
