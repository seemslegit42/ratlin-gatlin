---
layout: article
title: Database permissions
description: Enhance data security and access control with Appwrite Database Permissions. Learn how to set permissions and access rules for your database tables
---

Permissions define who can access rows in a table. By default **no permissions** are granted to any users, so no user can access any rows.
Permissions exist at two levels, table level and row level permissions.

In Appwrite, permissions are **granted**, meaning a user has no access by default and receive access when granted.
A user with access granted at either table level or row level will be able to access a row.
Users **don't need access at both levels** to access rows.

# Table level
Table level permissions apply to every row in the table.
If a user has read, create, update, or delete permissions at the table level, the user can access **all rows** inside the table.

Configure table level permissions by navigating to **Your table** > **Settings** > **Permissions**.

[Learn more about permissions and roles](/docs/advanced/security/permissions)

### Table Level SDK Example
```typescript
import { Client, TablesDB, Permission, Role } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT!)
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const tablesDB = new TablesDB(client);

// Update table permissions so all authenticated users can read, and admin team can write
await tablesDB.updateTable({
  databaseId: 'sovereign',
  tableId: 'published_micro_apps',
  name: 'Published Micro-Apps',
  permissions: [
    Permission.read(Role.users()),
    Permission.create(Role.team('admin')),
    Permission.update(Role.team('admin')),
    Permission.delete(Role.team('admin')),
  ],
});
```

# Row level
Row level permissions grant access to individual rows.
If a user has read, create, update, or delete permissions at the row level, the user can access the **individual row**.

Row level permissions are only applied if Row Security is enabled in the settings of your table.
Enable row level permissions by navigating to **Your table** > **Settings** > **Row security**.

Row level permissions are configured in individual rows.

[Learn more about permissions and roles](/docs/advanced/security/permissions)

### Enabling Row Security via Server SDK
```typescript
await tablesDB.updateTable({
  databaseId: 'sovereign',
  tableId: 'crm_contacts',
  name: 'CRM Contacts',
  permissions: [
    Permission.create(Role.users()), // Allows authenticated users to create rows
  ],
  rowSecurity: true, // Enables row-level permissions evaluation
});
```

### Setting Permissions on Individual Rows
When creating or updating a row, supply explicit `$permissions`:

```typescript
import { ID, Permission, Role } from 'node-appwrite';

const contactRow = await tablesDB.createRow({
  databaseId: 'sovereign',
  tableId: 'crm_contacts',
  rowId: ID.unique(),
  data: {
    syndicate_id: 'syn_alpha',
    name: 'Ada Lovelace',
    email: 'ada@analytical.engine',
    stage: 'lead',
  },
  permissions: [
    // Creator can read, update, and delete
    Permission.read(Role.user('usr_creator_id')),
    Permission.update(Role.user('usr_creator_id')),
    Permission.delete(Role.user('usr_creator_id')),
    // Syndicate teammates can read
    Permission.read(Role.team('syn_alpha')),
  ],
});
```

# Common use cases

For examples of how to implement common permission patterns, including creating private rows that are only accessible to their creators, see the [permissions examples](/docs/advanced/security/permissions#examples) in our platform documentation.

### 1. Private User Rows (Only accessible to creator)
- **Table Level:** Enable Row Security (`rowSecurity: true`). Grant `Permission.create(Role.users())` at the table level so logged-in users can insert new rows.
- **Row Level:** Attach `Permission.read(Role.user(userId))`, `Permission.update(Role.user(userId))`, and `Permission.delete(Role.user(userId))`. No other users can read or edit this row.

### 2. Syndicate / Team Collaboration
- **Table Level:** Enable Row Security (`rowSecurity: true`).
- **Row Level:** Attach `Permission.read(Role.team(syndicateId))`, `Permission.update(Role.team(syndicateId, 'lead'))`. All teammates can read, but only team members with the 'lead' role can mutate.

### 3. Public Read / Authenticated Write
- **Table Level:** Grant `Permission.read(Role.any())` and `Permission.create(Role.users())`. Disable or keep Row Security as needed.
- All users (including guest visitors) can read all rows. Only authenticated users can create new entries.

---

## Permission Summary Matrix

| Scope | How It Is Granted | Effect | Row Security Required? |
|-------|-------------------|--------|------------------------|
| **Table Level** | Table Settings > Permissions (`$permissions`) | Applies to **all rows** in the table | No |
| **Row Level** | Passed during row creation/update (`$permissions`) | Applies to **individual row** | **Yes** (`rowSecurity: true`) |
