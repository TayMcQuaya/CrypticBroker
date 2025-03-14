# CrypticBroker

A comprehensive platform designed to bridge the gap between blockchain projects and investors. CrypticBroker facilitates project onboarding, evaluation, and management through an AI-powered platform.

## Project Overview

CrypticBroker serves as a bridge between promising crypto projects and venture capital/investment opportunities. The platform helps:

- **Projects**: Submit standardized information, showcase their potential, and connect with investors and services
- **Investors**: Efficiently evaluate projects using AI-powered scoring and analytics
- **Accelerators**: Manage cohorts, mentors, and program activities

## Architecture

### Frontend
- React.js with Next.js framework
- TypeScript for type safety
- Material UI for component library

### Backend
- Node.js with Express
- TypeScript
- RESTful API architecture

### Database
- PostgreSQL with Prisma ORM
- Dynamic form schema for flexibility

## Project Structure

```
/cryptic-broker
  /frontend              # Next.js application
    /components          # Reusable UI components
    /pages               # Page components and routes
    /public              # Static assets
    /styles              # Global styles
    /utils               # Utility functions
  /backend               # Express application
    /controllers         # Request handlers
    /models              # Data models
    /routes              # API routes
    /services            # Business logic
    /utils               # Utility functions
  /prisma                # Database schema and migrations
  /docs                  # Project documentation
```

## Development Setup

### Prerequisites
- Node.js (v14 or later)
- npm or yarn
- PostgreSQL
- Docker (optional)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/cryptic-broker.git
cd cryptic-broker
```

2. Install dependencies
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables
```bash
# Create .env file in backend directory
cp .env.example .env
```

4. Start development servers
```bash
# Start frontend dev server
cd frontend
npm run dev

# Start backend dev server
cd ../backend
npm run dev
```

## Database Schema

Our database is designed for flexibility, particularly around the form system:

- **Users**: Authentication and user profiles
- **Organizations**: VCs, accelerators, and project teams
- **Projects**: Core project information
- **Forms**: Dynamic form definitions
- **FormSubmissions**: User responses to forms
- **Applications**: Projects applying to organizations

## Form System

We use a dynamic form system that allows for easy modifications:
- Forms are defined as JSON structures
- Questions can be added, removed or modified without changing the database schema
- Form submissions are stored with version information

## Deployment

Instructions for deploying to production environments will be added in a later phase.

## Project Phases

### Phase 1: Foundation
- Project setup and architecture
- Database schema design
- Authentication system
- Basic UI components
- Core API endpoints

### Phase 2: Core Functionality
- Complete multi-step form implementation
- Dashboard for viewing submitted projects
- Full CRUD operations

### Phase 3: Advanced Features
- AI scoring engine
- Analytics dashboard
- File uploads

### Phase 4: Refinement
- Enhanced UI/UX
- Filtering and search
- Role-based permissions 

## Quick Local Setup Guide

```bash
# 1. Clone and install dependencies
git clone <repository-url>
cd CrypticBroker

# 2. Setup backend
cd backend
npm install
cp .env.example .env
# Update .env with your PostgreSQL credentials and JWT secret
npx prisma generate
npx prisma migrate dev
npm run dev  # Runs on http://localhost:5000

# 3. Setup frontend (new terminal)
cd ../frontend
npm install
cp .env.example .env.local
npm run dev  # Runs on http://localhost:3000

# 4. Test user credentials
email: admin@example.com
password: admin123

#5 DB either check on pgadmin or activate prima studio on backend
cd backend
npx prisma studio
```