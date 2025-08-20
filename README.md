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

1. **Sign up/Login to Neon Console**
   - Go to [console.neon.tech](https://console.neon.tech)
   - Create account or sign in

2. **Create a New Project**
   - Click "Create Project"
   - Choose your region
   - Give your project a name (e.g., "Device Manager")

3. **Get Your Database Connection String**
   - In your project dashboard, click "Connect"
   - Copy the connection string that looks like:
   ```
   postgresql://username:password@host/database?sslmode=require
   ```

4. **Configure Environment Variables**
   - In Replit, use the Secrets tab (🔒) to add:
   ```
   DATABASE_URL = your-neon-connection-string
   SESSION_SECRET = your-random-secret-key
   ```

5. **Initialize the Database**
   ```bash
   npm run db:push
   ```

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Your Neon PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `SESSION_SECRET` | Random string for session encryption | `your-secret-key` |
| `NODE_ENV` | Environment mode | `development` |

## Getting Started

### Prerequisites
- Node.js 18+
- Neon PostgreSQL database

### Installation

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Configure Database**
   - Add your `DATABASE_URL` to Replit Secrets
   - Add your `SESSION_SECRET` to Replit Secrets

3. **Initialize Database**
   ```bash
   npm run db:push
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5000`

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

### Database Migrations
```bash
# Push schema changes to database
npm run db:push

# Force push (careful - may lose data)
npm run db:push --force
```

### Building for Production
```bash
npm run build
```

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