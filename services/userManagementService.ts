/**
 * @file services/userManagementService.ts
 * @description Server-side user management using Appwrite Users API.
 * Requires API key authentication for administrative operations.
 * Used for bulk user operations, user analytics, and server-side user management.
 *
 * IMPORTANT: This service requires the Appwrite Server SDK and API keys.
 * It cannot be used in client-side code. Use only in:
 * - Appwrite Functions
 * - Server-side backend services
 * - Admin scripts with API key access
 *
 * Installation for server environments:
 * npm install appwrite
 */

/**
 * Lazily imports node-appwrite server SDK and creates an authenticated client.
 * Returns null when running in a browser or when credentials are missing,
 * since this service is only functional in server environments (Appwrite Functions, admin scripts).
 */
const createServerClient = (): any | null => {
  const isBrowser = typeof window !== 'undefined';
  if (isBrowser) return null;

  const endpoint = process.env.APPWRITE_ENDPOINT || process.env.VITE_APPWRITE_ENDPOINT;
  const projectId = process.env.APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;

  if (!endpoint || !projectId || !apiKey) {
    console.warn(
      'UserManagementService: Server client not initialized — missing APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, or APPWRITE_API_KEY.',
    );
    return null;
  }

  try {
    const { Client } = require('node-appwrite');
    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);
    return client;
  } catch {
    console.warn('UserManagementService: node-appwrite SDK not available in this environment.');
    return null;
  }
};

export class UserManagementService {
  private users: any = null;
  private account: any = null;

  constructor() {
    const serverClient = createServerClient();
    if (serverClient) {
      try {
        const nodeAppwrite = require('node-appwrite');
        this.users = new nodeAppwrite.Users(serverClient);
        this.account = new nodeAppwrite.Account(serverClient);
        console.log('UserManagementService: Server client initialized');
      } catch {
        console.warn('UserManagementService: node-appwrite SDK required for server-side user management.');
      }
    }
  }

  /**
   * Check if server-side user management is available
   */
  isAvailable(): boolean {
    return this.users !== null && this.account !== null;
  }

  /**
   * Create a new user (server-side)
   * Requires API key with user creation permissions
   */
  async createUser(params: {
    userId: string;
    email: string;
    password: string;
    name?: string;
  }) {
    if (!this.users) {
      throw new Error('Server-side user management not available');
    }

    try {
      const user = await this.users.create(
        params.userId,
        params.email,
        params.password,
        params.name
      );
      return user;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  /**
   * Create user with hashed password (server-side)
   * Supports different hashing algorithms
   */
  async createUserWithHash(params: {
    userId: string;
    email: string;
    password: string; // Pre-hashed password
    name?: string;
    hashType?: 'md5' | 'sha' | 'bcrypt' | 'scrypt' | 'phppass' | 'argon2';
  }) {
    if (!this.users) {
      throw new Error('Server-side user management not available');
    }

    const { hashType = 'bcrypt' } = params;

    try {
      let user;
      switch (hashType) {
        case 'md5':
          user = await this.users.createMD5User(
            params.userId,
            params.email,
            params.password,
            params.name
          );
          break;
        case 'sha':
          user = await this.users.createSHAUser(
            params.userId,
            params.email,
            params.password,
            params.name
          );
          break;
        case 'bcrypt':
          user = await this.users.createBcryptUser(
            params.userId,
            params.email,
            params.password,
            params.name
          );
          break;
        case 'scrypt':
          user = await this.users.createScryptUser(
            params.userId,
            params.email,
            params.password,
            params.name
          );
          break;
        case 'phppass':
          user = await this.users.createPHPassUser(
            params.userId,
            params.email,
            params.password,
            params.name
          );
          break;
        case 'argon2':
          user = await this.users.createArgon2User(
            params.userId,
            params.email,
            params.password,
            params.name
          );
          break;
        default:
          throw new Error(`Unsupported hash type: ${hashType}`);
      }
      return user;
    } catch (error) {
      console.error('Failed to create user with hash:', error);
      throw error;
    }
  }

  /**
   * Get user by ID (server-side)
   */
  async getUser(userId: string) {
    if (!this.users) {
      throw new Error('Server-side user management not available');
    }

    try {
      return await this.users.get(userId);
    } catch (error) {
      console.error('Failed to get user:', error);
      throw error;
    }
  }

  /**
   * Update user information (server-side)
   */
  async updateUser(userId: string, updates: {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
    emailVerification?: boolean;
    phoneVerification?: boolean;
    status?: boolean;
  }) {
    if (!this.users) {
      throw new Error('Server-side user management not available');
    }

    try {
      const user = await this.users.update(
        userId,
        updates.name,
        updates.email,
        updates.password,
        updates.phone,
        updates.emailVerification,
        updates.phoneVerification,
        updates.status
      );
      return user;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }

  /**
   * Delete user (server-side)
   */
  async deleteUser(userId: string) {
    if (!this.users) {
      throw new Error('Server-side user management not available');
    }

    try {
      await this.users.delete(userId);
      return true;
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  }

  /**
   * List users with pagination and filtering (server-side)
   */
  async listUsers(params?: {
    queries?: string[];
    search?: string;
  }) {
    if (!this.users) {
      throw new Error('Server-side user management not available');
    }

    try {
      return await this.users.list(params?.queries, params?.search);
    } catch (error) {
      console.error('Failed to list users:', error);
      throw error;
    }
  }

  /**
   * Get user sessions (server-side)
   */
  async getUserSessions(userId: string) {
    if (!this.users) {
      throw new Error('Server-side user management not available');
    }

    try {
      return await this.users.getSessions(userId);
    } catch (error) {
      console.error('Failed to get user sessions:', error);
      throw error;
    }
  }

  /**
   * Delete user session (server-side)
   */
  async deleteUserSession(userId: string, sessionId: string) {
    if (!this.users) {
      throw new Error('Server-side user management not available');
    }

    try {
      await this.users.deleteSession(userId, sessionId);
      return true;
    } catch (error) {
      console.error('Failed to delete user session:', error);
      throw error;
    }
  }

  /**
   * Delete all user sessions (server-side)
   */
  async deleteAllUserSessions(userId: string) {
    if (!this.users) {
      throw new Error('Server-side user management not available');
    }

    try {
      await this.users.deleteSessions(userId);
      return true;
    } catch (error) {
      console.error('Failed to delete all user sessions:', error);
      throw error;
    }
  }

  /**
   * Get user logs/audit trail (server-side)
   */
  async getUserLogs(userId: string, params?: {
    queries?: string[];
  }) {
    if (!this.users) {
      throw new Error('Server-side user management not available');
    }

    try {
      return await this.users.getLogs(userId, params?.queries);
    } catch (error) {
      console.error('Failed to get user logs:', error);
      throw error;
    }
  }

  /**
   * Update user preferences (server-side)
   */
  async updateUserPreferences(userId: string, preferences: Record<string, any>) {
    if (!this.users) {
      throw new Error('Server-side user management not available');
    }

    try {
      return await this.users.updatePrefs(userId, preferences);
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      throw error;
    }
  }

  /**
   * Get user preferences (server-side)
   */
  async getUserPreferences(userId: string) {
    if (!this.users) {
      throw new Error('Server-side user management not available');
    }

    try {
      return await this.users.getPrefs(userId);
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      throw error;
    }
  }

  /**
   * Create JWT token for user (server-side)
   * Useful for acting on behalf of users in server functions
   */
  async createUserToken(userId: string, params?: {
    length?: number;
    expire?: number;
  }) {
    if (!this.users) {
      throw new Error('Server-side user management not available');
    }

    try {
      return await this.users.createToken(
        userId,
        params?.length,
        params?.expire
      );
    } catch (error) {
      console.error('Failed to create user token:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const userManagementService = new UserManagementService();