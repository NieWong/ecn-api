# Frontend Development Specifications - ECN News Platform

## Project Overview

Build a news/article platform similar to Medium.com with user registration, admin approval workflow, article creation with rich media, and user profiles. The platform should have a clean, reading-focused design with emphasis on typography and content.

---

## API Base URL

```
Development: http://localhost:4000/api
```

All authenticated requests require:
```
Authorization: Bearer {jwt_token}
```

---

## TypeScript Types & Interfaces

### User Types

```typescript
enum Role {
  ADMIN = "ADMIN",
  USER = "USER"
}

enum PostStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED"
}

enum Visibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE"
}

enum FileKind {
  IMAGE = "IMAGE",
  DOCUMENT = "DOCUMENT",
  OTHER = "OTHER"
}

interface User {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  isActive: boolean;
  profilePictureId: string | null;
  profilePicture: File | null;
  cvFileId: string | null;
  cvFile: File | null;
  aboutMe: string | null;
  facebook: string | null;
  twitter: string | null;
  linkedin: string | null;
  phone: string | null;
  website: string | null;
  createdAt: string;
  updatedAt: string;
}

interface File {
  id: string;
  ownerId: string;
  kind: FileKind;
  visibility: Visibility;
  originalName: string;
  mimeType: string;
  size: number;
  storageKey: string;
  width: number | null;
  height: number | null;
  createdAt: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  contentJson: any; // Rich text editor structure
  contentHtml: string | null;
  status: PostStatus;
  visibility: Visibility;
  authorId: string;
  author?: User;
  coverFileId: string | null;
  coverFile?: File | null;
  categories?: Category[];
  images?: PostImage[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

interface PostImage {
  postId: string;
  fileId: string;
  file: File;
  sort: number;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface PublicProfile {
  id: string;
  name: string | null;
  aboutMe: string | null;
  facebook: string | null;
  twitter: string | null;
  linkedin: string | null;
  website: string | null;
  profilePicture: File | null;
  cvFile: File | null;
}
```

---

## API Endpoints & Usage

### 1. Authentication Endpoints

#### Register (Step 1 - No Password)
```typescript
POST /auth/register
Content-Type: application/json

Request:
{
  email: string;
  name?: string;
}

Response: 
{
  user: User;
  message: "Registration request submitted. Please wait for admin approval."
}

Status: 201 Created
```

#### Set Password (Step 2 - After Admin Approval)
```typescript
POST /auth/set-password
Content-Type: application/json

Request:
{
  email: string;
  password: string; // min 6 characters
}

Response:
{
  user: User;
  token: string; // JWT token
}

Status: 200 OK
```

#### Login
```typescript
POST /auth/login
Content-Type: application/json

Request:
{
  email: string;
  password: string;
}

Response:
{
  user: User;
  token: string; // JWT token
}

Status: 200 OK

Errors:
- 401: Invalid credentials
- 403: Account not approved or deactivated
- 400: Password not set yet
```

#### Get Current User
```typescript
GET /auth/me
Authorization: Bearer {token}

Response: User | null

Status: 200 OK
```

---

### 2. User Management (Admin Only)

#### List All Users
```typescript
GET /users
GET /users?isActive=true
GET /users?isActive=false
Authorization: Bearer {admin_token}

Response: User[]

Status: 200 OK
```

#### List Pending Registrations
```typescript
GET /users/pending
Authorization: Bearer {admin_token}

Response: User[] // Users with isActive: false

Status: 200 OK
```

#### Approve User
```typescript
POST /users/{userId}/approve
Authorization: Bearer {admin_token}

Response: User // User with isActive: true

Status: 200 OK
```

#### Deactivate User
```typescript
POST /users/{userId}/deactivate
Authorization: Bearer {admin_token}

Response: User // User with isActive: false

Status: 200 OK
```

---

### 3. User Profile Endpoints

#### Get User Profile (Authenticated)
```typescript
GET /users/profile/{userId}
GET /users/profile // Get own profile
Authorization: Bearer {token}

Response: User

Status: 200 OK
```

#### Update Profile
```typescript
PATCH /users/profile/{userId}
PATCH /users/profile // Update own profile
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  name?: string;
  aboutMe?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  phone?: string;
  website?: string;
  profilePictureId?: string; // File UUID
  cvFileId?: string; // File UUID
}

Response: User

Status: 200 OK
```

#### Get Public Profile (No Auth Required)
```typescript
GET /users/public/{userId}

Response: PublicProfile

Status: 200 OK
```

---

### 4. Post/Article Endpoints

#### List Posts
```typescript
GET /posts
GET /posts?status=PUBLISHED
GET /posts?visibility=PUBLIC
GET /posts?authorId={userId}
GET /posts?categoryId={categoryId}
GET /posts?search={searchTerm}
GET /posts?sort=CREATED_AT_DESC
GET /posts?skip=0&take=10
Authorization: Bearer {token} // Optional

Response: Post[]

Status: 200 OK

Notes:
- Without auth: Only PUBLIC posts visible
- With auth: PUBLIC + own PRIVATE posts visible
- Admin: All posts visible

Sort options:
- CREATED_AT_DESC (default)
- CREATED_AT_ASC
- PUBLISHED_AT_DESC
- PUBLISHED_AT_ASC
```

#### Get Single Post
```typescript
GET /posts/{postId}
Authorization: Bearer {token} // Optional for PUBLIC posts

Response: Post

Status: 200 OK

Access Rules:
- PUBLIC posts: Anyone can read
- PRIVATE posts: Only authenticated users
- Author and Admin: Full access to own posts
```

#### Create Post
```typescript
POST /posts
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  title: string;
  slug: string; // URL-friendly
  summary?: string;
  contentJson: any; // Rich editor content
  contentHtml?: string;
  status: PostStatus; // DRAFT, PUBLISHED, ARCHIVED
  visibility: Visibility; // PUBLIC, PRIVATE
  coverFileId?: string; // Thumbnail image UUID
  categoryIds?: string[]; // Array of category UUIDs
}

Response: Post

Status: 201 Created
```

#### Update Post
```typescript
PATCH /posts/{postId}
Authorization: Bearer {token}
Content-Type: application/json

Request: Same as Create (all fields optional)

Response: Post

Status: 200 OK

Access: Author or Admin only
```

#### Delete Post
```typescript
DELETE /posts/{postId}
Authorization: Bearer {token}

Status: 204 No Content

Access: Author or Admin only
```

#### Set Post Cover Image
```typescript
PUT /posts/{postId}/cover
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  fileId: string; // Image file UUID
}

Response: Post

Status: 200 OK
```

#### Remove Post Cover Image
```typescript
DELETE /posts/{postId}/cover
Authorization: Bearer {token}

Response: Post

Status: 200 OK
```

---

### 5. File Upload Endpoints

#### Upload File
```typescript
POST /files
Authorization: Bearer {token}
Content-Type: multipart/form-data

Request:
{
  file: File; // The actual file
  ownerId?: string; // Optional, defaults to current user
  visibility?: "PUBLIC" | "PRIVATE"; // Default: PUBLIC
  kind?: "IMAGE" | "DOCUMENT" | "OTHER"; // Auto-detected from MIME type
}

Response: File

Status: 201 Created

Example usage:
const formData = new FormData();
formData.append('file', fileObject);
formData.append('visibility', 'PUBLIC');
```

#### Delete File
```typescript
DELETE /files/{fileId}
Authorization: Bearer {token}

Status: 204 No Content

Access: File owner or Admin only
```

#### Access File
```typescript
GET /uploads/{storageKey}

Notes:
- Files are stored in /uploads directory with UUID names
- Direct file access via storage key
- Consider using NGINX or CDN for production
```

---

### 6. Category Endpoints

#### List Categories
```typescript
GET /categories

Response: Category[]

Status: 200 OK
```

#### Create Category
```typescript
POST /categories
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  name: string;
  slug: string;
}

Response: Category

Status: 201 Created
```

#### Get Category
```typescript
GET /categories/{categoryId}

Response: Category

Status: 200 OK
```

#### Update Category
```typescript
PATCH /categories/{categoryId}
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  name?: string;
  slug?: string;
}

Response: Category

Status: 200 OK
```

#### Delete Category
```typescript
DELETE /categories/{categoryId}
Authorization: Bearer {token}

Status: 204 No Content
```

---

## User Workflows

### Workflow 1: New User Registration

```
1. User lands on homepage
2. Clicks "Sign Up"
3. Fills registration form:
   - Email (required)
   - Name (optional)
4. Submits form → POST /auth/register
5. Shows message: "Registration pending. You'll receive an email when approved."
6. User waits (show pending status on login attempts)

--- Admin Action Required ---

7. Admin logs in
8. Admin opens "Pending Registrations" page
9. Admin sees list of pending users → GET /users/pending
10. Admin reviews user and clicks "Approve" → POST /users/{id}/approve

--- Back to User ---

11. User receives approval notification (email/notification system - to be implemented)
12. User visits "Set Password" page
13. Enters email and new password
14. Submits → POST /auth/set-password
15. Receives token, redirected to feed
16. User is now fully registered and can login
```

### Workflow 2: Creating an Article

```
1. User clicks "Write" button (must be authenticated)
2. Opens article editor page
3. User enters title (auto-generates slug)
4. User selects thumbnail:
   - Click "Upload Cover Image"
   - Select image file
   - Upload → POST /files
   - Set coverFileId in draft
5. User writes content using rich text editor:
   - Can insert images inline → POST /files for each
   - Text formatting (bold, italic, headings, etc.)
   - Links, quotes, code blocks
6. User can add images to article:
   - Each embedded image uploads to /files
   - Store file IDs for the post
7. User selects categories (multi-select)
8. User chooses visibility:
   - PUBLIC: "Anyone can read"
   - PRIVATE: "Members only"
9. User can:
   - Save as Draft → POST /posts with status: DRAFT
   - Publish → POST /posts with status: PUBLISHED
10. Redirect to article view page
```

### Workflow 3: Reading Articles

```
Public/Unauthenticated User:
1. Lands on homepage
2. Sees list of PUBLIC posts → GET /posts
3. Clicks article → GET /posts/{id}
4. Reads article (if PUBLIC)
5. Cannot access PRIVATE articles (show "Login to read" prompt)

Authenticated User:
1. Logs in
2. Sees feed with PUBLIC + PRIVATE posts → GET /posts
3. Can read any article
4. Can see author profiles → GET /users/public/{authorId}
5. Can follow links to author's other articles
```

### Workflow 4: User Profile Management

```
1. User clicks profile icon → dropdown menu
2. Selects "Edit Profile"
3. Opens profile editor with tabs:
   
   Tab 1: Basic Info
   - Name
   - About Me (textarea)
   
   Tab 2: Profile Picture
   - Current picture preview
   - "Upload New" → POST /files
   - Set profilePictureId → PATCH /users/profile
   
   Tab 3: CV/Resume
   - Current CV preview/download link
   - "Upload New" → POST /files (kind: DOCUMENT)
   - Set cvFileId → PATCH /users/profile
   
   Tab 4: Social Links
   - Facebook URL
   - Twitter URL
   - LinkedIn URL
   - Website URL
   - Phone
   
4. User makes changes
5. Clicks "Save" → PATCH /users/profile
6. Shows success message
7. Profile updated throughout app
```

### Workflow 5: Admin Dashboard

```
1. Admin logs in
2. Sees admin dashboard with sections:

   Section: Pending Registrations
   - List of users with isActive: false
   - Shows: Email, Name, Registration Date
   - Actions: Approve, Reject
   - GET /users/pending
   - Approve: POST /users/{id}/approve
   
   Section: User Management
   - List all users with filters
   - GET /users?isActive=true/false
   - Actions: Deactivate, View Profile
   - POST /users/{id}/deactivate
   
   Section: Content Moderation
   - List all posts (including PRIVATE)
   - GET /posts (sees everything)
   - Actions: Edit, Delete, Archive
   
   Section: Categories
   - List, Create, Edit, Delete categories
   - GET /categories
   - POST /categories
```

---

## UI/UX Design Guidelines (Medium.com Style)

### Design Principles

1. **Typography First**
   - Large, readable fonts (21px for body)
   - Generous line height (1.58)
   - Limited line width (680px max for reading)
   - Serif fonts for articles (Charter, Georgia)
   - Sans-serif for UI (Inter, SF Pro, Helvetica)

2. **White Space**
   - Minimal clutter
   - Lots of padding and margins
   - Focus on content
   - Clean, breathable layouts

3. **Color Palette**
   - Primary: Black (#242424) for text
   - Secondary: Gray (#6B6B6B) for meta info
   - Accent: Green (#1A8917) for actions
   - Background: White (#FFFFFF) or light gray (#FAFAFA)
   - Minimal use of colors - let content shine

4. **Imagery**
   - Hero images for articles (wide aspect ratio ~2:1)
   - High quality, large images
   - Caption support below images
   - Lazy loading for performance

---

## Component Structure

### Layout Components

#### 1. Header/Navigation
```
- Logo (left)
- Search bar (center) - searches articles
- User actions (right):
  - If unauthenticated: "Sign In" | "Sign Up"
  - If authenticated: "Write" button + user avatar dropdown
    - My Profile
    - My Articles
    - Settings
    - Logout
  - If admin: + "Admin Dashboard" link
  
Sticky on scroll with shadow
```

#### 2. Footer
```
- Links: About, Terms, Privacy, Contact
- Social media icons
- Copyright info
- Category links
Simple, minimal design
```

#### 3. Sidebar (Optional on some pages)
```
- Trending articles
- Recommended topics/categories
- "Who to follow" (popular authors)
- Newsletter signup
```

---

### Page Components

#### 1. Homepage / Feed
```tsx
Layout:
- Hero section (optional)
  - Featured article (large image + title)
  
- Main feed grid
  - Article cards in masonry or single column
  
Each Article Card:
- Cover image (if available)
- Title (large, bold)
- Summary (2 lines, truncated)
- Author info:
  - Small avatar
  - Author name (clickable → profile)
  - Post date
  - Read time estimate
- Category tags
- Engagement: Claps/likes count (if implemented)
- Save bookmark icon

Filters:
- Category tabs at top
- Sort dropdown (Latest, Trending, etc.)
- "PUBLIC" / "FOR MEMBERS" toggle

Pagination:
- Infinite scroll or "Load More" button
```

#### 2. Article View Page
```tsx
Layout:
- Full width cover image at top
- Centered content column (max 680px)

Header:
- Title (42px, bold, serif)
- Subtitle/Summary (lighter, italic)
- Author card:
  - Avatar (48px)
  - Name with follow button
  - Publication date
  - Read time
  - Social share buttons

Content:
- Rich text content (contentHtml)
- Render with proper styling:
  - H1, H2, H3 headings
  - Paragraphs with line-height
  - Block quotes (left border accent)
  - Code blocks with syntax highlighting
  - Inline images (full width, with captions)
  - Lists (bullet, numbered)
  - Links with underline on hover

Footer:
- Category tags (clickable)
- Clap/like button (if implemented)
- Comment section (if implemented)
- Share buttons

Related articles section:
- "More from {Author}"
- "Recommended for you"
```

#### 3. Article Editor (Write/Edit)
```tsx
Layout:
- Clean, distraction-free
- Similar to Medium editor

Top Bar:
- Save Draft button
- Publish button (opens publish modal)
- Exit button

Editor:
- Cover image upload area (drag & drop)
  - Preview with edit/remove
  
- Title input (plain text, large)
  - Auto-generate slug on blur
  
- Body (rich text editor):
  - Use Draft.js, Slate, or TipTap
  - Toolbar on text selection:
    - Bold, Italic, Link
    - H1, H2, H3
    - Quote, Code
    - Insert Image (opens upload modal)
  - Inline image upload via paste or button
  
Sidebar (right):
- Preview toggle
- Publishing options:
  - Status: Draft/Published
  - Visibility: Public/Private
  - Categories (multi-select)
  - Custom slug (editable)
- Delete post button (if editing)

Publish Modal:
- Final review
- Confirm visibility
- Add/edit summary (for social share)
- Preview card
- "Publish Now" button
```

#### 4. User Profile Page (Public)
```tsx
Layout:
- Hero section:
  - Large profile picture
  - Name (large)
  - About me text
  - Social links (icons)
  - Download CV button (if cvFile exists)
  - Follow button (if implementing follows)
  
- Tabs:
  - Articles (published by user)
  - About (expanded bio)
  
- Article list (same as feed cards)
- Filter by category if many posts

Access:
- GET /users/public/{userId}
- GET /posts?authorId={userId}
```

#### 5. Settings/Profile Edit Page (Private)
```tsx
Layout:
- Sidebar navigation:
  - Profile Info
  - Photo
  - CV/Resume
  - Social Links
  - Account Settings
  
Main Panel:

Profile Info Tab:
- Name input
- Email (readonly, show current)
- About me (textarea, character count)

Photo Tab:
- Current photo preview (large)
- Upload button → file input
- Crop modal with preview
- Save button

CV/Resume Tab:
- Current CV info (if exists)
  - Filename, upload date
  - Download link
- "Upload New CV" button
- File must be PDF
- Max 10MB warning

Social Links Tab:
- Facebook URL input
- Twitter URL input
- LinkedIn URL input
- Website URL input
- Phone input
- Validation for URL format

Account Settings Tab:
- Change password (if implementing)
- Email preferences
- Deactivate account
```

#### 6. Registration Page
```tsx
Layout:
- Centered card (max 400px)
- Logo at top

Form:
- Email input (required, validation)
- Name input (optional)
- Info text: "No password needed yet"
- "Sign Up" button

After submission:
- Success message:
  "Registration submitted! 
   You'll receive an email once an admin approves your account.
   Then you can set your password and start writing."
   
- "Back to Home" button

Simplified, calming design
```

#### 7. Set Password Page
```tsx
Layout:
- Centered card

Form:
- Email input (required)
- Password input (min 6 chars)
- Password confirmation
- "Set Password & Login" button

After submission:
- Store token in localStorage/cookies
- Redirect to feed
- Show welcome toast
```

#### 8. Login Page
```tsx
Layout:
- Centered card

Form:
- Email input
- Password input
- "Remember me" checkbox
- "Login" button
- "Forgot password?" link (if implementing)

Links:
- "Don't have an account? Sign up"

Error messages:
- "Invalid credentials"
- "Account not approved yet" 
  (show link to check approval status)
- "Please set your password first"
  (show link to set password page)
```

#### 9. Admin Dashboard
```tsx
Layout:
- Sidebar navigation:
  - Dashboard Overview
  - Pending Registrations
  - User Management
  - Content Moderation
  - Categories
  
Dashboard Overview Tab:
- Stats cards:
  - Total users
  - Pending approvals (highlighted)
  - Total posts
  - Posts today
  
Pending Registrations Tab:
- Table view:
  Columns: Email | Name | Registered Date | Actions
  Actions: [Approve] [Reject]
- GET /users/pending
- Real-time updates (polling or websocket)

User Management Tab:
- Filters: All | Active | Inactive
- Search bar
- Table view:
  Columns: Email | Name | Role | Status | Registered | Actions
  Actions: [View] [Deactivate] [Activate]
  
Content Moderation Tab:
- All posts (PUBLIC + PRIVATE)
- Filters: Status, Visibility
- Table view:
  Columns: Title | Author | Status | Visibility | Date | Actions
  Actions: [View] [Edit] [Delete] [Archive]
  
Categories Tab:
- List of categories
- "Add Category" button
- Edit/Delete actions
```

---

## State Management Recommendations

### Global State (Context/Redux/Zustand)

```typescript
// Auth State
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name?: string) => Promise<void>;
  setPassword: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// Posts State
interface PostsState {
  posts: Post[];
  currentPost: Post | null;
  isLoading: boolean;
  filters: {
    status?: PostStatus;
    visibility?: Visibility;
    categoryId?: string;
    search?: string;
  };
  fetchPosts: () => Promise<void>;
  fetchPost: (id: string) => Promise<void>;
  createPost: (data: CreatePostData) => Promise<Post>;
  updatePost: (id: string, data: UpdatePostData) => Promise<Post>;
  deletePost: (id: string) => Promise<void>;
}

// UI State
interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  toggleSidebar: () => void;
}
```

---

## API Client Example

```typescript
// api/client.ts
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (email: string, name?: string) =>
    apiClient.post('/auth/register', { email, name }),
    
  setPassword: (email: string, password: string) =>
    apiClient.post('/auth/set-password', { email, password }),
    
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
    
  getMe: () =>
    apiClient.get('/auth/me'),
};

// Posts API
export const postsAPI = {
  list: (params?: any) =>
    apiClient.get('/posts', { params }),
    
  get: (id: string) =>
    apiClient.get(`/posts/${id}`),
    
  create: (data: any) =>
    apiClient.post('/posts', data),
    
  update: (id: string, data: any) =>
    apiClient.patch(`/posts/${id}`, data),
    
  delete: (id: string) =>
    apiClient.delete(`/posts/${id}`),
    
  setCover: (id: string, fileId: string) =>
    apiClient.put(`/posts/${id}/cover`, { fileId }),
};

// Files API
export const filesAPI = {
  upload: (file: File, visibility = 'PUBLIC') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('visibility', visibility);
    return apiClient.post('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  delete: (id: string) =>
    apiClient.delete(`/files/${id}`),
    
  getUrl: (storageKey: string) =>
    `${API_BASE.replace('/api', '')}/uploads/${storageKey}`,
};

// Users API
export const usersAPI = {
  getProfile: (id?: string) =>
    apiClient.get(id ? `/users/profile/${id}` : '/users/profile'),
    
  updateProfile: (data: any) =>
    apiClient.patch('/users/profile', data),
    
  getPublicProfile: (id: string) =>
    apiClient.get(`/users/public/${id}`),
    
  // Admin only
  listUsers: (params?: any) =>
    apiClient.get('/users', { params }),
    
  listPending: () =>
    apiClient.get('/users/pending'),
    
  approve: (id: string) =>
    apiClient.post(`/users/${id}/approve`),
    
  deactivate: (id: string) =>
    apiClient.post(`/users/${id}/deactivate`),
};

// Categories API
export const categoriesAPI = {
  list: () =>
    apiClient.get('/categories'),
    
  get: (id: string) =>
    apiClient.get(`/categories/${id}`),
    
  create: (data: { name: string; slug: string }) =>
    apiClient.post('/categories', data),
    
  update: (id: string, data: any) =>
    apiClient.patch(`/categories/${id}`, data),
    
  delete: (id: string) =>
    apiClient.delete(`/categories/${id}`),
};
```

---

## Utility Functions

### Slug Generation
```typescript
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

### Read Time Calculation
```typescript
export function calculateReadTime(html: string): number {
  const wordsPerMinute = 200;
  const text = html.replace(/<[^>]*>/g, '');
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}
```

### Date Formatting
```typescript
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
```

### Image URL Helper
```typescript
export function getImageUrl(file: File | null | undefined): string {
  if (!file) return '/placeholder-image.jpg';
  return `${process.env.NEXT_PUBLIC_API_BASE?.replace('/api', '')}/uploads/${file.storageKey}`;
}
```

---

## Responsive Design Breakpoints

```css
/* Mobile First */
--mobile: 320px;
--tablet: 768px;
--desktop: 1024px;
--wide: 1440px;

/* Content widths */
--content-narrow: 680px;  /* For article reading */
--content-medium: 920px;  /* For forms and cards */
--content-wide: 1200px;   /* For feed grid */
```

---

## Performance Considerations

1. **Image Optimization**
   - Use next/image or similar
   - Lazy load images
   - Generate thumbnails on backend
   - WebP format with fallbacks

2. **Code Splitting**
   - Route-based splitting
   - Lazy load editor on write page
   - Dynamic imports for heavy components

3. **Caching**
   - Cache API responses
   - React Query or SWR for data fetching
   - localStorage for drafts

4. **SEO**
   - Server-side rendering for article pages
   - Meta tags (Open Graph, Twitter Cards)
   - Structured data (JSON-LD)
   - Sitemap generation

---

## Security Best Practices

1. **Token Storage**
   - Use httpOnly cookies (recommended) or localStorage
   - Clear on logout
   - Implement token refresh

2. **Input Sanitization**
   - Sanitize HTML content (DOMPurify)
   - XSS prevention
   - validate all inputs

3. **File Uploads**
   - Validate file types and sizes
   - Show progress indicators
   - Handle errors gracefully

4. **HTTPS**
   - Use HTTPS in production
   - Secure cookie flags

---

## Recommended Tech Stack

### Core
- **Framework**: Next.js 14+ (App Router) or React + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS Modules for components

### State & Data
- **State Management**: Zustand or Redux Toolkit
- **Data Fetching**: TanStack Query (React Query) or SWR
- **Forms**: React Hook Form + Zod validation

### Rich Text Editor
- **Option 1**: TipTap (recommended - most flexible)
- **Option 2**: Draft.js (Medium uses this)
- **Option 3**: Slate.js (highly customizable)
- **Option 4**: Quill (simpler, less config)

### UI Components
- **Base**: Headless UI or Radix UI
- **Icons**: Heroicons or Lucide React
- **Notifications**: React Hot Toast or Sonner

### Utilities
- **Date**: date-fns or Day.js
- **HTTP**: Axios or native fetch
- **File Upload**: Uppy or react-dropzone
- **Image Crop**: react-easy-crop

---

## Development Phases

### Phase 1: Core Authentication (Week 1)
- [ ] Setup project structure
- [ ] Implement API client
- [ ] Create auth context/state
- [ ] Build registration page
- [ ] Build set password page
- [ ] Build login page
- [ ] Implement protected routes
- [ ] Build basic header/footer

### Phase 2: Article Reading (Week 2)
- [ ] Build homepage/feed
- [ ] Build article view page
- [ ] Implement article cards
- [ ] Add category filtering
- [ ] Add search functionality
- [ ] Build public profile page
- [ ] Implement responsive design

### Phase 3: Article Writing (Week 3)
- [ ] Integrate rich text editor
- [ ] Build editor UI
- [ ] Implement image upload
- [ ] Build publish modal
- [ ] Add draft saving
- [ ] Add slug generation
- [ ] Test editor thoroughly

### Phase 4: User Profiles (Week 4)
- [ ] Build profile edit page
- [ ] Implement photo upload
- [ ] Implement CV upload
- [ ] Add social links
- [ ] Build settings page
- [ ] Add profile preview

### Phase 5: Admin Dashboard (Week 5)
- [ ] Build admin layout
- [ ] Build pending approvals UI
- [ ] Build user management
- [ ] Build content moderation
- [ ] Build category management
- [ ] Add admin actions

### Phase 6: Polish & Enhancement (Week 6)
- [ ] Add loading states
- [ ] Add error boundaries
- [ ] Implement optimistic updates
- [ ] Add animations/transitions
- [ ] Improve accessibility
- [ ] Add SEO meta tags
- [ ] Performance optimization
- [ ] Cross-browser testing

---

## Testing Checklist

### Authentication Flow
- [ ] Can register new user
- [ ] Registration shows pending message
- [ ] Cannot login before approval
- [ ] Admin can see pending user
- [ ] Admin can approve user
- [ ] Can set password after approval
- [ ] Can login with credentials
- [ ] Token persists across refresh
- [ ] Can logout

### Article Creation
- [ ] Can access write page when authenticated
- [ ] Can upload cover image
- [ ] Can write with rich text editor
- [ ] Can insert inline images
- [ ] Can save as draft
- [ ] Can publish article
- [ ] Can choose PUBLIC/PRIVATE
- [ ] Can select categories
- [ ] Slug auto-generates correctly

### Article Reading
- [ ] Unauthenticated can read PUBLIC articles
- [ ] Unauthenticated cannot read PRIVATE articles
- [ ] Authenticated can read PRIVATE articles
- [ ] Feed shows correct articles based on auth
- [ ] Categories filter works
- [ ] Search works
- [ ] Pagination works

### Profile Management
- [ ] Can view own profile
- [ ] Can edit profile info
- [ ] Can upload profile picture
- [ ] Can upload CV
- [ ] Can add social links
- [ ] Changes save correctly
- [ ] Public profile shows correctly

### Admin Features
- [ ] Admin dashboard accessible to admin only
- [ ] Can view pending registrations
- [ ] Can approve users
- [ ] Can deactivate users
- [ ] Can view all posts
- [ ] Can moderate content
- [ ] Can manage categories

---

## Launch Checklist

### Pre-Launch
- [ ] All features tested
- [ ] Responsive on mobile/tablet/desktop
- [ ] SEO meta tags implemented
- [ ] Error handling in place
- [ ] Loading states everywhere
- [ ] Accessibility audit passed
- [ ] Performance optimized (Lighthouse score)
- [ ] Security review done
- [ ] API rate limiting understood
- [ ] Analytics implemented (Google Analytics, etc.)

### Deployment
- [ ] Environment variables configured
- [ ] Production build tested
- [ ] CDN configured for images
- [ ] Domain configured
- [ ] SSL certificate installed
- [ ] Backup strategy in place
- [ ] Monitoring tools setup (Sentry, etc.)

### Post-Launch
- [ ] Monitor error logs
- [ ] Gather user feedback
- [ ] Fix critical bugs
- [ ] Plan feature iterations

---

## Future Enhancements

### Features to Consider
- [ ] Comments on articles
- [ ] Claps/likes system (like Medium)
- [ ] Follow/unfollow authors
- [ ] Bookmarks/reading list
- [ ] Email notifications
- [ ] Social sharing
- [ ] RSS feed
- [ ] Newsletter integration
- [ ] Dark mode
- [ ] Multilingual support
- [ ] Article series/collections
- [ ] Reading progress indicator
- [ ] Estimated reading time
- [ ] Table of contents for long articles
- [ ] Related articles algorithm
- [ ] Trending/Popular section
- [ ] Tags in addition to categories
- [ ] Draft sharing/collaboration

---

## Support & Resources

### API Documentation
- Full API docs: `REST_API.md`
- Setup guide: `SETUP_GUIDE.md`
- Implementation summary: `IMPLEMENTATION_COMPLETE.md`

### Admin Account
- Email: `admin@ecn.local`
- Password: `ChangeMe123!`

### Design Inspiration
- Medium.com (primary)
- Substack
- Dev.to
- Hashnode
