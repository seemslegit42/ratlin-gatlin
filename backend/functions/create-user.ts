/**
 * @file backend/functions/create-user.ts
 * @description Appwrite Function to create a new user.
 */

import { Client, Users, ID } from 'node-appwrite';

type FunctionContext = {
  req: { body?: string };
  res: { json: (payload: unknown, statusCode?: number) => unknown };
  log: (message: string) => void;
  error: (message: string) => void;
};

const buildError = (
  res: FunctionContext['res'],
  statusCode: number,
  errorCode: string,
  message: string,
  details?: Record<string, unknown>
) =>
  res.json(
    {
      success: false,
      error: {
        type: statusCode >= 500 ? 'system' : statusCode === 403 ? 'auth' : 'validation',
        code: errorCode,
        message,
        details,
      },
    },
    statusCode
  );

export default async ({ req, res, log, error }: FunctionContext) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

  const users = new Users(client);

  try {
    const { userId, email, password, name, phone } = JSON.parse(req.body || '{}');

    if (!email || !password) {
      return buildError(res, 400, 'MISSING_REQUIRED_FIELDS', 'Email and password are required');
    }

    log(`📞 Creating user: ${email}`);

    const result = await users.create({
      userId: userId || ID.unique(),
      email,
      password,
      name,
      phone,
    });

    log(`✅ User created: ${result.$id}`);

    try {
      await users.createVerification(
        result.$id, 
        process.env.VERIFICATION_URL || 'https://ais-dev-gjz6j6xvrdztg5spmcyjc6-83757020060.us-east1.run.app/verify'
      );
      log(`✉️ Verification link sent to: ${email}`);
    } catch (verr: any) {
      error(`Failed to send verification email: ${verr.message}`);
    }

    return res.json({
      success: true,
      result,
    });
  } catch (err: any) {
    error(`User creation failed: ${err.message}`);
    return buildError(res, 500, 'USER_CREATION_FAILED', err.message);
  }
};
