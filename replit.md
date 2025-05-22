# PropertyPro - Property Management System

## Overview

PropertyPro is a web-based property management application that connects landlords and tenants. It provides features for property listing, lease management, maintenance requests, and user administration. The system uses a modern tech stack with a React frontend and an Express backend, with data stored in a PostgreSQL database managed via Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The application uses React with TypeScript for the frontend, leveraging modern patterns and libraries:

- **UI Framework**: Tailwind CSS with shadcn/ui components for consistent styling
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query for server state and React context for application state
- **Form Handling**: React Hook Form with Zod for validation
- **Data Fetching**: Custom API client built around the Fetch API

### Backend Architecture

The backend is built with Express.js running on Node.js:

- **API Layer**: RESTful API endpoints with middleware for authentication and logging
- **Database Access**: Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based authentication with secure session management
- **Error Handling**: Centralized error handling with proper status codes and messages

### Database Design

The application uses a PostgreSQL database with the following core tables:

- `users`: User accounts and authentication details
- `properties`: Property listings with details like address, price, features
- `tenants`: Extended profiles for users who are tenants
- `leases`: Contracts connecting tenants to properties
- `maintenance_requests`: Property maintenance and repair tickets

## Key Components

### Authentication System

- JWT token-based authentication
- Login/register flows with appropriate validation
- Role-based access control (admin vs tenant)
- Password hashing using bcrypt

### Property Management

- Property listing with search and filtering
- Detailed property views with images and specifications
- Status tracking (available, leased, maintenance)

### Lease Management

- Lease creation and management
- Tenant assignment
- Duration and payment tracking

### Maintenance System

- Request submission and tracking
- Priority levels
- Status updates

### User Management

- Admin dashboard
- User profile management
- Role assignments

### Analytics

- Usage statistics
- Property occupancy rates
- Financial reporting

## Data Flow

1. **User Authentication**:
   - User submits credentials → Server validates → JWT token issued → Client stores token
   - Subsequent requests include the token in Authorization header

2. **Property Listing**:
   - Admin creates property → Data stored in database
   - Users query properties → Server retrieves filtered properties → Client displays results

3. **Lease Process**:
   - Admin creates lease → Connects property to tenant → Updates property status
   - Tenant views active leases through dashboard

4. **Maintenance Workflow**:
   - Tenant submits request → Property manager notified
   - Status updates flow to tenant dashboard

## External Dependencies

### Frontend Dependencies

- **@tanstack/react-query**: Data fetching and caching
- **@radix-ui/react-***: UI primitives for components
- **wouter**: Client-side routing
- **tailwindcss**: Utility-first CSS framework
- **react-hook-form**: Form state management
- **zod**: Schema validation
- **clsx** and **class-variance-authority**: Conditional CSS class management
- **recharts**: Data visualization
- **date-fns**: Date manipulation

### Backend Dependencies

- **express**: Web server framework
- **drizzle-orm**: SQL query builder and ORM
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT token management
- **@neondatabase/serverless**: Database connection (for serverless deployments)

## Deployment Strategy

The application is deployed using Replit's built-in deployment features:

- **Development**: Running via `npm run dev` with hot reloading
- **Build Process**: Vite builds the frontend, esbuild compiles the server code
- **Production**: Static assets served by Express, API requests handled by the same server
- **Database**: PostgreSQL database, configured through environment variables

## Development Workflow

1. **Local Development**:
   - Run `npm run dev` to start development server
   - Frontend accessible at http://localhost:5000
   - Changes to client code hot reload

2. **Database Schema Changes**:
   - Modify schema in `shared/schema.ts`
   - Run `npm run db:push` to update the database schema

3. **Deployment**:
   - Changes to the `main` branch trigger automatic deployments
   - Build command: `npm run build`
   - Start command: `npm run start`