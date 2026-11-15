// Server-side settings, read and checked when first needed. Values are never logged.
import { z } from "zod";
import { isTimeZone } from "@/domain/time";

const schema = z.object({
  EVENT_TIMEZONE: z.string().refine(isTimeZone, "EVENT_TIMEZONE must be an IANA time zone"),
  SESSION_KEY: z.string().min(32, "SESSION_KEY must be at least 32 characters"),
  ADMIN_PASSPHRASE_HASH: z.string().startsWith("scrypt:", "ADMIN_PASSPHRASE_HASH is not set"),
});

export type ServerEnv = z.infer<typeof schema>;

export function serverEnv(): ServerEnv {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    // Names only: the messages above never contain a value.
    throw new Error(parsed.error.issues.map((issue) => issue.message).join("; "));
  }
  return parsed.data;
}
