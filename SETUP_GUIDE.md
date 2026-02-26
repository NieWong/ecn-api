# ECN News API - Setup Guide

## Overview
This is a complete news platform API with user registration, admin approval workflow, articles/news management, and file storage.

## Key Features

### 1. User Management
- **Registration Flow:**
  - Users register with email and name (no password initially)
  - Registration requests await admin approval (`isActive: false` by default)
  - Admin approves users (sets `isActive: true`)
  - After approval, users set their password
  - Then users can login

- **User Profile:**
  - Profile picture (stored as File)
  - CV/Resume (PDF file)
  - About me text
  - Social media links (Facebook, Twitter, LinkedIn)
  - Phone and website

- **Admin User:**
  - Email: `admin@ecn.local`
  - Password: `ChangeMe123!`
  - Role: `ADMIN`
  - Pre-created with `isActive: true`

### 2. Article/News System
- **Visibility Types:**
  - **PUBLIC:** Anyone can read (including unauthenticated users)
  - **PRIVATE:** Only logged-in users can read

- **Features:**
  - Each article must have a thumbnail/cover image
  - Articles can contain multiple images
  - Articles have metadata (title, summary, body/content)
  - Categories support
  - Draft/Published/Archived status

### 3. File Storage
- All IDs use UUID format
- Files stored with UUID-based `storageKey`
- Support for images and documents
- Each file has owner, visibility, and metadata

## API Endpoints

### Authentication (`/api/auth`)
```
POST   /register         - Register new user (email, name)
POST   /set-password     - Set password after approval (email, password)
POST   /login            - Login (email, password)
GET    /me               - Get current user profile
```

### User Management (`/api/users`)
```
# Admin Routes
GET    /                 - List all users (query: ?isActive=true/false)
GET    /pending          - List pending registration requests
POST   /:id/approve      - Approve user registration
POST   /:id/deactivate   - Deactivate user account

# User Profile Routes (requires authentication)
GET    /profile/:id      - Get user profile
PATCH  /profile/:id      - Update user profile
PATCH  /profile          - Update own profile

# Public Routes
GET    /public/:id       - Get public user profile (no auth required)
```

### Posts/Articles (`/api/posts`)
```
GET    /                 - List posts (PUBLIC visible to all, PRIVATE requires auth)
GET    /:id              - Get single post (PUBLIC visible to all, PRIVATE requires auth)
POST   /                 - Create post (requires auth)
PATCH  /:id              - Update post (requires auth, author or admin only)
DELETE /:id              - Delete post (requires auth, author or admin only)
PUT    /:id/cover        - Set post cover/thumbnail (requires auth)
DELETE /:id/cover        - Remove post cover (requires auth)
```

### Files (`/api/files`)
```
POST   /                 - Upload file (requires auth)
DELETE /:id              - Delete file (requires auth, owner or admin only)
```

### Categories (`/api/categories`)
```
GET    /                 - List all categories
POST   /                 - Create category (requires auth)
GET    /:id              - Get category
PATCH  /:id              - Update category (requires auth)
DELETE /:id              - Delete category (requires auth)
```

## Registration & Login Flow

### For New Users:
1. **Register:**
   ```
   POST /api/auth/register
   {
     "email": "user@example.com",
     "name": "John Doe"
   }
   ```
   Response: Registration request submitted message

2. **Wait for Admin Approval**
   - Admin views pending requests: `GET /api/users/pending`
   - Admin approves: `POST /api/users/{userId}/approve`

3. **Set Password (after approval):**
   ```
   POST /api/auth/set-password
   {
     "email": "user@example.com",
     "password": "SecurePassword123!"
   }
   ```
   Response: User object and JWT token

4. **Login (subsequent logins):**
   ```
   POST /api/auth/login
   {
     "email": "user@example.com",
     "password": "SecurePassword123!"
   }
   ```
   Response: User object and JWT token

### For Admin:
- Login directly (already approved):
  ```
  POST /api/auth/login
  {
    "email": "admin@ecn.local",
    "password": "ChangeMe123!"
  }
  ```

## Creating Articles

### 1. Upload Thumbnail Image:
```
POST /api/files
Content-Type: multipart/form-data
Authorization: Bearer {token}

file: [image file]
ownerId: {userId}
kind: IMAGE
visibility: PUBLIC
```
Response includes `fileId`

### 2. Create Article:
```
POST /api/posts
Authorization: Bearer {token}
{
  "title": "Breaking News",
  "slug": "breaking-news",
  "summary": "This is a summary",
  "contentJson": { "blocks": [...] },
  "contentHtml": "<p>Article content</p>",
  "status": "PUBLISHED",
  "visibility": "PUBLIC",
  "coverFileId": "{fileId-from-step-1}",
  "categoryIds": ["{categoryId}"]
}
```

### 3. Add Additional Images (optional):
```
POST /api/posts/{postId}/images
Authorization: Bearer {token}
{
  "fileId": "{fileId}"
}
```

## User Profile Management

### Update Profile:
```
PATCH /api/users/profile
Authorization: Bearer {token}
{
  "name": "John Doe",
  "aboutMe": "Full stack developer...",
  "facebook": "https://facebook.com/johndoe",
  "twitter": "https://twitter.com/johndoe",
  "linkedin": "https://linkedin.com/in/johndoe",
  "phone": "+1234567890",
  "website": "https://johndoe.com",
  "profilePictureId": "{fileId}",
  "cvFileId": "{fileId}"
}
```

## Database Schema Highlights

### User Model:
- UUID-based ID
- Email, name, password (nullable until set)
- Role: ADMIN or USER
- isActive: false by default (requires admin approval)
- Profile fields: profilePicture, cvFile, aboutMe, social links

### Post Model:
- UUID-based ID
- Title, slug, summary, content (JSON and HTML)
- Status: DRAFT, PUBLISHED, ARCHIVED
- Visibility: PUBLIC (anyone), PRIVATE (logged-in users only)
- Cover image (required for complete article)
- Multiple images support
- Categories

### File Model:
- UUID-based ID
- Storage key (UUID-based filename)
- Owner, kind, visibility
- Original name, mime type, size
- Width/height for images

## Running the Application

### Setup:
1. Install dependencies: `npm install`
2. Setup .env file with DATABASE_URL
3. Run migrations: `npx prisma migrate dev`
4. Seed database: `npm run seed`
5. Start server: `npm run dev`

### Environment Variables:
```
DATABASE_URL=postgresql://user:password@localhost:5432/ecndb
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
UPLOAD_DIR=./uploads
UPLOAD_MAX_MB=10
PORT=3000
```

## Google Drive Integration (Optional Future Enhancement)

Currently, files are stored locally using UUID-based filenames. To integrate Google Drive:

1. Install googleapis: `npm install googleapis`
2. Setup Google Cloud project and enable Drive API
3. Create service account and download credentials
4. Update file.service.ts to use Google Drive API
5. Store Google Drive file IDs in the `storageKey` field

### Example Google Drive Integration:
```typescript
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  keyFile: 'path/to/credentials.json',
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

// Upload file
const fileMetadata = {
  name: `${randomUUID()}${ext}`,
};
const media = {
  mimeType: mimetype,
  body: createReadStream(),
};
const file = await drive.files.create({
  requestBody: fileMetadata,
  media: media,
  fields: 'id',
});

// Store file.data.id as storageKey in database
```

## Testing

### Test Registration Flow:
1. Register a new user
2. Login as admin
3. Approve the user
4. Set password for the new user
5. Login as the new user

### Test Article Creation:
1. Login as approved user
2. Upload a thumbnail image
3. Create a PUBLIC article
4. Access the article without authentication (should work)
5. Create a PRIVATE article
6. Try to access without authentication (should fail)

## Security Notes

- All passwords are hashed with bcrypt
- JWT tokens for authentication
- Role-based access control (ADMIN vs USER)
- File ownership validation
- Post visibility enforcement
- Inactive users cannot login

## API Response Examples

### Successful Login:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "isActive": true,
    "profilePicture": {...},
    "cvFile": {...},
    "aboutMe": "...",
    "facebook": "...",
    ...
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### List Posts (Public):
```json
[
  {
    "id": "uuid",
    "title": "Breaking News",
    "slug": "breaking-news",
    "summary": "This is a summary",
    "status": "PUBLISHED",
    "visibility": "PUBLIC",
    "coverFileId": "uuid",
    "authorId": "uuid",
    "publishedAt": "2026-02-26T...",
    "createdAt": "2026-02-26T...",
    "updatedAt": "2026-02-26T..."
  }
]
```

## Support

For issues or questions, check:
- Schema definition: `prisma/schema.prisma`
- Route definitions: `src/routes/`
- Service logic: `src/services/`
- API documentation: `REST_API.md`
