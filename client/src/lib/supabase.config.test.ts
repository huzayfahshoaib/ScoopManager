import { describe, expect, it } from "vitest";

describe("Supabase browser configuration", () => {
  it("accepts the configured project URL and publishable key", async () => {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

    expect(url).toMatch(/^https:\/\/[a-z0-9-]+\.supabase\.co$/);
    expect(key).toBeTruthy();

    const response = await fetch(`${url}/rest/v1/items?select=id&limit=1`, {
      headers: {
        apikey: key!,
        Authorization: `Bearer ${key!}`,
      },
    });

    expect(response.status).not.toBe(404);
    expect(response.status).not.toBe(401);
  });
});
