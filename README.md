# Device Management System

A mobile-first industrial device management application built with React, TypeScript, and PostgreSQL. Track devices, schedule maintenance, and manage industrial equipment efficiently.

## Features

### 🔐 Employee Authentication
- Secure registration and login with encrypted passwords
- Real-time password strength validation
- Email validation with instant feedback
- Persistent sessions until logout

### 📱 Device Management
- Add, edit, and track industrial devices
- Location-based filtering and organization
- Device identification numbers and status tracking
- Maintenance frequency planning

### 🔧 Maintenance Planning
- Overdue maintenance alerts
- Upcoming maintenance scheduling
- Check completion tracking with comments
- Visual status indicators (overdue, upcoming, completed)

### 👤 User Profile
- Personal employee information
- Light/dark mode toggle
- Account management and logout

### 📊 Dashboard Analytics
- Device statistics and overview
- Location-based device distribution
- Maintenance completion tracking
- Recent activity monitoring

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TanStack Query** for server state management
- **Wouter** for lightweight routing
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** for database operations
- **PostgreSQL** (Neon) for data storage
- **bcryptjs** for password encryption
- **Session-based authentication**

## Database Setup

### Using Your Own Neon Database

#### Step 1: Get Your Neon Database Credentials

1. **Sign up/Login to Neon Console**
   - Go to [console.neon.tech](https://console.neon.tech)
   - Create account or sign in

2. **Create a New Project**
   - Click "Create Project"
   - Choose your region (closer = faster)
   - Give your project a name (e.g., "Device Manager")

3. **Get Your Database Connection String**
   - In your project dashboard, click **"Connect"**
   - Select **"Direct connection"**
   - Copy the **complete** connection string that looks EXACTLY like this:
   ```
   postgresql://username:password@ep-something-123.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
   
   **⚠️ IMPORTANT:** Your connection string should have:
   - `postgresql://` at the start
   - Username and password (usually auto-generated)
   - Host ending in `.aws.neon.tech` or similar
   - Database name (usually `neondb`)
   - `?sslmode=require` at the end

#### Step 2: Configure Secrets

##### For Local Development:
Create a `.env` file in the root directory:
```bash
# .env file (create this file locally)
DATABASE_URL="postgresql://your-neon-connection-string-here"
SESSION_SECRET="your-random-secret-key-here"
NODE_ENV=development
```

#### Step 3: Initialize Database Schema

Run this command to create the tables:
```bash
npm run db:push
```

**If you get errors:**
- ✅ Check your `DATABASE_URL` is complete and correct
- ✅ Ensure you can connect to internet
- ✅ Try copying the connection string again from Neon console

#### Step 4: Verify Setup

If successful, you should see:
```
✅ Your schema is in sync with the database
```

### Required Environment Variables

| Variable | Description | Purpose | Example |
|----------|-------------|---------|---------|
| `DATABASE_URL` | Complete PostgreSQL connection string from Neon | Connects app to your database | `postgresql://user:pass@ep-abc-123.us-east-1.aws.neon.tech/neondb?sslmode=require` |
| `SESSION_SECRET` | Random string (32+ characters) | Encrypts user sessions & cookies | `device-manager-secret-key-2024-change-in-production` |
| `NODE_ENV` | Environment mode (optional) | Controls app behavior | `development` or `production` |

#### 🔐 What Each Secret Means:

**DATABASE_URL:**
- **What it is:** Complete connection string to your PostgreSQL database
- **When to change:** When switching databases, regions, or database credentials change  
- **Format:** `postgresql://username:password@hostname:port/database?sslmode=require`
- **⚠️ Critical:** Must be EXACTLY as provided by Neon (don't modify any part)

**SESSION_SECRET:**
- **What it is:** Secret key used to encrypt user login sessions
- **When to change:** Should be unique per environment (dev/staging/prod)
- **Security:** Keep this private! Anyone with this key can forge user sessions
- **Length:** Should be at least 32 characters long and random

## Getting Started

### Prerequisites
- Node.js 18+
- Neon PostgreSQL database account

### 💻 Local Development Setup

1. **Clone Repository**
   ```bash
   git clone <your-repo-url>
   cd device-management-app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Create Environment File**
   Create `.env` in the root directory:
   ```bash
   # .env
   DATABASE_URL="postgresql://your-neon-connection-string"
   SESSION_SECRET="your-random-secret-key-change-this"
   NODE_ENV=development
   ```

4. **Initialize Database**
   ```bash
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

App will be available at `http://localhost:5000`

### 🔄 When You Change Database

**If you switch to a different database:**

1. **Update Connection String**
   - Get new connection string from your database provider
   - Update `DATABASE_URL` in Secrets/`.env`

2. **Reinitialize Schema**
   ```bash
   npm run db:push
   ```
   This creates the tables in your new database.

3. **Restart Application**
   ```bash
   npm run dev
   ```

**⚠️ Important:** Changing databases means you'll lose existing data (employees, devices, etc.). You'll start fresh.

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Theme)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and configurations
│   │   ├── pages/         # Application pages/routes
│   │   └── App.tsx        # Main app component
├── server/                # Backend Express server
│   ├── db.ts             # Database connection
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data access layer
│   └── index.ts          # Server entry point
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema and types
└── package.json          # Dependencies and scripts
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Employee registration
- `POST /api/auth/login` - Employee login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Devices
- `GET /api/devices` - List all devices
- `POST /api/devices` - Create device
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device
- `GET /api/devices/overdue` - Get overdue devices
- `GET /api/devices/upcoming` - Get upcoming maintenance

### Maintenance
- `POST /api/devices/:id/check` - Record maintenance check
- `GET /api/devices/:id/checks` - Get device check history

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/locations` - Get all locations

## Development

### Database Operations

```bash
# Push schema changes to database
npm run db:push

# Force push (⚠️ careful - may lose data in production)
npm run db:push --force
```

### Building for Production
```bash
npm run build
```

### 🐛 Common Issues & Fixes

#### "ENOTFOUND" or connection errors:
- ✅ Check your `DATABASE_URL` is complete and correct
- ✅ Ensure the hostname ends with `.aws.neon.tech` or similar
- ✅ Verify your Neon database is running (not hibernated)
- ✅ Copy connection string fresh from Neon console

#### "Authentication failed" errors:
- ✅ Check username/password in connection string are correct
- ✅ Try regenerating database password in Neon console

#### "SSL required" errors:  
- ✅ Ensure connection string ends with `?sslmode=require`

#### Session/login issues:
- ✅ Check `SESSION_SECRET` is set and is at least 32 characters
- ✅ Clear browser cookies and try again

#### App won't start:
- ✅ Run `npm install` to ensure all dependencies are installed
- ✅ Check that both `DATABASE_URL` and `SESSION_SECRET` are set
- ✅ Try restarting the development server

### 🔄 Environment Changes

**Moving from Development to Production:**
1. Create production database in Neon
2. Update `DATABASE_URL` with production connection string  
3. Use a different, secure `SESSION_SECRET` for production
4. Set `NODE_ENV=production`
5. Run `npm run db:push` to initialize production schema

**Switching Regions/Databases:**
1. Export your data if needed (manually copy important records)
2. Update `DATABASE_URL` with new database connection string
3. Run `npm run db:push` to create tables in new database
4. Re-enter your data or import from backup

## Mobile-First Design

This application is designed mobile-first with:
- Touch-friendly interfaces
- Responsive layouts for all screen sizes
- Bottom navigation for easy thumb access
- Optimized forms for mobile input

## Security Features

- Password encryption with bcrypt
- Session-based authentication
- Input validation and sanitization
- CSRF protection through same-origin policy
- Secure HTTP headers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
