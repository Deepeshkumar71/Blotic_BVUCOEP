# BLOTIC Backend API

This is the backend API for the BLOTIC website, built with Node.js, Express, and MongoDB.

## Features

- User registration and authentication
- JWT-based session management
- Password encryption with bcrypt
- Email verification
- Password reset functionality
- Rate limiting for security
- Input validation
- CORS support

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file based on `.env.example`
5. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the backend root with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/blotic_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@blotic.com
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/verify-email/:token` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password/:token` - Reset password

### Users

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/stats` - Get user statistics (admin/organizer only)

## Testing

Run tests with:

```bash
npm test
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation and sanitization
- Account lockout after failed login attempts

## License

MIT

# BLOTIC Backend Setup Guide

## 🚀 Complete Authentication System

This backend provides a complete authentication system for the BLOTIC website with user registration, login, email verification, and session management.

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Gmail account for email services (optional)

## 🛠️ Installation

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   - Copy `.env.example` to `.env`
   - Update the following variables:

   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/blotic_db

   # JWT Secrets (CHANGE THESE!)
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_REFRESH_SECRET=your_refresh_token_secret_here

   # Email Configuration (Optional)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

4. **Start MongoDB:**
   - **Local MongoDB:** `mongod`
   - **MongoDB Atlas:** Use connection string in MONGODB_URI

5. **Start the server:**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 🌐 API Endpoints

### Authentication Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/verify-email/:token` | Verify email |
| POST | `/api/auth/forgot-password` | Request password reset |
| PUT | `/api/auth/reset-password/:token` | Reset password |

### User Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users (Admin) |
| GET | `/api/users/profile` | Get user profile |
| PUT | `/api/users/profile` | Update user profile |
| GET | `/api/users/stats` | Get user statistics (Admin) |

## 🔐 Authentication Flow

1. **Registration:**
   - User fills registration form
   - Backend validates data and creates user
   - Email verification sent (optional)
   - JWT token returned for immediate login

2. **Login:**
   - User enters email/password
   - Backend validates credentials
   - JWT token returned
   - Frontend stores token for API calls

3. **Session Management:**
   - Frontend includes token in Authorization header
   - Backend validates token on protected routes
   - Automatic logout on token expiry

## 📧 Email Features

- Email verification on registration
- Password reset emails
- Welcome emails
- Customizable HTML templates

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting on API endpoints
- Account lockout after failed attempts
- Input validation and sanitization
- CORS protection
- Helmet security headers

## 🗄️ Database Schema

### User Model
```javascript
{
  // Personal Information
  firstName: String (required)
  lastName: String (required)
  email: String (required, unique)
  password: String (required, hashed)
  phoneNumber: String (required)
  dateOfBirth: Date (required)
  gender: String (required)

  // Academic Information
  college: String (required)
  course: String (required)
  yearOfStudy: String (required)
  studentId: String

  // BLOTIC Specific
  interests: [String]
  motivation: String (required)
  experienceLevel: String (required)
  portfolioUrl: String
  linkedinProfile: String
  githubProfile: String

  // Account Status
  isEmailVerified: Boolean
  isActive: Boolean
  role: String (member/organizer/admin)
  membershipStatus: String
  joinedDate: Date

  // Activity Tracking
  lastLogin: Date
  eventsAttended: [ObjectId]
  workshopsCompleted: [ObjectId]
}
```

## 🚦 Testing the API

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "Password123",
    "phoneNumber": "+1234567890",
    "dateOfBirth": "2000-01-01",
    "gender": "male",
    "college": "Example University",
    "course": "Computer Science",
    "yearOfStudy": "3rd Year",
    "interests": ["Blockchain Development"],
    "motivation": "Interested in Web3 development",
    "experienceLevel": "intermediate"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

## 🔧 Frontend Integration

The login and registration forms are already configured to work with this backend:

1. **Login Form** (`pages/login.html`)
   - Connects to `/api/auth/login`
   - Stores JWT token in localStorage
   - Redirects on successful login

2. **Registration Form** (`pages/register.html`)
   - Connects to `/api/auth/register`
   - Shows success/error messages
   - Handles validation errors

## 📱 Development Tips

1. **Database Connection:**
   - Ensure MongoDB is running before starting server
   - Check connection string in `.env`

2. **Email Testing:**
   - Use Gmail App Passwords for EMAIL_PASS
   - Test email sending in development

3. **JWT Tokens:**
   - Change default secrets in production
   - Monitor token expiry times

4. **Error Handling:**
   - Check console logs for detailed errors
   - API returns structured error responses

## 🌍 Production Deployment

1. **Environment Variables:**
   - Set NODE_ENV=production
   - Use strong JWT secrets
   - Configure production database

2. **Database:**
   - Use MongoDB Atlas or dedicated server
   - Enable authentication
   - Set up regular backups

3. **Security:**
   - Enable HTTPS
   - Set up proper CORS origins
   - Configure rate limiting

## 📊 Monitoring

- Health check: `GET /api/health`
- Server logs include request/response details
- Database connection status monitoring

## 🤝 Support

For issues or questions:
- Check server logs
- Verify environment variables
- Test API endpoints with curl/Postman
- Contact BLOTIC development team

---

**🎉 Your BLOTIC authentication system is ready!** 

The frontend forms will now connect to this backend for user registration and login functionality.