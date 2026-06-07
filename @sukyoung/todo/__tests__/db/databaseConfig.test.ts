import { getDatabaseUrl } from "@/server/db/config";

describe("database config", () => {
  it("reads DATABASE_URL", () => {
    expect(
      getDatabaseUrl({
        DATABASE_URL: "postgres://postgres:postgres@localhost:5432/tika",
      }),
    ).toBe("postgres://postgres:postgres@localhost:5432/tika");
  });

  it("requires DATABASE_URL", () => {
    expect(() => getDatabaseUrl({})).toThrow("DATABASE_URL is required");
  });

  it("requires a PostgreSQL connection URL", () => {
    expect(() =>
      getDatabaseUrl({
        DATABASE_URL: "mysql://root:root@localhost:3306/tika",
      }),
    ).toThrow("DATABASE_URL must be a PostgreSQL connection URL");
  });
});
