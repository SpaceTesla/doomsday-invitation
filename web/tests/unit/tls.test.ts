import { describe, expect, it } from "vitest";
import { withFullVerification } from "@/db/tls";

// Placeholder strings only: no real host or credential.
const base = "postgresql://user:secret@ep-example-123456.region.aws.neon.tech/db";

describe("withFullVerification", () => {
  it.each(["require", "prefer", "verify-ca"])("raises sslmode=%s to verify-full", (mode) => {
    const raised = new URL(withFullVerification(`${base}?sslmode=${mode}&channel_binding=require`));
    expect(raised.searchParams.get("sslmode")).toBe("verify-full");
    expect(raised.searchParams.get("channel_binding")).toBe("require");
    expect(raised.username).toBe("user");
    expect(raised.password).toBe("secret");
    expect(raised.hostname).toBe("ep-example-123456.region.aws.neon.tech");
  });

  it("leaves verify-full, disable and a string without sslmode as they are", () => {
    for (const s of [
      `${base}?sslmode=verify-full`,
      `${base}?sslmode=disable`,
      "postgresql://throne:throne@localhost:54329/iron_throne",
    ]) {
      expect(withFullVerification(s)).toBe(s);
    }
  });

  it("returns a string it cannot read unchanged", () => {
    expect(withFullVerification("not a url")).toBe("not a url");
  });
});
