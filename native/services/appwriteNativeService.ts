/**
 * @file appwriteNativeService.ts
 * @description Appwrite 2.0 SDK initialization and authentication helpers for React Native.
 */

import { Client, Account, Databases, Teams } from 'appwrite';

const client = new Client()
  .setEndpoint('https://tor.cloud.appwrite.io/v1')
  .setProject('6990e2830030cacccd98');

export const account = new Account(client);
export const databases = new Databases(client);
export const teams = new Teams(client);

export async function checkAppwriteSession() {
  try {
    const user = await account.get();
    return { authenticated: true, user };
  } catch {
    return { authenticated: false, user: null };
  }
}
