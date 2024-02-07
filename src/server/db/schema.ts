import { relations } from "drizzle-orm";
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
  },
  (users) => {
    return { emailIndex: uniqueIndex("email_index").on(users.email) };
  },
);

export const userRelations = relations(users, ({ many }) => ({
  notes: many(notes),
  folders: many(folders),
}));

export const verifiedEmails = pgTable("verified_emails", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email").unique(),
  userId: uuid("userId").references(() => users.id),
  verifiedOn: timestamp("verifiedOn").defaultNow(),
});

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
    verifiedEmail: varchar("verifiedEmail"),
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

export const folders = pgTable("folders", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name").notNull(),
  parentFolderId: uuid("folderId"),
  userId: uuid("userId").notNull(),
  createdOn: timestamp("createdOn").defaultNow(),
});

export const foldersRelations = relations(folders, ({ one }) => ({
  parentFolder: one(folders, {
    references: [folders.id],
    fields: [folders.parentFolderId],
  }),
  user: one(users, {
    references: [users.id],
    fields: [folders.userId],
  }),
}));

export const notes = pgTable("notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title").notNull(),
  content: varchar("content").notNull(),
  tags: varchar("tags").array(),
  folderId: uuid("folderId").references(() => folders.id),
  userId: uuid("userId").notNull(),
  createdOn: timestamp("createdOn").defaultNow(),
});

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, {
    references: [users.id],
    fields: [notes.userId],
  }),
  folder: one(folders, {
    references: [folders.id],
    fields: [notes.folderId],
  }),
}));
