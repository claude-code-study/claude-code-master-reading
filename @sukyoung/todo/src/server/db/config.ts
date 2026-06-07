type DatabaseEnv = Record<string, string | undefined>;

export const getDatabaseUrl = (env: DatabaseEnv = process.env) => {
  const databaseUrl = env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(databaseUrl);
  } catch {
    throw new Error("DATABASE_URL must be a valid URL");
  }

  if (parsedUrl.protocol !== "postgres:" && parsedUrl.protocol !== "postgresql:") {
    throw new Error("DATABASE_URL must be a PostgreSQL connection URL");
  }

  return databaseUrl;
};
