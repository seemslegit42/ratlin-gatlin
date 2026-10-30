# Appwrite authentication (browser SDK)

Matches `services/authService.ts` / `services/appwriteClient.ts`.

Signup:

```typescript
import { ID } from 'appwrite';
import { account } from './services/appwriteClient.js';

await account.create({
  userId: ID.unique(),
  email: 'user@example.com',
  password: 'password123',
  name: 'Sovereign',
});
```

Email/password session:

```typescript
await account.createEmailPasswordSession({
  email: 'user@example.com',
  password: 'password123',
});
const user = await account.get();
```

React Router loader (`services/authService.ts`):

```typescript
import { createReactRouterAuthLoader } from './services/authService.js';

export const loader = createReactRouterAuthLoader('/login');
```

Password recovery:

```typescript
await account.createRecovery({
  email: 'user@example.com',
  url: 'https://your-app/recovery',
});

await account.updateRecovery({
  userId: 'usr_123',
  secret: 'sec_from_email',
  password: 'newpassword123',
});
```

BEEP wrappers (same SDK calls):

```typescript
import {
  requestPasswordRecovery,
  completePasswordRecovery,
} from './services/authService.js';

await requestPasswordRecovery('user@example.com');
await completePasswordRecovery('usr_123', 'sec_from_email', 'newpassword123');
```

Routes in `App.tsx`:

```tsx
<Route path="/recovery" element={<PasswordRecovery />} />
<Route path="/forgot-password" element={<PasswordRecovery />} />
```
