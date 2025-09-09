# Vyva Auth API

A comprehensive backend API built with NestJS and deployed on AWS Lambda for managing authentication, user management, customer relationships, product catalog, and sales orders for the Vyva platform.

## 🚀 Overview

Vyva Auth API is a serverless backend service that provides a complete business management solution with the following core functionalities:

- **Authentication & Authorization**: Google OAuth integration with JWT token management
- **User Management**: Complete user lifecycle management with role-based access control
- **Customer Management**: Customer relationship management with business-specific data
- **Product Catalog**: Product and service management with inventory tracking
- **Sales Orders**: Order processing with payment method tracking and reporting
- **Profile Management**: User profile management and updates

## 🏗️ Architecture

### Technology Stack

- **Framework**: NestJS (Node.js)
- **Database**: Amazon DynamoDB (NoSQL)
- **Deployment**: AWS Lambda (Serverless)
- **API Gateway**: AWS API Gateway
- **Authentication**: JWT with Google OAuth
- **Documentation**: Swagger/OpenAPI
- **ORM**: Dynamoose (DynamoDB ODM)

### Project Structure

```
src/
├── app/
│   ├── core/                    # Core configuration and constants
│   │   ├── config/             # Environment and database configuration
│   │   ├── constants/          # Application constants and enums
│   │   ├── dto/                # Generic DTOs
│   │   └── interfaces/         # Generic interfaces
│   ├── modules/                # Feature modules
│   │   ├── auth/               # Authentication module
│   │   ├── users/              # User management
│   │   ├── customers/          # Customer management
│   │   ├── products/           # Product catalog
│   │   ├── sales-orders/       # Sales order processing
│   │   ├── profile/            # User profile management
│   │   └── shared/             # Shared modules
│   ├── schemas/                # DynamoDB schemas
│   └── shared/                 # Shared utilities and functions
├── lambda.ts                   # AWS Lambda handler
└── main.ts                     # Application bootstrap
```

## 🔧 Features

### Authentication Module

- Google OAuth integration
- JWT token generation and refresh
- Role-based access control (superadmin, admin, assistant, trainer, customer, vyva)
- Secure password handling

### User Management

- Complete user CRUD operations
- User profile management
- Business-specific user associations
- Document type and personal information management

### Customer Management

- Customer relationship management
- Business-specific customer data
- Customer profile management
- Document and contact information tracking

### Product Catalog

- Product and service management
- Inventory tracking with stock management
- Subscription-based products
- Pricing with offer price support
- SKU management
- Multiple measurement units support

### Sales Orders

- Order creation and management
- Multiple payment methods (cash, transfer, card, PSE)
- Order status tracking (pending, partially paid, paid, canceled)
- Sales reporting and analytics
- Daily sales summaries by payment methods

### Profile Management

- User profile retrieval and updates
- Personal information management
- Business information association

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x
- AWS CLI configured
- Serverless Framework
- DynamoDB access

### Installation

1. Clone the repository:

```bash
git clone https://github.com/victorguz/vyva-api.git
cd vyva-auth-api
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
# Copy environment configuration
cp .env.example .env
```

4. Set up AWS credentials and configure the serverless.yml file with your AWS account details.

### Development

1. Start the development server:

```bash
npm run start
```

2. The API will be available at `http://localhost:3000`
3. Swagger documentation available at `http://localhost:3000/api/docs`

### Building

```bash
npm run build
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🚀 Deployment

### AWS Lambda Deployment

The application is configured for serverless deployment using the Serverless Framework.

#### Deploy to QAS (Quality Assurance)

```bash
npm run deploy:qas
```

#### Deploy to Production

```bash
npm run deploy:prd
```

#### Deploy All Environments

```bash
npm run deploy:all
```

#### Force Deploy (Full Stack)

```bash
npm run deploy:qas:force
npm run deploy:prd:force
```

### Serverless Configuration

The `serverless.yml` file configures the AWS Lambda deployment with the following key settings:

#### Service Configuration

```yaml
service: vyva
frameworkVersion: '3'
useDotenv: true
```

- **Service Name**: `vyva` - identifies the service in AWS
- **Framework Version**: Uses Serverless Framework v3
- **Environment Variables**: Loads from `.env` files

#### Provider Configuration

```yaml
provider:
  name: aws
  runtime: nodejs20.x
  memorySize: ${self:custom.MEMORYSIZE.${self:provider.stage}}
  timeout: 30
  stage: ${opt:stage,'dev'}
  region: us-east-1
```

- **Runtime**: Node.js 20.x
- **Memory**: Dynamically configured per environment via SSM parameters
- **Timeout**: 30 seconds maximum execution time
- **Stage**: Environment-specific (dev/qas/prd)
- **Region**: US East 1 (N. Virginia)

#### API Gateway Configuration

```yaml
apiGateway:
  shouldStartNameWithService: true
deploymentBucket:
  name: vyva-api-deployment-bucket
```

- **API Gateway**: Creates REST API with service name prefix
- **Deployment Bucket**: Custom S3 bucket for deployment artifacts

#### IAM Permissions

```yaml
iam:
  role:
    statements:
      - Effect: Allow
        Action:
          - dynamodb:CreateTable
          - dynamodb:DescribeTable
          - dynamodb:PutItem
          - dynamodb:GetItem
          - dynamodb:UpdateItem
          - dynamodb:DeleteItem
          - dynamodb:Query
          - dynamodb:Scan
          - dynamodb:TransactWrite
          - dynamodb:TransactRead
        Resource:
          - arn:aws:dynamodb:${self:provider.region}:754881596744:table/${self:provider.stage}-vyva-*
          - arn:aws:dynamodb:${self:provider.region}:754881596744:table/${self:provider.stage}-vyva-*/index/*
```

- **DynamoDB Access**: Full CRUD operations on environment-specific tables
- **Resource Scope**: Limited to tables with pattern `${stage}-vyva-*`

#### Lambda Function Configuration

```yaml
functions:
  api:
    handler: dist/lambda.handler
    events:
      - http:
          path: /
          method: ANY
      - http:
          path: /{proxy+}
          method: ANY
    layers:
      - arn:aws:lambda:us-east-1:754881596744:layer:vyva-auth:1
```

- **Handler**: Points to compiled Lambda function
- **HTTP Events**: Catches all HTTP methods and paths
- **Lambda Layer**: Custom layer with shared dependencies

#### Environment Variables

All sensitive configuration is managed through AWS Systems Manager Parameter Store (SSM):

```yaml
environment:
  NODE_ENV: ${self:provider.stage}
  PORT: 3000
  ERROR_LOGS: true

  # Database Configuration
  DB_DIALECT: ${ssm:DB_DIALECT}
  DB_USER: ${ssm:DB_USER_${upper(${self:provider.stage})}}
  DB_PASSWORD: ${ssm:DB_PASSWORD_${upper(${self:provider.stage})}}
  DB_NAME: ${ssm:DB_NAME_${upper(${self:provider.stage})}}
  DB_HOST: ${ssm:DB_HOST_${upper(${self:provider.stage})}}
  DB_PORT: ${ssm:DB_PORT_${upper(${self:provider.stage})}}

  # Security
  JWT_SECRET: ${ssm:JWT_SECRET_${upper(${self:provider.stage})}}
  SECRET_KEY: ${ssm:SECRET_KEY_${upper(${self:provider.stage})}}

  # Email Configuration
  ADMIN_PHONE: ${ssm:ADMIN_PHONE}
  ADMIN_EMAIL: ${ssm:ADMIN_EMAIL}
  IAM_SMTP: ${ssm:IAM_SMTP}
  SMTP_HOST: ${ssm:SMTP_HOST}
  SMTP_USER: ${ssm:SMTP_USER}
  SMTP_PASSWORD: ${ssm:SMTP_PASSWORD}
  EMAIL_SENDER: ${ssm:EMAIL_SENDER}

  # AWS Configuration
  ACCESS_KEY_ID: ${ssm:ACCESS_KEY_ID}
  SECRET_ACCESS_KEY: ${ssm:SECRET_ACCESS_KEY}
  REGION: ${ssm:REGION}

  # Google OAuth
  GOOGLE_CLIENT_ID: ${ssm:GOOGLE_CLIENT_ID}
  GOOGLE_CLIENT_SECRET: ${ssm:GOOGLE_CLIENT_SECRET}
```

#### Package Configuration

```yaml
package:
  excludeDevDependencies: true
  patterns:
    - '!**'
    - 'dist/**'
```

- **Exclude Dev Dependencies**: Reduces package size
- **Include Only**: Compiled JavaScript files in `dist/` directory

#### Plugins

```yaml
plugins:
  - serverless-deployment-bucket
  - serverless-stage-manager
  - serverless-plugin-utils
```

- **Deployment Bucket**: Manages S3 deployment bucket
- **Stage Manager**: Handles multi-environment deployments
- **Plugin Utils**: Additional utility functions

### Environment Configuration

The application supports three environments:

- **dev**: Development environment
- **qas**: Quality Assurance environment
- **prd**: Production environment

Environment-specific configuration is managed through AWS Systems Manager Parameter Store (SSM) with the following naming convention:

- `${PARAMETER_NAME}_${UPPERCASE_STAGE}` (e.g., `DB_USER_DEV`, `JWT_SECRET_PRD`)

### Required SSM Parameters

Before deployment, ensure the following parameters are configured in AWS Systems Manager Parameter Store:

#### Database Parameters

- `DB_DIALECT`
- `DB_USER_DEV`, `DB_USER_QAS`, `DB_USER_PRD`
- `DB_PASSWORD_DEV`, `DB_PASSWORD_QAS`, `DB_PASSWORD_PRD`
- `DB_NAME_DEV`, `DB_NAME_QAS`, `DB_NAME_PRD`
- `DB_HOST_DEV`, `DB_HOST_QAS`, `DB_HOST_PRD`
- `DB_PORT_DEV`, `DB_PORT_QAS`, `DB_PORT_PRD`

#### Security Parameters

- `JWT_SECRET_DEV`, `JWT_SECRET_QAS`, `JWT_SECRET_PRD`
- `SECRET_KEY_DEV`, `SECRET_KEY_QAS`, `SECRET_KEY_PRD`

#### Email Parameters

- `ADMIN_PHONE`, `ADMIN_EMAIL`
- `IAM_SMTP`, `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_SENDER`

#### AWS Parameters

- `ACCESS_KEY_ID`, `SECRET_ACCESS_KEY`, `REGION`

#### Google OAuth Parameters

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

#### Lambda Configuration

- `LAMBDA_MEMORYSIZE_DEV`, `LAMBDA_MEMORYSIZE_QAS`, `LAMBDA_MEMORYSIZE_PRD`

## 📊 API Documentation

The API is fully documented using Swagger/OpenAPI. Once deployed or running locally, you can access the interactive documentation at:

- **Local**: `http://localhost:3000/api/docs`
- **Deployed**: `https://your-api-gateway-url/api/docs`

### Main API Endpoints

#### Authentication

- `POST /api/auth/public/google` - Google OAuth sign-in
- `POST /api/auth/refreshToken` - Refresh JWT token

#### Users

- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### Customers

- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `GET /api/customers/:id` - Get customer by ID
- `PATCH /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

#### Products

- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/:id` - Get product by ID
- `PATCH /api/products/:id` - Update product

#### Sales Orders

- `GET /api/sales-orders` - List sales orders
- `POST /api/sales-orders` - Create sales order
- `GET /api/sales-orders/order-number/:orderNumber` - Get order by number
- `PATCH /api/sales-orders/:id` - Update sales order
- `PATCH /api/sales-orders/:id/status` - Update order status
- `DELETE /api/sales-orders/:id` - Delete sales order
- `POST /api/sales-orders/daily-sales-cards` - Get sales report
- `GET /api/sales-orders/daily-payment-methods` - Get payment methods summary

#### Profile

- `GET /api/profile` - Get user profile
- `PATCH /api/profile` - Update user profile

## 🔒 Security

- JWT-based authentication
- Role-based authorization
- Input validation using class-validator
- CORS configuration
- Request IP tracking
- Secure password handling

## 📈 Monitoring & Logging

### Logs

View application logs for different environments:

```bash
# Development logs
npm run logs:dev

# QAS logs
npm run logs:qas

# Production logs
npm run logs:prd
```

## 🛠️ Development Tools

### Code Quality

- ESLint for code linting
- Prettier for code formatting
- Jest for testing
- TypeScript for type safety

### Available Scripts

```bash
# Development
npm run start              # Start development server
npm run start:debug        # Start with debugging
npm run start:prod         # Start production server

# Building
npm run build              # Build the application

# Testing
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:e2e           # Run e2e tests

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format code with Prettier

# Deployment
npm run deploy:qas         # Deploy to QAS
npm run deploy:prd         # Deploy to Production
npm run deploy:all         # Deploy to all environments

# Layer Management
npm run generate:layer     # Generate AWS Lambda layer
npm run generate:layer2    # Generate layer with Windows commands
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the UNLICENSED License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ by the Vyva Development Team**
