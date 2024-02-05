import {
  pgTable,
  varchar,
  uuid,
  uniqueIndex,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    username: varchar("name"),
    email: varchar("email", {
      length: 128,
    }).unique(),
    verifiedEmails: varchar("verifiedEmails").array(),
  },
  (users) => {
    return { emailIndex: uniqueIndex("email_index").on(users.email) };
  },
);

export const authVerificationCodes = pgTable(
  "auth_verification_codes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: varchar("code", { length: 6 }).unique(),
    userId: uuid("userId").references(() => users.id),
    expiresOn: timestamp("expiresOn").defaultNow(),
    alreadyUsed: boolean("alreadyUsed").default(false),
  },
  (authVerificationCodes) => {
    return {
      codeUniqueIndex: uniqueIndex("code_unique_index").on(
        authVerificationCodes.code,
      ),
    };
  },
);

export const userSessions = pgTable(
  "user_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionToken: varchar("sessionToken").unique(),
    expiresOn: timestamp("expiresOn"),
    createdOn: timestamp("createdOn").defaultNow(),
    userId: uuid("userId").references(() => users.id),
  },
  (userSessions) => {
    return {
      sessionTokenIndex: uniqueIndex("session_token_unique_index").on(
        userSessions.sessionToken,
      ),
    };
  },
);
