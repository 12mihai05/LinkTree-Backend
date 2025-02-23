# Link-Tree REST API

This project is a Link-Tree style app built with NestJS, PostgreSQL, and Docker, designed to help users easily manage and organize their links in one place. It includes secure login and user authentication, the ability to create, update, and organize links and folders, and the option to manage user profiles with images stored on the server. Users can also reorder their links and folders to suit their needs, with customizable positions for better organization. To take organization even further, users can create folders inside folders, allowing for a hierarchical structure to keep everything neat and easy to navigate. 

Think of it as a personalized space where users can save, categorize, and arrange their favorite links, making them easy to access and share.

## Features

- **User Management**:
  - User registration and login with hashed passwords (using JWT for authentication).
  - Editable user profiles, including server-side storage for profile images.

- **Link Management**:
  - Create, retrieve, update, delete, and reorder links.
  - Metadata support for links, including title, description, and position for organization.

- **Folder Management**:
  - Modular folder creation, allowing users to create folders inside folders for better categorization.
  - Create, update, delete, and retrieve folders.
  - Organize links within folders for improved structure and management.
  
- **Item Management**:
  - Unified handling of links and folders for easier pagination, sorting, and organization.
  - Reordering of links and folders via the `/items` endpoint.

- **Pagination and Sorting**:
  - Supports pagination and sorting for both links and folders.
  - Items are sorted by position and creation date for easy management.

- **Docker Integration**:
  - Simplified database containerization using Docker for portability and consistency.
 
- **Secure Authentication**:
  - JWT-based authentication for secure access.
  - Middleware to guard routes and protect resources.

---

## Authentication

All protected endpoints require an `Authorization` header with a valid Bearer token:

`Authorization: Bearer <JWT>`

Tokens are issued upon successful login or registration. Use the token to access authenticated resources.

---

## API Endpoints

### Authentication
- **POST** `/auth/signup`: Register a new user.
- **POST** `/auth/signin`: Authenticate an existing user and retrieve a JWT.

### Users
- **GET** `/users/me`: Retrieve the current user's profile (without the password hash).
- **GET** `/users/:username`: Retrieve another user's profile by their username.
- **PATCH** `/users`: Update the current user's profile, including profile image upload.
- **DELETE** `/users`: Delete the current user's profile.

### Links
- **GET** `/links`: Retrieve all links for the authenticated user, optionally filtered by `folderId`.
- **GET** `/links/:username`: Retrieve links for another user by their username, optionally filtered by `folderId`.
- **GET** `/links/folder/:folderId`: Retrieve all links from a specific folder for the authenticated user.
- **GET** `/links/link/:id`: Retrieve a specific link by its ID for the authenticated user.
- **POST** `/links`: Create a new link for the authenticated user.
- **PATCH** `/links/:id`: Edit an existing link by its ID for the authenticated user.
- **DELETE** `/links/:id`: Delete a specific link by its ID for the authenticated user.
- **PATCH** `/links/:id/move-folder`: Move a link to another folder for the authenticated user.

### Folders
- **GET** `/folders`: Retrieve all folders for the authenticated user, optionally filtered by `parentId`.
- **GET** `/folders/:username`: Retrieve folders for another user by their username, optionally filtered by `parentId`.
- **GET** `/folders/:id`: Retrieve a specific folder by its ID for the authenticated user.
- **POST** `/folders`: Create a new folder for the authenticated user.
- **PATCH** `/folders/:id`: Edit an existing folder's details (e.g., title, parentId) for the authenticated user.
- **DELETE** `/folders/:id`: Delete a specific folder by its ID for the authenticated user.

### Items
- **GET** `/items`: Retrieve all items for the authenticated user.
- **GET** `/items/next`: Retrieve the next page of items for the authenticated user.
- **GET** `/items/previous`: Retrieve the previous page of items for the authenticated user.
- **GET** `/items/:username/next`: Retrieve the next page of items for another user.
- **GET** `/items/:username/previous`: Retrieve the previous page of items for another user.
- **GET** `/items/folder/:folderId`: Retrieve items from a specific folder for the authenticated user.
- **GET** `/items/:username`: Retrieve items for another user, with optional pagination.
- **GET** `/items/:username/folder/:folderId`: Retrieve items from a specific folder for another user.
- **PATCH** `/items/positions`: Update the positions of items for the authenticated user.
- **PATCH** `/items/:id/move-folder`: Move an item to another folder.

---

## Future Improvements

- **Frontend Interface**: Develop a user-friendly frontend to complement the API.
- **Analytics**: Track and display click data for individual links, providing insights into user activity.

---

## Additional Information

- Profile images are stored on the server and can be updated via the `/users` endpoint.
- The database is containerized using Docker for ease of deployment and consistency.
- Pagination is available for both links and folders, and items are sorted by position and creation date.
- The API combines links and folders into a single response when fetching items to provide a more comprehensive view of the user's content.
- Folders are modular and can contain subfolders, allowing for hierarchical organization of links.
- All delete operations on users and folders are handled with `onDelete: Cascade`, ensuring that related resources are deleted automatically when the parent resource is removed.
- Sorting Function (utils/sortItems.ts): A utility function that sorts items by `position`. If the position is not available (null), it falls back to sorting by the `createAt` field. This function is used across multiple files to ensure consistent sorting of items.
