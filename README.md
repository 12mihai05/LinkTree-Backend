# Link-Tree REST API

A RESTful API built with **NestJS**, **PostgreSQL**, and **Docker**, designed to help users manage and organize their links efficiently. The API includes authentication, CRUD operations for links, and user profile management with server-side storage.

 
  ## Features

- **User Management**:
  - User registration and login with hashed passwords (using JWT for authentication).
  - Editable user profiles, including server-side storage for profile images.

- **Link Management**:
  - Create, retrieve, update, delete, and reorder links.
  - Metadata support for links, including title, description, and position for organization.

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
- **GET** `/users/me`: Retrieve the current user's profile.
- **PATCH** `/users`: Update the user's profile, including name and profile image.

### Links
- **GET** `/links`: Retrieve all links for the authenticated user.
- **POST** `/links`: Create a new link.
- **PATCH** `/links/:id`: Update a specific link by ID.
- **PATCH** `/links/positions`: Reorder links.
- **DELETE** `/links/:id`: Delete a link by ID.

---

## Future Improvements

- **Folder Support**: Enable users to organize links into customizable folders for improved efficiency.
- **Analytics**: Track and display click data for individual links, providing insights into user activity.
- **Frontend Interface**: Develop a user-friendly frontend to complement the API and improve accessibility.

---

## Additional Information

- Profile images are stored on the server and can be updated via the `/users` endpoint.
- The database is containerized using Docker for ease of deployment and consistency.
