# Jay's Phone Repair Shop

A comprehensive Next.js 15 application for managing a phone repair business with customer-facing features and an admin dashboard.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
  - [Customer Portal](#customer-portal)
  - [Admin Dashboard](#admin-dashboard)
  - [AI Chatbot](#ai-chatbot)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [Authentication System](#authentication-system)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Admin Portal Pages](#admin-portal-pages)
- [Development](#development)
  - [Scripts](#scripts)
  - [Testing](#testing)
  - [Migrations](#migrations)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

Jay's Phone Repair Shop is a full-featured web application designed to streamline phone repair business operations. It provides customers with tools to track repair tickets, browse products, and access support, while giving administrators a powerful dashboard to manage all aspects of the business.

The application features real-time updates, AI-powered customer support, comprehensive inventory management, and secure authentication with role-based access control.

## Features

### Customer Portal

- **Repair Ticket Tracking**: Customers can track their repair progress using ticket numbers
- **Product Shop**: Browse and purchase accessories and products
- **Second-Hand Marketplace**: Buy and sell used devices
- **Device Information**: Detailed information about repair services and pricing
- **Responsive Design**: Mobile-friendly interface for on-the-go access

### Admin Dashboard

- **Comprehensive Metrics**: Real-time revenue, active repairs, and sales data
- **CRUD Operations**: Full management of customers, products, tickets, and orders
- **Real-Time Updates**: Live activity feed and dashboard updates
- **Analytics**: Revenue charts and performance metrics
- **User Management**: Role-based access control (admin/user)
- **Logging**: Audit trail of admin activities
- **Enhanced Ticket Management**: 
  - Comprehensive repair ticket system with image upload capability
  - Customer contact information management
  - Device identification (IMEI tracking)
  - Financial tracking (estimated costs, actual costs, deposits, payment status)
  - Workflow management (status tracking, priority levels)
  - Sequential ticket numbering
  - Real-time ticket updates

### AI Chatbot

- **Ticket Status Lookup**: Instant access to repair ticket information
- **Product Information**: Details about available products and accessories
- **Repair Estimates**: Cost estimates for common repair services
- **Troubleshooting**: Basic troubleshooting guidance for common issues
- **Booking System**: Schedule appointments for device diagnosis
- **Policy Information**: Access to warranty, return, and privacy policies

## Technology Stack

- **Frontend**: Next.js 15 with App Router, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with custom policies
- **Realtime**: Supabase Realtime subscriptions
- **Storage**: Supabase Storage for product images and ticket photos
- **AI**: Genkit with Google AI (Gemini)
- **UI Components**: Radix UI, Lucide React icons
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation

## Architecture

The application follows a modern full-stack architecture with:

1. **Frontend Layer**: Next.js application with server-side rendering and static generation
2. **API Layer**: Next.js API routes for backend functionality
3. **Database Layer**: PostgreSQL with Supabase for data persistence
4. **Authentication Layer**: Supabase Auth for secure user management
5. **AI Layer**: Genkit integration for intelligent customer support
6. **Realtime Layer**: WebSocket connections for live updates

The application is organized into distinct modules:
- Public customer-facing pages
- Protected admin dashboard
- AI chatbot functionality
- Database migrations and schema management

## Database Schema

The application uses a comprehensive PostgreSQL schema with the following main tables:

### Core Tables

- **profiles**: User profiles linked to auth.users
- **products**: Product catalog with pricing and inventory
- **tickets**: Repair tickets with status tracking
- **orders**: Customer orders with payment information
- **customers**: Customer information and contact details
- **second_hand_products**: Second-hand product listings

### Supporting Tables

- **order_items**: Junction table linking orders to products
- **admin_logs**: Audit trail of admin activities

### Key Features

- Row Level Security (RLS) policies for all tables
- Automatic timestamp updates with triggers
- Comprehensive indexing for performance
- Enum types for status fields
- Foreign key relationships for data integrity

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Google AI API key (for AI features)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd phone-repair
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project credentials

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google AI for AI chatbot
GENKIT_GOOGLE_API_KEY=your_google_ai_api_key

# Application settings
NEXT_PUBLIC_APP_URL=http://localhost:9003
```

### Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Apply database migrations:
```bash
npm run migrate:local
```

3. Access the application at `http://localhost:9003`

## Authentication System

The application implements a secure authentication system with the following features:

### Admin Authentication

- **Secure Login**: Dedicated admin login page with email/password authentication
- **Role-Based Access Control**: Only users with 'admin' role can access the admin dashboard
- **Session Management**: Automatic session handling with secure token storage
- **Password Reset**: Secure password reset functionality
- **Logout**: Proper session termination

### Implementation Details

- **Middleware Protection**: All admin routes are protected by middleware
- **Context Provider**: Centralized authentication state management
- **Protected Components**: Components that conditionally render based on authentication status
- **Secure Storage**: Proper handling of authentication tokens using Supabase's secure storage
- **Error Handling**: Comprehensive error handling for authentication failures

### Available Authentication Pages

1. **Login**: `/login` - Admin login page
2. **Password Reset**: `/reset-password` - Request password reset
3. **Update Password**: `/update-password` - Update password after reset

### Protected Routes

All routes under `/admin/*` are protected and require admin authentication.

## Project Structure

```
src/
├── ai/                 # AI chatbot functionality
│   ├── flows/          # AI flow definitions
│   └── genkit.ts       # Genkit configuration
├── app/                # Next.js app router pages
│   ├── (main)/         # Public customer pages
│   ├── admin/          # Admin dashboard pages
│   ├── api/            # API routes
│   └── product/[slug]/ # Dynamic product pages
├── components/         # Reusable UI components
├── contexts/           # React context providers (including auth)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and types
├── server/             # Server-side utilities
└── ...
```

## API Endpoints

### Customer APIs