import * as appwriteSdk from '../node_modules/appwrite/dist/esm/sdk.js';

export const Client = appwriteSdk.Client;
export const Account = appwriteSdk.Account;
export const Databases = appwriteSdk.Databases;
export const Storage = appwriteSdk.Storage;
export const Realtime = appwriteSdk.Realtime;
export const Query = appwriteSdk.Query;
export const Teams = appwriteSdk.Teams;
export const Permission = appwriteSdk.Permission;
export const Role = appwriteSdk.Role;
export const ID = appwriteSdk.ID;
export const Avatars = appwriteSdk.Avatars;
export const Functions = appwriteSdk.Functions;
export const Graphql = appwriteSdk.Graphql;
export const Locale = appwriteSdk.Locale;
export const Messaging = appwriteSdk.Messaging;
export const OAuthProvider = appwriteSdk.OAuthProvider;
export const AppwriteException = appwriteSdk.AppwriteException;
export const Channel = (appwriteSdk as any).Channel;

export class Presences {
  constructor() {}
}

export const TablesDB = (appwriteSdk as any).TablesDB || class TablesDB {};

export default appwriteSdk;
