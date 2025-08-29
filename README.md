# GSOM Timetable

A web application for viewing GSOM (Graduate School of Management) timetables.

## Schedule Data Storage

This application uses Vercel Blob Storage to securely store schedule data files. This approach has several advantages:

1. **Security**: Schedule data is not exposed in the public repository
2. **Persistence**: Updates made through the admin interface are persistent and not lost on redeployment
3. **Simplicity**: No need to manually update files in the repository

## Admin Interface

The application includes an admin interface at `/update` that allows authorized users to:

1. Migrate all schedule files from the public directory to Blob storage
2. View and edit schedule files
3. Save changes directly to Blob storage

## Development

During development, the application will:

1. Try to read files from Blob storage first
2. Fall back to local files in the `public/data` directory if Blob storage fails
3. Save changes to both Blob storage and local files

## Production

In production, the application will:

1. Read files exclusively from Blob storage
2. Save changes only to Blob storage

## Initial Setup

To set up the application for the first time:

1. Deploy the application to Vercel
2. Set up the required environment variables:
   - `ADMIN_PASSWORD`: Password for the admin interface
   - `BLOB_READ_WRITE_TOKEN`: Token for Vercel Blob storage
3. Visit `/update` and authenticate with the admin password
4. Use the "Migrate All Files to Blob Storage" button to move all schedule files to Blob storage

After migration, you can safely remove the schedule files from the `public/data` directory in the repository.
