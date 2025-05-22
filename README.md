# RFID Node.js Backend with MongoDB

This project is a simple Node.js backend that communicates with the Wemos D1 R1 (Wi-Fi ESP8266) and the MFRC522 RFID reader. It provides routes for handling RFID operations and stores data in MongoDB.

## Project Structure

```
rfid-nodejs-backend
├── data
│   └── users.json         # Legacy user data
├── src
│   ├── app.js             # Entry point of the application
│   ├── config
│   │   └── db.js          # MongoDB connection configuration
│   ├── routes
│   │   └── rfid.js        # Routes for RFID operations
│   ├── controllers
│   │   └── rfidController.js # Controller for handling RFID requests
│   ├── middleware
│   │   └── logger.js      # Middleware for logging requests
│   ├── models
│   │   └── User.js        # MongoDB User model
│   └── utils
│       └── responseHelper.js # Utility functions for response formatting
├── package.json           # npm configuration file
├── .env                   # Environment variables (MongoDB connection, etc.)
├── .gitignore             # Files and directories to ignore by Git
└── README.md              # Project documentation
```

## Setup Instructions

1. **Clone the repository:**

   ```
   git clone <repository-url>
   cd rfid-nodejs-backend
   ```

2. **Install dependencies:**

   ```
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root directory with the following content:
   
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/rfid-spotify
   ```
   
   Note: Adjust the MongoDB URI according to your MongoDB setup. If you're using MongoDB Atlas,
   use the connection string provided by Atlas.

4. **Ensure MongoDB is running:**
   Make sure you have MongoDB installed and running on your system, or have access to a MongoDB instance.

5. **Run the application:**
   ```
   npm start
   ```
   
   For development with auto-restart:
   ```
   npm run dev
   ```

## Usage

The backend exposes routes for RFID operations. You can send requests to these routes from the Wemos D1 R1 to interact with the RFID reader or from any other client to manage users.

## API Endpoints

### RFID Operations

- GET `/rfid?uid=<uid>`
  - Description: Returns the user information associated with the given RFID UID, and opens their associated Spotify resource (song, playlist, album, etc).
  - Query Parameters:
    - `uid`: The UID of the RFID tag
  - Success Response:
    - Status: 200 OK
    - Content: `{ "status": "success", "message": "Abrindo a música/playlist de user's name", "data": { "name": "user's name" } }`
  - Error Response:
    - Status: 404 Not Found
    - Content: `{ "status": "error", "message": "User not found" }`
    - OR
    - Status: 400 Bad Request
    - Content: `{ "status": "error", "message": "UID parameter is required" }`

### User Management

- GET `/rfid/users`

  - Description: Retrieves a list of all registered users
  - Success Response:
    - Status: 200 OK
    - Content: `{ "status": "success", "message": "Lista de usuários recuperada com sucesso", "data": [array of user objects] }`
  - Error Response:
    - Status: 500 Internal Server Error
    - Content: `{ "status": "error", "message": "Erro interno do servidor" }`

- POST `/rfid/users`

  - Description: Creates a new user with the specified RFID UID, name, and Spotify link
  - Request Body:
    - `uid`: The UID of the RFID tag (string, required)
    - `name`: The name of the user (string, required)
    - `spotifyLink`: The Spotify link to open when the RFID is detected (string, required)
  - Success Response:
    - Status: 201 Created
    - Content: `{ "status": "success", "message": "Usuário criado com sucesso", "data": { "uid": "uid", "name": "name", "spotifyLink": "link" } }`
  - Error Response:
    - Status: 400 Bad Request
    - Content: `{ "status": "error", "message": "Faltam campos obrigatórios (uid, name, spotifyLink)" }`
    - OR
    - Status: 409 Conflict
    - Content: `{ "status": "error", "message": "Usuário com este UID já existe" }`
    - OR
    - Status: 500 Internal Server Error
    - Content: `{ "status": "error", "message": "Erro interno do servidor" }`

- DELETE `/rfid/users/:uid`

  - Description: Deletes the user with the specified RFID UID
  - URL Parameters:
    - `uid`: The UID of the RFID tag
  - Success Response:
    - Status: 200 OK
    - Content: `{ "status": "success", "message": "Usuário deletado com sucesso" }`
  - Error Response:
    - Status: 404 Not Found
    - Content: `{ "status": "error", "message": "Usuário não encontrado" }`
    - OR
    - Status: 500 Internal Server Error
    - Content: `{ "status": "error", "message": "Erro interno do servidor" }`

- PATCH `/rfid/users/:uid`
  - Description: Updates the user with the specified RFID UID
  - URL Parameters:
    - `uid`: The UID of the RFID tag
  - Request Body:
    - `name`: The new name of the user (string, optional)
    - `spotifyLink`: The new Spotify link (string, optional)
  - Success Response:
    - Status: 200 OK
    - Content: `{ "status": "success", "message": "Usuário atualizado com sucesso", "data": { "uid": "uid", "name": "name", "spotifyLink": "link" } }`
  - Error Response:
    - Status: 400 Bad Request
    - Content: `{ "status": "error", "message": "Pelo menos um campo (name ou spotifyLink) é necessário para a atualização" }`
    - OR
    - Status: 404 Not Found
    - Content: `{ "status": "error", "message": "Usuário não encontrado" }`
    - OR
    - Status: 500 Internal Server Error
    - Content: `{ "status": "error", "message": "Erro interno do servidor" }`

## License

This project is licensed under the MIT License.

## MongoDB Integration

This application uses MongoDB to store user data in the `rfid-spotify` database. The following collections are used:

- `users`: Stores user information with RFID UIDs and Spotify links

### Database Schema

The `users` collection has the following schema:

```javascript
{
  uid: String,      // RFID card UID (normalized to uppercase with no spaces)
  name: String,     // User name
  spotifyLink: String // Spotify link or URI
}
```
