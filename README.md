# RFID Node.js Backend

This project is a simple Node.js backend that communicates with the Wemos D1 R1 (Wi-Fi ESP8266) and the MFRC522 RFID reader. It provides a single route for handling RFID operations.

## Project Structure

```
rfid-nodejs-backend
├── data
│   └── users.json         # User registration data with Spotify playlists
├── src
│   ├── app.js               # Entry point of the application
│   ├── routes
│   │   └── rfid.js          # Route for RFID operations
│   ├── controllers
│   │   └── rfidController.js # Controller for handling RFID requests
│   ├── middleware
│   │   └── logger.js        # Middleware for logging requests
│   └── utils
│       └── responseHelper.js # Utility functions for response formatting
├── package.json              # npm configuration file
├── .env.example              # Example environment variables
├── .gitignore                # Files and directories to ignore by Git
└── README.md                 # Project documentation
```

## Setup Instructions

1. **Clone the repository:**w

   ```
   git clone <repository-url>
   cd rfid-nodejs-backend
   ```

2. **Install dependencies:**

   ```
   node --version
   npm --version   ```

3. **Configure environment variables:**
   Copy the `.env.example` file to `.env` and update the values as needed.

4. **Run the application:**
   ```
   npm start
   ```

## Usage

The backend exposes a single route for RFID operations. You can send requests to this route from the Wemos D1 R1 to interact with the RFID reader.

## API Endpoints

### RFID Operations

- GET `/rfid?uid=<uid>`
  - Description: Returns the user information associated with the given RFID UID, including their Spotify playlist.
  - Query Parameters:
    - `uid`: The UID of the RFID tag
  - Success Response:
    - Status: 200 OK
    - Content: `{ "status": "success", "message": "User found", "data": { "name": "user's name", "spotifyPlaylist": "https://open.spotify.com/playlist/..." } }`
  - Error Response:
    - Status: 404 Not Found
    - Content: `{ "status": "error", "message": "User not found" }`
    - OR
    - Status: 400 Bad Request
    - Content: `{ "status": "error", "message": "UID parameter is required" }`

## License

This project is licensed under the MIT License.
