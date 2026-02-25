# ECN API - REST API

A type-safe REST API built with Express, TypeScript, Prisma, and Zod validation.

## Tech Stack

- **Express** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM & database toolkit  
- **Zod** - Runtime type validation & inference
- **JWT** - Authentication
- **Multer** - File uploads
- **PostgreSQL** - Database

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - List all users (Admin only)

### Posts
- `GET /api/posts` - List posts (with filtering & pagination)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create post (Auth required)
- `PATCH /api/posts/:id` - Update post (Auth required)
- `DELETE /api/posts/:id` - Delete post (Auth required)
- `PUT /api/posts/:id/cover` - Set post cover image (Auth required)
- `DELETE /api/posts/:id/cover` - Clear post cover (Auth required)

### Post Images
- `POST /api/posts/:postId/images` - Add image to post (Auth required)
- `DELETE /api/posts/:postId/images` - Remove image from post (Auth required)

### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (Admin only)
- `DELETE /api/categories/:id` - Delete category (Admin only)

### Files
- `GET /api/files` - List files
- `GET /api/files/:id` - Get file metadata
- `POST /api/files` - Upload file (Auth required, multipart/form-data)
- `DELETE /api/files/:id` - Delete file (Auth required)

## Type Safety with Zod

This API uses **Zod** for runtime validation and TypeScript type inference - similar to how Nexus provided type safety in GraphQL:

1. **Schema Definition** - Define validation schemas in `src/validation/schemas/`
2. **Type Inference** - TypeScript types are automatically inferred from Zod schemas
3. **Runtime Validation** - Request bodies and queries are validated at runtime
4. **Type-safe Controllers** - Controllers use inferred types for type safety

Example:
```typescript
// Define schema
export const createPostSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  contentJson: z.record(z.unknown()),
});

// Infer TypeScript type
export type CreatePostInput = z.infer<typeof createPostSchema>;

// Use in controller with validation middleware
export const createPost: RequestHandler[] = [
  requireAuth,
  validateBody(createPostSchema), // Runtime validation
  async (req, res, next) => {
    // req.body is now typed as CreatePostInput
    const post = await postService.create(req.body);
    res.status(201).json(post);
  },
];
```

## Project Structure

```
src/
  controllers/          # Request handlers
  routes/              # Route definitions
  services/            # Business logic
  repositories/        # Database access
  validation/          # Zod schemas & middleware
    schemas/           # Validation schemas
    middleware.ts      # Validation middlewares
  middleware/          # Express middleware
  utils/              # Utility functions
  config/             # Configuration
  db/                 # Database connection
  types/              # TypeScript types
```

## Development

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Seed database
npm run seed

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ecn
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
PORT=4000
NODE_ENV=development
UPLOAD_DIR=uploads
UPLOAD_MAX_MB=25
```

## Authentication

Include JWT token in Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## File Uploads

Use `multipart/form-data` with field name `file`:
```bash
curl -X POST http://localhost:4000/api/files \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/file.jpg" \
  -F "visibility=PUBLIC" \
  -F "kind=IMAGE"
```
