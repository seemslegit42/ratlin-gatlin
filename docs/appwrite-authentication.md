---
layout: article
title: Start with Authentication
description: Effortlessly add authentication to your apps - simple signup & login in just minutes with Appwrite Authentication
---

You can get up and running with Appwrite Authentication in minutes.
You can add basic email and password authentication to your app with just a few lines of code.

## 1. Signup

You can use the Appwrite [Client SDKs](/docs/sdks#client) to create an account using email and password.

```client-web
import { Client, Account, ID } from "appwrite";

const client = new Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1') // Your API Endpoint
    .setProject('<PROJECT_ID>');                 // Your project ID

const account = new Account(client);

const user = await account.create({
    userId: ID.unique(), 
    email: 'email@example.com', 
    password: 'password'
});
```

```client-flutter
import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1') // Your API Endpoint
    .setProject('<PROJECT_ID>');                 // Your project ID

final account = Account(client);

final user = await account.create(
    userId: ID.unique(),
    email: 'email@example.com',
    password: 'password',
);
```

```client-apple
import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1") // Your API Endpoint
    .setProject("<PROJECT_ID>")                  // Your project ID

let account = Account(client)

let user = try await account.create(
    userId: ID.unique(),
    email: "email@example.com",
    password: "password"
)
```

```client-android-kotlin
import io.appwrite.Client
import io.appwrite.services.Account
import io.appwrite.ID

val client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1") // Your API Endpoint
    .setProject("<PROJECT_ID>")                  // Your project ID

val account = Account(client)

val user = account.create(
    userId = ID.unique(),
    email = "email@example.com",
    password = "password"
)
```

```graphql
mutation {
    accountCreate(userId: "unique()", email: "email@example.com", password: "password") {
        _id
        email
        name
    }
}
```

```client-react-native
import { Client, Account, ID } from "appwrite";
const client = new Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1') // Your API Endpoint
    .setProject('<PROJECT_ID>');                 // Your project ID

const account = new Account(client);

const user = await account.create({
    userId: ID.unique(), 
    email: 'email@example.com', 
    password: 'password'
});
```

## 2. Login

After you've created your account, users can be logged in using the [Create Email Session](/docs/references/cloud/client-web/account#createEmailPasswordSession) method.

```client-web
const session = await account.createEmailPasswordSession({
    email: email, 
    password: password
});
```

```client-flutter
final session = await account.createEmailPasswordSession(
    email: 'email@example.com',
    password: 'password'
);
```

```client-apple
let session = try await account.createEmailPasswordSession(
    email: "email@example.com",
    password: "password"
)
```

```client-android-kotlin
val session = account.createEmailPasswordSession(
    email = "email@example.com",
    password = "password"
)
```

```graphql
mutation {
    accountcreateEmailPasswordSession(email: "email@example.com", password: "password") {
        _id
        userId
        provider
        expire
    }
}
```

```client-react-native
const session = await account.createEmailPasswordSession({
    email: email, 
    password: password
});
```

## 3. Check authentication state

After logging in, you can check the authentication state of the user.

Appwrite's SDKs are stateless, so you need to manage the session state in your app.
You can use the [Get Account](/docs/references/cloud/client-web/account#get) method to check if the user is logged in.

```client-web
try {
    const user = await account.get();
    // Logged in
} catch (err) {
    // Not logged in
}
```

```client-flutter
try {
    final user = await account.get();
    // Logged in
} catch(e) {
    // Not logged in
}
```

```client-apple
do {
    let user = try account.get()
    // Logged in
} catch {
    // Not logged in
}
```

```client-android-kotlin
return try {
    val user = account.get()
    // Logged in
} catch (e: AppwriteException) {
    // Not logged in
}
```

```graphql
query {
    accountGet {
        _id
        _createdAt
        _updatedAt
        name
        registration
        status
        labels
        passwordUpdate
        email
        phone
        emailVerification
        phoneVerification
        prefs {
            data
        }
        accessedAt
    }
}
```

```client-react-native
try {
    const user = await account.get();
    // Logged in
} catch (err) {
    // Not logged in
}
```

## 4. Navigation (Optional)

A common pattern is to use route guards to redirect users to the login page if they are not authenticated.
You can check the authentication state on app launch and before entering a protected route by calling `get()`.

Route guard implementations are **opinionated** and depend on the platform and frame you are using.
Take a look at some example usages from different platforms as inspiration.

### Web frameworks

Before routing to a page, you can check if the user is logged in and redirect them to the login page if they are not.

#### React router

You can use [React router loaders](https://reactrouter.com/en/main/route/loader) to check if the user is logged in before rendering a route.

```client-web 
import * as React from "react";
import {
  createBrowserRouter,
} from "react-router-dom";
import "./index.css";

import Login from "./Login";
import Protected from "./Protected";
import { account } from "./lib/appwrite";
import { redirect } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/protected",
    element: <Protected />,
    loader: async () => {
      try {
        // logged in? pass user to the route
        const user = await account.get();
        return { user };
      }
      catch {
        // not logged in? redirect to login
        throw redirect('/login')
      }
    }
  },
  {
    path: "/login",
    element: <Login />,
  },
]);

export default router;
```

#### Vue router

You can use [Vue router](https://router.vuejs.org/) with a [Pinia store](https://pinia.vuejs.org/) to check if the user is logged in before rendering a route.

First, create a simple Pinia store to manage the authentication state:
```client-web
import { account, ID, type Models } from '@/lib/appwrite'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore({
  id: 'auth',
  state: () => ({
    user: null as null | Models.User<Models.Preferences>,
  }),
  getters: {
    isLoggedIn(): boolean {
      return !!this.user;
    },
  },
  actions: {
    async init() {
      try {
        this.user = await account.get();
      } catch (error) {
        this.user = null;
      }
    },
  },
})
```

Then, check the authentication state before routing to a protected route:
```client-web
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
app.use(createPinia())

const auth = useAuthStore();

auth.init().then(() => {
  router.beforeEach((to, from, next) => {
    if (to.name == 'protected' && auth.isLoggedIn == false) {
      next({ name: 'login' })
    } else {
      next()
    }
  })
  app.use(router)
  app.mount('#app')
})
```

#### Angular router

```client-web
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { account } from './lib/appwrite';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (route.routeConfig?.path === "protected") {
      return this.checkLogin();
    }
    return of(true);
  }

  private checkLogin(): Observable<boolean | UrlTree> {
    return from(account.get()).pipe(
      map(() => true),
      catchError(() => of(this.router.createUrlTree(['/login'])))
    );
  }
}
```

#### Svelte

In the root level `+layout.svelte` file, check the authentication state before rendering a route:
```client-web
// src/routes/+layout.js
import { appwrite } from "$lib/appwrite";

export const ssr = false;

export const load = async () => {
  try {
    return {
      account: await appwrite.account.get(),
    };
  } catch {
    return {
      account: null,
    };
  }
};
```

This will be accessible in the `load` function of each child route:
```client-web
// src/routes/protected/+page.js
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ parent }) {
	const { account } = await parent();
	if (!account) {
		throw redirect(303, '/login');
	}
}
```

### Mobile and native

#### Flutter Go router

```client-flutter
import 'package:flutter/material.dart';
import 'package:appwrite/appwrite.dart' show Client, ID;
import 'package:appwrite/appwrite.dart' as Appwrite;
import 'package:appwrite/models.dart' show User;

class Account extends ChangeNotifier {
  final Appwrite.Account _account;

  User? _user;
  User? get user => _user;

  Account(Client client) : _account = Appwrite.Account(client);

  Future<void> init() async {
    try {
      _user = await _account.get();
      notifyListeners();
    } catch(e) {
      debugPrint(e.toString());
      rethrow;
    }
  }
}
```

#### Apple (Swift / SwiftUI)

```client-apple
import Foundation
import Appwrite
import AppwriteModels
import JSONCodable

class Appwrite {
    var client: Client
    var account: Account
    let databaseId = "sovereign"

    public init() {
        self.client = Client()
            .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
            .setProject("<PROJECT_ID>")
        
        self.account = Account(client)
    }
    public func getUser() async throws -> User<[String: AnyCodable]> {
        let user = try await account.get()
        return user
    }
}
```

#### Android (Kotlin)

```client-android-kotlin
import io.appwrite.Client
import io.appwrite.services.Account
import io.appwrite.exceptions.AppwriteException
import io.appwrite.models.User

class AccountService(client: Client) {
    private val account = Account(client)

    suspend fun getLoggedIn(): User<Map<String, Any>>? {
        return try {
            account.get()
        } catch (e: AppwriteException) {
            null
        }
    }   
}
```

#### React Native

```client-react-native
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../views/Login';
import ProtectedScreen from '../views/Protected';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useUser } from '../contexts/UserContext';

const Stack = createNativeStackNavigator();
export function Router() {
    const user = useUser();
    return (
        <NavigationContainer>
            <Stack.Navigator>
                {user.current == null ? (
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{ title: 'Login' }}
                    />
                ) : (
                    <Stack.Screen
                        name="Protected"
                        component={ProtectedScreen}
                        options={{ title: 'Protected' }}
                    />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
```

## 4. Password Recovery (Forgot Password Flow)

Appwrite provides a secure, two-stage account recovery protocol to allow users to regain access to their accounts when they forget their passwords:

1. **Create Password Recovery (Dispatch)**: Initiates the process by generating an encrypted recovery token and emailing a password reset link to the user.
2. **Complete Password Recovery (Update)**: Consumes the `userId` and `secret` tokens received in the reset URL and updates the user's password securely on the Appwrite backend.

### Step 1: Create Password Recovery

Call `account.createRecovery` with the user's email address and the URL that will handle the reset in your application:

```client-web
import { Client, Account } from "appwrite";

const client = new Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

const account = new Account(client);

// Dispatches a reset link to the user: https://myapp.com/recovery?userId=...&secret=...
const response = await account.createRecovery({
    email: 'user@example.com',
    url: 'https://myapp.com/recovery'
});
```

```client-flutter
import 'package:appwrite/appwrite.dart';

final client = Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

final account = Account(client);

final response = await account.createRecovery(
    email: 'user@example.com',
    url: 'https://myapp.com/recovery',
);
```

```client-apple
import Appwrite

let client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

let account = Account(client)

let token = try await account.createRecovery(
    email: "user@example.com",
    url: "https://myapp.com/recovery"
)
```

```client-android-kotlin
import io.appwrite.Client
import io.appwrite.services.Account

val client = Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")

val account = Account(client)

val token = account.createRecovery(
    email = "user@example.com",
    url = "https://myapp.com/recovery"
)
```

### Step 2: Complete Password Recovery

When the user clicks the reset link in their email, Appwrite appends `userId` and `secret` to the query string. Your application parses these tokens and calls `account.updateRecovery`:

```client-web
import { Client, Account } from "appwrite";

const client = new Client()
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>');

const account = new Account(client);

// URL: https://myapp.com/recovery?userId=xyz123&secret=abc789
const params = new URLSearchParams(window.location.search);
const userId = params.get('userId');
const secret = params.get('secret');

const result = await account.updateRecovery({
    userId: userId,
    secret: secret,
    password: 'newSecurePassword123',
    passwordAgain: 'newSecurePassword123'
});
```

```client-flutter
final response = await account.updateRecovery(
    userId: userId,
    secret: secret,
    password: 'newSecurePassword123',
    passwordAgain: 'newSecurePassword123',
);
```

```client-apple
let session = try await account.updateRecovery(
    userId: userId,
    secret: secret,
    password: "newSecurePassword123",
    passwordAgain: "newSecurePassword123"
)
```

```client-android-kotlin
val session = account.updateRecovery(
    userId = userId,
    secret = secret,
    password = "newSecurePassword123",
    passwordAgain = "newSecurePassword123"
)
```

## Centralized SDK Integration in ΛΞVOS

In ΛΞVOS, Appwrite Authentication is managed by `services/authService.ts` and consumed globally by `contexts/AuthContext.tsx`, `modules/auth/PasswordRecovery.tsx`, and `components/auth/RouteGuard.tsx`:

- **Client Web SDK**: `account.create`, `account.createEmailPasswordSession`, `account.get()`
- **Password Recovery Pipeline**: 
  - `account.createRecovery({ email, url })` via `requestPasswordReset` / `requestPasswordRecovery` / `createPasswordRecovery`
  - `account.updateRecovery({ userId, secret, password, passwordAgain })` via `completePasswordRecovery` / `updatePasswordRecovery`
  - Bi-directional fallback token extraction across search params, hash query strings, and standard query parameters
- **Session Conflict Resolution**: Automatic purge of conflicting active sessions with retry
- **High-Density Verdigris UI**: Tactile glassmorphism with instant session feedback and real-time cipher strength indicators
