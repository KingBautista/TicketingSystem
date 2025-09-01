#!/bin/sh

set -e

echo "Starting Laravel application setup..."

# Wait for database to be ready
echo "Waiting for database..."
max_attempts=30
attempt=1
while ! nc -z postgres 5432; do
  if [ $attempt -ge $max_attempts ]; then
    echo "Error: Database connection failed after $max_attempts attempts"
    exit 1
  fi
  echo "Attempt $attempt/$max_attempts: Database not ready, waiting..."
  sleep 2
  attempt=$((attempt + 1))
done
echo "Database is ready!"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp env.docker .env
fi

# Ensure APP_KEY is set
if ! grep -q "^APP_KEY=base64:" .env; then
    echo "Generating new application key..."
    php artisan key:generate --force
else
    echo "APP_KEY already exists, skipping generation"
fi

# Run database migrations only if needed
echo "Checking migration status..."
if php artisan migrate:status | grep -q "No migrations found\|No pending migrations"; then
    echo "Migrations are up to date, skipping..."
else
    echo "Running database migrations..."
    php artisan migrate --force
fi

# Seed database if needed (only in development and only if not already seeded)
if [ "$APP_ENV" = "local" ] || [ "$APP_ENV" = "development" ]; then
    echo "Checking if database needs seeding..."
    
    # Check if we've already seeded in this session
    if [ "$DB_SEEDED" = "true" ]; then
        echo "Database already seeded (environment variable), skipping..."
    else
        # Check if users table has data (more reliable than flag files)
        echo "Checking database content..."
        if php artisan tinker --execute="echo (App\Models\User::count() > 0 ? 'SEEDED' : 'EMPTY'); exit;" 2>/dev/null | grep -q "SEEDED"; then
            echo "Database already seeded (users exist), skipping..."
            # Set environment variable for this session
            export DB_SEEDED=true
        else
            echo "Seeding database..."
            php artisan db:seed --force || echo "Warning: Database seeding failed or no seeders found"
            echo "Seeding completed"
            # Set environment variable for this session
            export DB_SEEDED=true
        fi
    fi
else
    echo "Not in development mode, skipping seeding"
fi

# Clear all caches
echo "Clearing application caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

# Cache configurations for better performance
echo "Caching configurations..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Create storage symlink if it doesn't exist
if [ ! -L public/storage ]; then
    echo "Creating storage symlink..."
    php artisan storage:link
fi

# Set proper permissions
echo "Setting file permissions..."
chown -R www-data:www-data /var/www/html/storage
chown -R www-data:www-data /var/www/html/bootstrap/cache
chmod -R 755 /var/www/html/storage
chmod -R 755 /var/www/html/bootstrap/cache

# Laravel setup verification completed
echo "Laravel setup verification completed!"

echo "Laravel setup completed successfully!"

# Start PHP-FPM
exec "$@"
