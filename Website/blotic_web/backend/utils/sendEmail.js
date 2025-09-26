const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Email templates
const emailTemplates = {
    emailVerification: (data) => ({
        subject: 'BLOTIC - Verify Your Email Address',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verify Your Email - BLOTIC</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #602ea6, #cc75db); color: white; padding: 30px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .content { padding: 40px 30px; }
                    .button { display: inline-block; background: linear-gradient(45deg, #602ea6, #cc75db); color: white; text-decoration: none; padding: 15px 30px; border-radius: 10px; font-weight: bold; margin: 20px 0; }
                    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to BLOTIC</h1>
                        <p>Bharati Vidyapeeth Web3 Community</p>
                    </div>
                    <div class="content">
                        <h2>Hi ${data.name}!</h2>
                        <p>Thank you for registering with BLOTIC. To complete your registration and activate your membership, please verify your email address by clicking the button below:</p>
                        <center>
                            <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
                        </center>
                        <p>This verification link will expire in 24 hours. If you didn't create an account with BLOTIC, please ignore this email.</p>
                        <p>Once verified, you'll have access to:</p>
                        <ul>
                            <li>Exclusive workshops and events</li>
                            <li>Project collaboration opportunities</li>
                            <li>Networking with industry professionals</li>
                            <li>Certification programs</li>
                        </ul>
                    </div>
                    <div class="footer">
                        <p>© 2025 BLOTIC. All rights reserved.</p>
                        <p>BVCOE Campus, Dhankawadi, Pune - 411043</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    passwordReset: (data) => ({
        subject: 'BLOTIC - Password Reset Request',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset - BLOTIC</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #602ea6, #cc75db); color: white; padding: 30px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .content { padding: 40px 30px; }
                    .button { display: inline-block; background: linear-gradient(45deg, #602ea6, #cc75db); color: white; text-decoration: none; padding: 15px 30px; border-radius: 10px; font-weight: bold; margin: 20px 0; }
                    .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
                    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset</h1>
                        <p>BLOTIC Account Security</p>
                    </div>
                    <div class="content">
                        <h2>Hi ${data.name}!</h2>
                        <p>We received a request to reset your BLOTIC account password. Click the button below to choose a new password:</p>
                        <center>
                            <a href="${data.resetUrl}" class="button">Reset Password</a>
                        </center>
                        <div class="warning">
                            <strong>Security Notice:</strong> This password reset link will expire in 30 minutes for your security.
                        </div>
                        <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
                        <p>For security reasons, please:</p>
                        <ul>
                            <li>Use a strong, unique password</li>
                            <li>Don't share your password with anyone</li>
                            <li>Enable two-factor authentication when available</li>
                        </ul>
                    </div>
                    <div class="footer">
                        <p>© 2025 BLOTIC. All rights reserved.</p>
                        <p>If you have any questions, contact us at support@blotic.com</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    welcome: (data) => ({
        subject: 'Welcome to BLOTIC Community!',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to BLOTIC</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #602ea6, #cc75db); color: white; padding: 30px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .content { padding: 40px 30px; }
                    .button { display: inline-block; background: linear-gradient(45deg, #602ea6, #cc75db); color: white; text-decoration: none; padding: 15px 30px; border-radius: 10px; font-weight: bold; margin: 20px 0; }
                    .highlight { background-color: #f8f9ff; border-left: 4px solid #cc75db; padding: 15px; margin: 20px 0; }
                    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Welcome to BLOTIC!</h1>
                        <p>Your Web3 Journey Starts Here</p>
                    </div>
                    <div class="content">
                        <h2>Hi ${data.name}!</h2>
                        <p>Congratulations! Your BLOTIC membership is now active. We're excited to have you join our community of Web3 enthusiasts, developers, and innovators.</p>
                        
                        <div class="highlight">
                            <h3>🚀 What's Next?</h3>
                            <ul>
                                <li>Explore upcoming workshops and events</li>
                                <li>Join our community Discord server</li>
                                <li>Connect with fellow members</li>
                                <li>Start working on exciting Web3 projects</li>
                            </ul>
                        </div>

                        <center>
                            <a href="${data.dashboardUrl}" class="button">Visit Your Dashboard</a>
                        </center>

                        <p>Follow us on social media to stay updated:</p>
                        <p>
                            📱 Instagram: @blotic_bvducoep<br>
                            💼 LinkedIn: BLOTIC Company<br>
                            💬 WhatsApp Community: Join our group
                        </p>
                    </div>
                    <div class="footer">
                        <p>© 2025 BLOTIC. All rights reserved.</p>
                        <p>Questions? Reply to this email or contact us at support@blotic.com</p>
                    </div>
                </div>
            </body>
            </html>
        `
    })
};

const sendEmail = async (options) => {
    try {
        const transporter = createTransporter();

        // Get template if specified
        let emailContent = {
            subject: options.subject,
            html: options.html || options.message
        };

        if (options.template && emailTemplates[options.template]) {
            emailContent = emailTemplates[options.template](options.data || {});
        }

        const mailOptions = {
            from: `"BLOTIC Community" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to: options.email,
            subject: emailContent.subject,
            html: emailContent.html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
        
        return {
            success: true,
            messageId: info.messageId
        };

    } catch (error) {
        console.error('❌ Email sending failed:', error);
        throw new Error(`Email sending failed: ${error.message}`);
    }
};

module.exports = sendEmail;