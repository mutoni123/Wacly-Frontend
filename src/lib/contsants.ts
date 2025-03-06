// src/lib/constants.ts

// API Base URL based on environment
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Authentication keys
export const TOKEN_KEY = 'token';
export const USER_KEY = 'user';

// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ADMIN: {
    ROOT: '/admin',
    EMPLOYEES: '/admin/employees',
    DEPARTMENTS: '/admin/departments',
    LEAVE: {
      ROOT: '/admin/leave',
      REQUESTS: '/admin/leave/requests',
      TYPES: '/admin/leave/types'
    }
  }
} as const;

// API endpoints matching backend routes
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    SETUP_ADMIN: '/auth/setup-admin'
  },
  USERS: {
    BASE: '/users',
    MANAGERS: '/users/managers'
  },
  DEPARTMENTS: {
    BASE: '/departments',
    SINGLE: (id: string) => `/departments/${id}`
  },
  LEAVE: {
    REQUESTS: {
      BASE: '/leave-requests',
      MY_REQUESTS: '/leave-requests/my-requests',
      TEAM: '/leave-requests/team',
      SUMMARY: '/leave-requests/summary',
      STATUS: (id: number) => `/leave-requests/${id}/status`
    },
    TYPES: {
      BASE: '/leave-types',
      SINGLE: (id: number) => `/leave-types/${id}`
    }
  }
} as const;

// Leave request status
export const LEAVE_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected'
} as const;

// Leave types
export const LEAVE_TYPES = {
  ANNUAL: 'Annual Leave',
  SICK: 'Sick Leave',
  PERSONAL: 'Personal Leave',
  MATERNITY: 'Maternity Leave',
  PATERNITY: 'Paternity Leave',
  UNPAID: 'Unpaid Leave'
} as const;

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee'
} as const;

// HTTP Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language'
} as const;

// Error messages
export const ERROR_MESSAGES = {
  DEFAULT: 'Something went wrong. Please try again.',
  UNAUTHORIZED: 'Please login to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  NETWORK: 'Network error. Please check your connection.'
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  CREATE: 'Successfully created.',
  UPDATE: 'Successfully updated.',
  DELETE: 'Successfully deleted.',
  LEAVE_REQUEST: {
    CREATED: 'Leave request submitted successfully.',
    APPROVED: 'Leave request approved successfully.',
    REJECTED: 'Leave request rejected successfully.'
  }
} as const;

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  API: 'yyyy-MM-dd',
  DATETIME: 'dd/MM/yyyy HH:mm'
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  ITEMS_PER_PAGE_OPTIONS: [5, 10, 25, 50]
} as const;