const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const mongoose = require('mongoose');

describe('Authentication API', () => {
    beforeAll(async () => {
        // Connect to test database
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    afterAll(async () => {
        // Clean up test data and close connection
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const userData = {
                fullName: 'Test User',
                email: 'test@example.com',
                password: 'TestPass123!',
                phoneNumber: '9876543210',
                branch: 'CSE',
                year: '2',
                domains: ['Web Development', 'Designing']
            };

            const res = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);

            expect(res.body.status).toBe('success');
            expect(res.body.data.user.fullName).toBe(userData.fullName);
            expect(res.body.data.user.email).toBe(userData.email);
        });

        it('should not register a user with existing email', async () => {
            const userData = {
                fullName: 'Test User 2',
                email: 'test@example.com', // Same email as previous test
                password: 'TestPass123!',
                phoneNumber: '9876543211',
                branch: 'IT',
                year: '3',
                domains: ['Marketing']
            };

            const res = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);

            expect(res.body.status).toBe('error');
            expect(res.body.message).toBe('User with this email already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login a user with correct credentials', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'TestPass123!'
            };

            const res = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);

            expect(res.body.status).toBe('success');
            expect(res.body.data.user.email).toBe(loginData.email);
            expect(res.body.data.token).toBeDefined();
        });

        it('should not login a user with incorrect password', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'WrongPassword'
            };

            const res = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);

            expect(res.body.status).toBe('error');
            expect(res.body.message).toBe('Invalid email or password');
        });
    });
});