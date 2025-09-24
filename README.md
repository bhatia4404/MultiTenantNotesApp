# Multi-Tenant SaaS Notes App

A secure multi-tenant notes application with subscription plans, user role management, and data isolation between tenants.

## Features

### Multi-Tenancy

The application implements multi-tenancy using a **shared schema with tenant ID columns**. This approach:

- Maintains data isolation between tenants through tenant ID foreign keys
- Enforces tenant isolation at the API level through middleware checks
- Simplifies database management with a single database instance
- Enables efficient resource utilization with shared infrastructure

All data queries include tenant ID filters to ensure strict data isolation between tenants.

### Authentication and Authorization

- JWT-based authentication system
- Two user roles: Admin and Member
- Admins can invite users and upgrade subscriptions
- Members can create, view, edit, and delete notes
- Middleware ensures proper role-based access to APIs

### Test Accounts

The following test accounts are available with password: `password`

- admin@acme.test (Admin, tenant: Acme)
- user@acme.test (Member, tenant: Acme)
- admin@globex.test (Admin, tenant: Globex)
- user@globex.test (Member, tenant: Globex)

### Subscription Feature Gating

- Free Plan: Maximum of 3 notes per tenant
- Pro Plan: Unlimited notes
- Admins can upgrade from Free to Pro instantly
- API enforces note limits for tenants on the Free plan

## Technical Implementation

### Backend API

- Next.js API Routes with route handlers
- JWT tokens for secure authentication
- Role-based authorization middleware
- Supabase PostgreSQL for data storage
- Full CORS support for external access

### Frontend

- React with Next.js App Router
- Client-side authentication state management
- Mobile-responsive UI with Tailwind CSS
- Role-specific UI elements and permissions

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## API Endpoints

- **Authentication**: POST /api/auth/login
- **Notes CRUD**:
  - GET /api/notes - List all notes
  - POST /api/notes - Create a note
  - GET /api/notes/:id - Get a specific note
  - PUT /api/notes/:id - Update a note
  - DELETE /api/notes/:id - Delete a note
- **Tenant Management**:
  - GET /api/tenants - List all tenants
  - POST /api/tenants/:slug/upgrade - Upgrade tenant to Pro plan
- **User Management**:
  - GET /api/users - List all users (Admin only)
  - POST /api/users - Invite new user (Admin only)
- **Health Check**:
  - GET /api/health - Returns { "status": "ok" }
