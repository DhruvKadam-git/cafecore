/**
 * AUTH MODULE - API ENDPOINTS REFERENCE
 * ================================================================================
 * All authentication endpoints for the Cafe POS system
 */

export const AUTH_API_ENDPOINTS = {
  BASE: '/auth',

  /**
   * POST /auth/signup
   * Register a new user
   *
   * Request:
   * {
   *   "name": "Admin User",
   *   "email": "admin@example.com",
   *   "password": "Admin@123"
   * }
   *
   * Response 201:
   * {
   *   "message": "User created successfully",
   *   "user": {
   *     "id": "uuid-123",
   *     "name": "Admin User",
   *     "email": "admin@example.com",
   *     "role": "EMPLOYEE",
   *     "status": "ACTIVE",
   *     "createdAt": "2024-01-15T10:30:00Z",
   *     "updatedAt": "2024-01-15T10:30:00Z"
   *   }
   * }
   *
   * Error 409 Conflict:
   * {
   *   "statusCode": 409,
   *   "message": "Email already registered. Please use a different email or try logging in.",
   *   "error": "Conflict"
   * }
   *
   * Validations:
   * - name: required, minimum 3 characters
   * - email: required, valid email format, must be unique
   * - password: required, minimum 8 characters
   */
  SIGNUP: {
    method: 'POST',
    path: '/signup',
    fullPath: '/auth/signup',
    protected: false,
    description: 'Register a new user account',
    requestBody: {
      type: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: {
          type: 'string',
          description: 'User full name',
          example: 'Admin User',
          minLength: 3,
        },
        email: {
          type: 'string',
          format: 'email',
          description: 'User email address (must be unique)',
          example: 'admin@example.com',
        },
        password: {
          type: 'string',
          description: 'User password',
          example: 'Admin@123',
          minLength: 8,
        },
      },
    },
    responses: {
      201: {
        description: 'User created successfully',
        schema: {
          message: 'string',
          user: {
            id: 'string (uuid)',
            name: 'string',
            email: 'string',
            role: 'EMPLOYEE | ADMIN',
            status: 'ACTIVE | ARCHIVED',
            createdAt: 'ISO 8601 datetime',
            updatedAt: 'ISO 8601 datetime',
          },
        },
      },
      400: {
        description: 'Validation error',
        example: {
          statusCode: 400,
          message: ['Name must be at least 3 characters long'],
          error: 'Bad Request',
        },
      },
      409: {
        description: 'Email already registered',
        example: {
          statusCode: 409,
          message:
            'Email already registered. Please use a different email or try logging in.',
          error: 'Conflict',
        },
      },
    },
  },

  /**
   * POST /auth/login
   * Authenticate user and return JWT token
   *
   * Request:
   * {
   *   "email": "admin@cafe.com",
   *   "password": "Admin@123"
   * }
   *
   * Response 200:
   * {
   *   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *   "user": {
   *     "id": "uuid-123",
   *     "name": "Admin User",
   *     "email": "admin@cafe.com",
   *     "role": "ADMIN",
   *     "status": "ACTIVE",
   *     "createdAt": "2024-01-15T10:30:00Z",
   *     "updatedAt": "2024-01-15T10:30:00Z"
   *   }
   * }
   *
   * Error 401 Unauthorized:
   * {
   *   "statusCode": 401,
   *   "message": "Invalid email or password",
   *   "error": "Unauthorized"
   * }
   *
   * Business Rules:
   * - Email must exist
   * - Password must be correct
   * - User status must be ACTIVE (not ARCHIVED)
   */
  LOGIN: {
    method: 'POST',
    path: '/login',
    fullPath: '/auth/login',
    protected: false,
    description: 'Authenticate user and return JWT access token',
    requestBody: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          description: 'User email address',
          example: 'admin@cafe.com',
        },
        password: {
          type: 'string',
          description: 'User password',
          example: 'Admin@123',
          minLength: 8,
        },
      },
    },
    responses: {
      200: {
        description: 'Login successful',
        schema: {
          accessToken: 'string (JWT)',
          user: {
            id: 'string (uuid)',
            name: 'string',
            email: 'string',
            role: 'EMPLOYEE | ADMIN',
            status: 'ACTIVE | ARCHIVED',
            createdAt: 'ISO 8601 datetime',
            updatedAt: 'ISO 8601 datetime',
          },
        },
      },
      400: {
        description: 'Validation error',
        example: {
          statusCode: 400,
          message: ['Email must be a valid email address'],
          error: 'Bad Request',
        },
      },
      401: {
        description: 'Invalid credentials or archived account',
        example: {
          statusCode: 401,
          message: 'Invalid email or password',
          error: 'Unauthorized',
        },
      },
      403: {
        description: 'Account archived',
        example: {
          statusCode: 403,
          message: 'Your account has been archived. Please contact support.',
          error: 'Forbidden',
        },
      },
    },
  },

  /**
   * GET /auth/me
   * Get current authenticated user
   *
   * Headers:
   * Authorization: Bearer <access_token>
   *
   * Response 200:
   * {
   *   "id": "uuid-123",
   *   "name": "Admin User",
   *   "email": "admin@cafe.com",
   *   "role": "ADMIN",
   *   "status": "ACTIVE",
   *   "createdAt": "2024-01-15T10:30:00Z",
   *   "updatedAt": "2024-01-15T10:30:00Z"
   * }
   *
   * Error 401 Unauthorized:
   * {
   *   "statusCode": 401,
   *   "message": "Unauthorized",
   *   "error": "Unauthorized"
   * }
   *
   * Protected: Yes (requires valid JWT)
   */
  GET_CURRENT_USER: {
    method: 'GET',
    path: '/me',
    fullPath: '/auth/me',
    protected: true,
    description: 'Get current authenticated user profile (requires JWT)',
    headers: {
      Authorization: 'Bearer <access_token>',
      'Content-Type': 'application/json',
    },
    responses: {
      200: {
        description: 'Current user details',
        schema: {
          id: 'string (uuid)',
          name: 'string',
          email: 'string',
          role: 'EMPLOYEE | ADMIN',
          status: 'ACTIVE | ARCHIVED',
          createdAt: 'ISO 8601 datetime',
          updatedAt: 'ISO 8601 datetime',
        },
      },
      401: {
        description: 'Invalid or missing JWT token',
        example: {
          statusCode: 401,
          message: 'Unauthorized',
          error: 'Unauthorized',
        },
      },
    },
  },
} as const;

/**
 * SEEDED CREDENTIALS FOR TESTING
 * ================================================================================
 * These users are created by running: npm run db:seed
 */
export const SEEDED_CREDENTIALS = {
  ADMIN: {
    email: 'admin@cafe.com',
    password: 'Admin@123',
    role: 'ADMIN',
    status: 'ACTIVE',
    name: 'Admin User',
    description: 'Administrator user with full system access',
  },
  EMPLOYEE: {
    email: 'employee@cafe.com',
    password: 'Employee@123',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    name: 'Employee User',
    description: 'Employee user with limited system access',
  },
} as const;

/**
 * JWT TOKEN INFORMATION
 * ================================================================================
 */
export const JWT_INFO = {
  TYPE: 'Bearer',
  ALGORITHM: 'HS256',
  EXPIRES_IN: '7d',
  LOCATION: 'Authorization header',
  FORMAT: 'Authorization: Bearer <token>',
  PAYLOAD: {
    sub: 'User ID (subject)',
    email: 'User email address',
    role: 'User role (ADMIN or EMPLOYEE)',
    iat: 'Issued at (timestamp)',
    exp: 'Expiration time (timestamp)',
  },
} as const;

/**
 * ERROR CODES AND MEANINGS
 * ================================================================================
 */
export const ERROR_CODES = {
  200: { status: 'OK', description: 'Successful request' },
  201: { status: 'Created', description: 'Resource created successfully' },
  400: {
    status: 'Bad Request',
    description: 'Validation error or invalid input',
  },
  401: { status: 'Unauthorized', description: 'Missing or invalid JWT token' },
  403: { status: 'Forbidden', description: 'User account archived' },
  404: { status: 'Not Found', description: 'Resource not found' },
  409: { status: 'Conflict', description: 'Email already registered' },
  500: { status: 'Internal Server Error', description: 'Server error' },
} as const;

/**
 * ENVIRONMENT VARIABLES
 * ================================================================================
 */
export const ENVIRONMENT_VARS = {
  DATABASE_URL: 'postgresql://postgres:Kalp1909@localhost:5432/cafe_pos',
  JWT_SECRET: 'hackathon-secret-key-change-in-production',
  JWT_EXPIRES_IN: '7d',
  PORT: 3000,
  NODE_ENV: 'development',
} as const;

/**
 * QUICK REFERENCE COMMANDS
 * ================================================================================
 */
export const COMMANDS = {
  GENERATE_PRISMA: 'npm run db:generate',
  MIGRATE_DATABASE: 'npm run db:migrate',
  SEED_DATABASE: 'npm run db:seed',
  START_DEV: 'npm run start:dev',
  VIEW_API_DOCS: 'http://localhost:3000/api',
  VIEW_PRISMA_STUDIO: 'npm run db:studio',
} as const;

/**
 * VALIDATION RULES
 * ================================================================================
 */
export const VALIDATION_RULES = {
  NAME: {
    minLength: 3,
    maxLength: 100,
    required: true,
    pattern: 'Any string',
  },
  EMAIL: {
    required: true,
    format: 'valid email',
    unique: true,
  },
  PASSWORD: {
    minLength: 8,
    required: true,
    hashing: 'bcrypt with 10 rounds',
    example: 'Admin@123 (include uppercase, lowercase, numbers, special chars)',
  },
} as const;

/**
 * API TESTING EXAMPLES
 * ================================================================================
 */
export const CURL_EXAMPLES = {
  SIGNUP: `curl -X POST http://localhost:3000/auth/signup \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test@123"
  }'`,

  LOGIN: `curl -X POST http://localhost:3000/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "admin@cafe.com",
    "password": "Admin@123"
  }'`,

  GET_CURRENT_USER: `curl -X GET http://localhost:3000/auth/me \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"`,

  LOGIN_EMPLOYEE: `curl -X POST http://localhost:3000/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "employee@cafe.com",
    "password": "Employee@123"
  }'`,
} as const;

/**
 * AUTHENTICATION FLOW
 * ================================================================================
 */
export const AUTH_FLOW = {
  STEP_1: 'User calls /auth/signup or /auth/login',
  STEP_2: 'Server validates email and password',
  STEP_3: 'Server creates JWT with user data',
  STEP_4: 'Client stores JWT token in localStorage or sessionStorage',
  STEP_5: 'For protected endpoints, client sends JWT in Authorization header',
  STEP_6: 'Server validates JWT and extracts user information',
  STEP_7: 'If valid, request proceeds. If invalid, returns 401',
  STEP_8: 'User can access protected endpoints until token expires (7 days)',
} as const;

/**
 * SETUP STEPS
 * ================================================================================
 */
export const SETUP_STEPS = {
  STEP_1: 'npm install - Install dependencies',
  STEP_2: 'npm run db:generate - Generate Prisma client',
  STEP_3: 'npm run db:migrate - Create database tables',
  STEP_4: 'npm run db:seed - Seed default users',
  STEP_5: 'npm run start:dev - Start development server',
  STEP_6: 'Visit http://localhost:3000/api for Swagger documentation',
  STEP_7: 'Use Postman collection to test endpoints',
} as const;
