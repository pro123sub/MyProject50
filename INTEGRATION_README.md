# Frontend-Backend Integration Guide

This document explains how the Next.js frontend is integrated with the Node.js Express backend for the LoanInNeed application.

## Architecture Overview

The integration follows a modern full-stack architecture:

- **Frontend**: Next.js 15 with TypeScript, React Hook Form, and Zod validation
- **Backend**: Node.js Express with Prisma ORM and PostgreSQL
- **Communication**: RESTful API with JWT authentication
- **Proxy**: Next.js API routes for CORS handling

## Project Structure

```
MyProject50/
├── lin-frontend/          # Next.js frontend
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── signup/    # Signup flow pages
│   │   └── api/
│   │       └── proxy/     # API proxy routes
│   ├── components/
│   │   └── signup/        # Signup step components
│   ├── hooks/
│   │   └── useSignup.ts   # Custom signup hook
│   └── lib/
│       ├── api.ts         # API client
│       ├── config.ts      # Configuration
│       └── signup-schemas.ts # Zod validation schemas
└── Backend/               # Node.js Express backend
    ├── controllers/       # Route controllers
    ├── services/          # Business logic
    ├── models/           # Database models
    ├── routes/           # API routes
    └── prisma/           # Database schema
```

## API Integration Flow

### 1. Phone Verification (Step 1)
- **Frontend**: User enters phone number
- **API Call**: `POST /api/auth/phone/request-otp`
- **Backend**: Sends OTP via Twilio
- **Frontend**: User enters OTP
- **API Call**: `POST /api/auth/phone/verify-otp`
- **Backend**: Verifies OTP and creates user

### Login Flow
- **Frontend**: User enters phone number + date of birth
- **API Call**: `POST /api/users/login`
- **Backend**: Validates credentials and sends OTP
- **Frontend**: User enters OTP
- **API Call**: `POST /api/auth/phone/verify-otp`
- **Backend**: Verifies OTP and returns JWT token

### 2. Personal Details (Step 2)
- **Frontend**: User fills personal information
- **API Call**: `POST /api/users/register`
- **Backend**: Updates user with personal details

### 3. Basic Details (Step 3)
- **Frontend**: User fills employment and loan details
- **API Call**: `POST /api/kyc`
- **Backend**: Saves employment, address, and loan information

### 4. Document Verification (Step 4)
- **Frontend**: User uploads documents
- **API Call**: `POST /api/document/submit`
- **Backend**: Uploads files to Supabase and saves metadata

### 5. Aadhaar OTP (Step 5)
- **Frontend**: User enters Aadhaar OTP
- **API Call**: `POST /api/auth/aadhaar/verify-otp`
- **Backend**: Verifies Aadhaar OTP

### 6. Photo & Location (Step 6)
- **Frontend**: User captures photo and location
- **API Call**: `POST /api/users/location`
- **Backend**: Saves location data

## Key Components

### API Client (`lib/api.ts`)
Centralized API client that handles:
- Authentication token management
- Request/response formatting
- Error handling
- CORS proxy integration

### Custom Hook (`hooks/useSignup.ts`)
Manages the complete signup flow:
- Form state management
- Step progression
- API integration
- Error handling
- Loading states

### Proxy Route (`app/api/proxy/route.ts`)
Next.js API route that:
- Proxies requests to backend
- Handles CORS
- Manages authentication headers
- Provides error handling

## Setup Instructions

### Backend Setup
1. Navigate to the Backend directory
2. Install dependencies: `npm install`
3. Set up environment variables in `.env`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/loaninneed"
   JWT_SECRET="your_jwt_secret"
   TWILIO_ACCOUNT_SID="your_twilio_sid"
   TWILIO_AUTH_TOKEN="your_twilio_token"
   TWILIO_VERIFY_SERVICE_SID="your_verify_service_sid"
   ```
4. Run database migrations: `npx prisma migrate dev`
5. Start the server: `npm start`

### Frontend Setup
1. Navigate to the lin-frontend directory
2. Install dependencies: `npm install`
3. Set up environment variables in `.env.local`:
   ```
   BACKEND_URL=http://localhost:5000
   NEXT_PUBLIC_API_URL=/api/proxy
   ```
4. Start the development server: `npm run dev`

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/loaninneed"
JWT_SECRET="your_jwt_secret"
TWILIO_ACCOUNT_SID="your_twilio_sid"
TWILIO_AUTH_TOKEN="your_twilio_token"
TWILIO_VERIFY_SERVICE_SID="your_verify_service_sid"
SUPABASE_URL="your_supabase_url"
SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_BUCKET="your_bucket_name"
```

### Frontend (.env.local)
```env
BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=/api/proxy
NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
```

## API Endpoints

### Authentication
- `POST /api/auth/phone/request-otp` - Request phone OTP
- `POST /api/auth/phone/verify-otp` - Verify phone OTP
- `POST /api/auth/aadhaar/request-otp` - Request Aadhaar OTP
- `POST /api/auth/aadhaar/verify-otp` - Verify Aadhaar OTP

### Login
- `POST /api/users/login` - Login with phone + DOB (sends OTP)
- `POST /api/auth/phone/verify-otp` - Verify login OTP (same as signup)

### User Management
- `POST /api/users/register` - Complete user registration
- `GET /api/users/profile` - Get user profile
- `POST /api/users/location` - Submit location data

### KYC
- `POST /api/kyc` - Submit KYC details

### Document Verification
- `POST /api/upload-documents` - Upload documents (via Next.js API route)
- `POST /api/document/submit` - Backend document submission endpoint
- `GET /api/document/status` - Get verification status

## Error Handling

The integration includes comprehensive error handling:

1. **API Level**: Centralized error handling in the API client
2. **Component Level**: Error display in UI components
3. **Hook Level**: Error state management in custom hooks
4. **Backend Level**: Structured error responses with proper HTTP status codes

## Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **CORS Protection**: Proper CORS configuration
3. **Input Validation**: Zod schemas for frontend validation
4. **File Upload Security**: Secure file upload with validation
5. **Environment Variables**: Sensitive data stored in environment variables

## Testing

### Backend Testing
```bash
cd Backend
npm test
```

### Frontend Testing
```bash
cd lin-frontend
npm run test
```

## Deployment

### Backend Deployment
1. Set up production database
2. Configure environment variables
3. Deploy to your preferred platform (Heroku, AWS, etc.)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred platform
3. Configure environment variables

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS is properly configured
2. **Authentication Issues**: Check JWT token handling
3. **Database Connection**: Verify DATABASE_URL configuration
4. **File Upload Issues**: 
   - Check if uploads/temp directory exists in Backend folder
   - Verify Supabase configuration
   - Ensure document routes are mounted in server.js
5. **Document Upload "Failed to fetch" Error**: 
   - Make sure document verification routes are mounted in backend server
   - Check if uploads/temp directory exists
   - Verify the upload-documents API route is working

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=true
```

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include TypeScript types
4. Write tests for new features
5. Update documentation

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check the console for error messages
4. Verify environment variable configuration
