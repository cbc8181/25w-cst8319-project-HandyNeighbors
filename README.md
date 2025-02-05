# HandyNeighbor

A platform connecting neighbors for mutual assistance, specifically designed to help community members find student helpers for various tasks.

## Project Requirements

### Core Functional Requirements

1. **Task Management (SWF1)**
   - Service seekers can post tasks (lawn mowing, snow shoveling, car cleaning, etc.)
   - Tasks include details: location, time, and payment

2. **Service Provider Features (SWF2)**
   - Service providers can view and accept tasks
   - Task visibility based on location and availability

3. **User Profiles (SWF3)**
   - Distinct profiles for service seekers and providers
   - Profile features: age verification, optional profile pictures, brief descriptions

4. **Location-Based Services (SWF4)**
   - Default task visibility radius: 2.5 km from student's postal code
   - Adjustable acceptance range for both parties

## Tech Stack

### Backend (`/HandyNeighborServer`)
- Node.js (v18.x)
- Express.js (v4.16.1)
- PostgreSQL (v14)
- PostGIS Extension
- Dependencies:
  - bcrypt (v5.1.1)
  - jsonwebtoken (v9.0.2)
  - pg (v8.13.1)
  - cors (v2.8.5)
  - dotenv (v16.4.7)


### Frontend (`/HandyNeighborApp`)
- React Native/Expo
- TypeScript
- Dependencies (To check versions):
```bash
npx expo --version
npm list react-native
npm list @react-navigation/native
```

## Project Setup

### Backend Server

1. Database Setup
```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE handyneighbor;
\c handyneighbor

# Run DDL script
\i path/to/ddl.sql
```

2. Generate JWT Secret
```bash
# Using Node.js in terminal
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copy the generated string and use it as your JWT_SECRET
```

3. Environment Configuration
```bash
cd HandyNeighborServer
cp .env.example .env
# Edit .env with your database credentials and JWT_SECRET
```
```
PORT=3000
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_HOST=localhost
JWT_SECRET=your_jwt_secret
```

4. Start Server
```bash
npm install
npm start
```

### Mobile App

1. Environment Setup
```bash
cd HandyNeighborApp
npm install
```

2. API Configuration
- Locate `config/api.ts`
- Set `API_BASE_URL` to your server's IP address:
```typescript
export const API_BASE_URL = 'http://your-server-ip:3000/api';
```

3. Start App
```bash
npx expo start
```

## Current Progress

### Completed Features
- Basic project structure setup
- Database schema design
- User authentication (login/signup)
- JWT-based authentication system
- Basic routing protection

### Upcoming Tasks (Available for Assignment)

1. **Task Management Module**
   - Task creation interface
   - Application handling system
   - Status management
   - _Status: Available for assignment_

2. **Home Page Implementation**
   - Task listing
   - Filtering system
   - User dashboard
   - _Status: Available for assignment_

3. **Task Detail Pages**
   - Individual task view
   - Application system
   - Task status updates
   - _Status: Available for assignment_

4. **Location Services Integration**
   - Google Maps API integration
   - Postal code to coordinates conversion
   - Distance-based task filtering
   - Proximity display
   - _Status: Available for assignment_

## Contributing

Team members can claim tasks by:
1. Creating a new branch for the feature
2. Updating this README to mark the task as claimed
3. Creating a pull request when ready



