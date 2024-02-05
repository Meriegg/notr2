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
    username: varchar("name").notNull(),
    email: varchar("email", {
      length: 128,
    })
      .unique()
      .notNull(),
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
    code: varchar("code", { length: 6 }).unique().notNull(),
    userId: uuid("userId")
      .references(() => users.id)
      .notNull(),
    expiresOn: timestamp("expiresOn").defaultNow().notNull(),
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
    sessionToken: varchar("sessionToken").unique().notNull(),
    expiresOn: timestamp("expiresOn").notNull(),
    createdOn: timestamp("createdOn").defaultNow(),
    userId: uuid("userId")
      .references(() => users.id)
      .notNull(),
    publicVerificationKey: varchar("publicVerificationKey").notNull(),
  },
  (userSessions) => {
    return {
      sessionTokenIndex: uniqueIndex("session_token_unique_index").on(
        userSessions.sessionToken,
      ),
    };
  },
);
