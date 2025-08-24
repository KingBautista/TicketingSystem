# Ticketing System API Documentation

## Overview

The Ticketing System API provides comprehensive endpoints for managing users, roles, VIP members, rates, discounts, promoters, and system settings. The API uses Laravel Sanctum for authentication and follows RESTful conventions.

## Environment Configuration

### Required Environment Variables

Add these variables to your `.env` file:

```env
# Application
APP_NAME=Ticketing
APP_ENV=local
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

# Database
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=my_ticketing
DB_USERNAME=postgres
DB_PASSWORD=your_password

# Swagger Documentation
L5_SWAGGER_CONST_HOST=http://127.0.0.1:8000
L5_SWAGGER_GENERATE_ALWAYS=true

# Sanctum Authentication
SANCTUM_STATEFUL_DOMAINS=127.0.0.1:8000
SESSION_DOMAIN=127.0.0.1
```

### Development Setup

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Generate application key:**
   ```bash
   php artisan key:generate
   ```

3. **Run migrations:**
   ```bash
   php artisan migrate
   ```

4. **Generate Swagger documentation:**
   ```bash
   php artisan l5-swagger:generate
   ```

## Authentication

The API uses **Bearer Token Authentication** with Laravel Sanctum. All protected endpoints require a valid authentication token.

### Getting Started

1. **Register a new user:**
   ```
   POST /api/auth/signup
   ```

2. **Login to get authentication token:**
   ```
   POST /api/auth/login
   ```

3. **Use the token in subsequent requests:**
   ```
   Authorization: Bearer {your_token}
   ```

## API Documentation Access

### Interactive Documentation
- **URL:** `http://127.0.0.1:8000/docs`
- **Description:** Interactive Swagger UI for testing API endpoints

### JSON Documentation
- **URL:** `http://127.0.0.1:8000/docs`
- **Description:** Raw OpenAPI 3.0 specification in JSON format

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/activate` - Activate user account
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/validate-password` - Validate current user password
- `GET /api/user` - Get current user details
- `POST /api/logout` - User logout

### User Management
- `GET /api/user-management/users` - List users
- `GET /api/user-management/users/{id}` - Get user details
- `POST /api/user-management/users` - Create user
- `PUT /api/user-management/users/{id}` - Update user
- `DELETE /api/user-management/users/{id}` - Delete user (soft delete)
- `POST /api/user-management/users/bulk/delete` - Bulk delete users
- `POST /api/user-management/users/bulk/restore` - Bulk restore users
- `POST /api/user-management/users/bulk/force-delete` - Bulk force delete users
- `POST /api/user-management/users/bulk/role` - Bulk change user roles

**Resources:**
- `GET /api/options/users` - Get users for dropdown

### Role Management
- `GET /api/user-management/roles` - List roles
- `GET /api/user-management/roles/{id}` - Get role details
- `POST /api/user-management/roles` - Create role
- `PUT /api/user-management/roles/{id}` - Update role
- `DELETE /api/user-management/roles/{id}` - Delete role (soft delete)
- `POST /api/user-management/roles/bulk/delete` - Bulk delete roles
- `POST /api/user-management/roles/bulk/restore` - Bulk restore roles
- `POST /api/user-management/roles/bulk/force-delete` - Bulk force delete roles

**Resources:**
- `GET /api/options/roles` - Get roles for dropdown

### VIP Management
- `GET /api/vip-management/vips` - List VIP members
- `GET /api/vip-management/vips/{id}` - Get VIP member details
- `POST /api/vip-management/vips` - Create VIP member
- `PUT /api/vip-management/vips/{id}` - Update VIP member
- `DELETE /api/vip-management/vips/{id}` - Delete VIP member (soft delete)
- `GET /api/vip-management/vips/expiring` - Get expiring VIP members

### Rate Management
- `GET /api/rate-management/rates` - List rates
- `GET /api/rate-management/rates/{id}` - Get rate details
- `POST /api/rate-management/rates` - Create rate
- `PUT /api/rate-management/rates/{id}` - Update rate
- `DELETE /api/rate-management/rates/{id}` - Delete rate (soft delete)

**Resources:**
- `GET /api/options/rates` - Get rates for dropdown

### Discount Management
- `GET /api/rate-management/discounts` - List discounts
- `GET /api/rate-management/discounts/{id}` - Get discount details
- `POST /api/rate-management/discounts` - Create discount
- `PUT /api/rate-management/discounts/{id}` - Update discount
- `DELETE /api/rate-management/discounts/{id}` - Delete discount (soft delete)

### Promoter Management
- `GET /api/promoter-management/promoters` - List promoters
- `GET /api/promoter-management/promoters/{id}` - Get promoter details
- `POST /api/promoter-management/promoters` - Create promoter
- `PUT /api/promoter-management/promoters/{id}` - Update promoter
- `DELETE /api/promoter-management/promoters/{id}` - Delete promoter (soft delete)

**Resources:**
- `GET /api/options/promoters` - Get promoters for dropdown

### System Settings
- `GET /api/system-settings/navigation` - List navigation items
- `GET /api/system-settings/navigation/{id}` - Get navigation details
- `POST /api/system-settings/navigation` - Create navigation item
- `PUT /api/system-settings/navigation/{id}` - Update navigation item
- `DELETE /api/system-settings/navigation/{id}` - Delete navigation item (soft delete)

**Resources:**
- `GET /api/options/navigations` - Get navigations for dropdown

### Dashboard
- `GET /api/dashboard/statistics` - Get dashboard statistics
- `GET /api/dashboard/cashier-performance` - Get cashier performance
- `GET /api/dashboard/today-summary` - Get today's summary

### Cashier Management
- `POST /api/cashier/open-session` - Open cashier session
- `POST /api/cashier/close-session` - Close cashier session
- `POST /api/cashier/transactions` - Create cashier transaction
- `GET /api/cashier/transactions/{transactionId}/tickets` - Get transaction tickets
- `GET /api/cashier/daily-transactions` - Get daily transactions
- `GET /api/cashier/today-transactions` - Get today's transactions

### Audit Trail
- `GET /api/audit-trail` - List audit trail entries
- `POST /api/audit-trail/export` - Export audit trail data
- `GET /api/audit-trail/modules` - Get available modules
- `GET /api/audit-trail/actions` - Get available actions
- `GET /api/audit-trail/statistics` - Get audit statistics
- `GET /api/audit-trail/download-log` - Download log file

### Sales Report
- `GET /api/sales-report` - List sales report data
- `POST /api/sales-report/export` - Export sales report data
- `GET /api/sales-report/statistics` - Get sales statistics

### Scan Management
- `POST /api/scan` - Store scan data
- `GET /api/scan/latest` - Get latest scan data

### Global Resources
- `GET /api/options/routes` - Get system routes

## Response Format

### Success Response
```json
{
  "data": [...],
  "meta": {
    "current_page": 1,
    "per_page": 10,
    "total": 100
  }
}
```

### Error Response
```json
{
  "message": "Error message",
  "errors": {
    "field": ["Validation error"]
  }
}
```

## Common Parameters

### Pagination
- `per_page` - Number of items per page (default: 10)
- `page` - Page number (default: 1)

### Search & Filtering
- `search` - Search term for text fields
- `order` - Field to order by
- `sort` - Sort direction (asc/desc)

### Status Filtering
- `status` - Filter by status (Active/Inactive)
- `active` - Filter by active status

## Error Codes

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

## Development

### Generating Documentation
```bash
php artisan l5-swagger:generate
```

### Adding New Endpoints
1. Add OpenAPI annotations to your controller methods
2. Regenerate documentation: `php artisan l5-swagger:generate`
3. Access the updated documentation at `/docs`

### Authentication Testing
1. Use the `/api/auth/login` endpoint to get a token
2. Click the "Authorize" button in Swagger UI
3. Enter your token: `Bearer {your_token}`
4. Test protected endpoints

## Support

For API support and questions, contact: support@ticketingsystem.com
