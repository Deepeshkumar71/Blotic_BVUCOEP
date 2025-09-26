# Debugging Guide for Registration and Login Issues

This guide will help you identify and fix common issues with the registration and login functionality.

## Common Error: "Failed to execute 'json' on 'Response': Unexpected end of JSON input"

This error occurs when the frontend tries to parse a response as JSON, but the response is either empty or not valid JSON.

### Causes and Solutions:

1. **Server returning empty response**
   - Check if the server is actually running
   - Verify the API endpoint URL is correct
   - Check server logs for errors

2. **Server returning HTML instead of JSON**
   - This often happens when the server returns an error page
   - Check if the request is reaching the correct route

3. **Network issues**
   - CORS errors
   - Server not responding
   - Firewall blocking requests

### Debugging Steps:

#### 1. Check if the backend server is running

```bash
# Navigate to the backend directory
cd backend

# Start the server
npm run dev
```

You should see output like:
```
🚀 BLOTIC Backend Server running on port 5000
🌐 Environment: development
📊 API Health Check: http://localhost:5000/api/health
```

#### 2. Test the API endpoints directly

Run the test script:
```bash
# Test file removed - use backend/test/auth.test.js instead
```

This will show you the actual response from the server.

#### 3. Check server logs

Look at the terminal where the server is running for any error messages.

#### 4. Verify MongoDB connection

Make sure MongoDB is running and accessible. Check the server logs for MongoDB connection messages.

### Common Backend Issues and Fixes:

#### 1. Email sending errors

The registration process tries to send a verification email. If email configuration is incorrect, it might cause issues.

**Solution**: Check the `.env` file for correct email configuration:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@blotic.com
```

#### 2. Validation errors

If the request data doesn't match the validation rules, the server will return a validation error.

**Solution**: Ensure the frontend is sending data in the correct format:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phoneNumber": "9876543210",
  "branch": "CSE",
  "year": "2",
  "domains": ["Marketing", "Designing"]
}
```

#### 3. Database connection issues

**Solution**: 
- Ensure MongoDB is running
- Check the `MONGODB_URI` in the `.env` file
- Verify network connectivity to the database

### Frontend Debugging:

#### 1. Add console logging

Add console.log statements to see what's happening:

```javascript
async function submitRegistration(data) {
    console.log('Sending registration data:', data);
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);
        
        // Check if response is OK before parsing
        if (!response.ok) {
            const text = await response.text();
            console.log('Error response text:', text);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
        
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}
```

#### 2. Check browser developer tools

1. Open browser developer tools (F12)
2. Go to the Network tab
3. Try to register a user
4. Look at the request and response details

### Testing with cURL:

You can also test the API endpoints using cURL:

```bash
# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!",
    "phoneNumber": "9876543210",
    "branch": "CSE",
    "year": "2",
    "domains": ["Marketing", "Designing"]
  }'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "rememberMe": false
  }'
```

### Environment Variables:

Make sure your `.env` file has the correct configuration:

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

### Common Fixes Applied:

1. **Improved error handling in frontend JavaScript**:
   - Added proper JSON parsing error handling
   - Added fallback error messages
   - Added detailed logging

2. **Fixed backend issues**:
   - Fixed typo in email utility function
   - Fixed field reference in email template
   - Improved error handling in routes

3. **Enhanced validation**:
   - Added more robust validation error handling
   - Improved error messages

### If Issues Persist:

1. Check the server logs for specific error messages
2. Verify all dependencies are installed:
   ```bash
   cd backend
   npm install
   ```

3. Check if MongoDB is running:
   ```bash
   # On Windows
   net start MongoDB
   
   # On macOS/Linux
   sudo systemctl status mongod
   ```

4. Verify the database connection by checking the server startup logs

5. Test with the provided test pages:
   - Open `test-registration.html` in your browser
   - Open `test-login.html` in your browser

These pages provide a simple interface to test the registration and login functionality without the complexity of the full frontend.