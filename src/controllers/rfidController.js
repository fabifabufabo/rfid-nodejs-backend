const fs = require('fs');
const path = require('path');
const responseHelper = require('../utils/responseHelper');
const open = require('open'); // Add this package for opening URLs

class RFIDController {
    constructor() {
        this.usersFilePath = path.join(__dirname, '../../data/users.json');
        this.users = this.loadUsers();
    }

    loadUsers() {
        try {
            const data = fs.readFileSync(this.usersFilePath, 'utf8');
            return JSON.parse(data).users;
        } catch (error) {
            console.error('Error loading users:', error);
            return [];
        }
    }

    findUserByUID(uid) {
        // Normalize UID - remove spaces and convert to uppercase
        const normalizedUID = uid.replace(/\s+/g, '').toUpperCase();
        return this.users.find(user => user.uid === normalizedUID);
    }

    async handleRFIDRequest(req, res) {
        const uid = req.query.uid;

        if (!uid) {
            return res.status(400).json(
                responseHelper.createResponse('error', 'UID parameter is required')
            );
        }

        const user = this.findUserByUID(uid);

        if (user) {
            // Create the response message
            const message = `Abrindo a playlist de ${user.name}`;

            // If there's a Spotify playlist, open it in the Spotify app or browser
            if (user.spotifyPlaylist) {
                try {
                    // Convert HTTP URL to Spotify URI if it's a web URL
                    let spotifyUri = user.spotifyPlaylist;
                    if (spotifyUri.startsWith('https://open.spotify.com/playlist/')) {
                        const playlistId = spotifyUri.split('/').pop().split('?')[0];
                        spotifyUri = `spotify:playlist:${playlistId}`;
                    }

                    // Open the URI - this will open in Spotify app if installed, otherwise in browser
                    await open(spotifyUri);
                    console.log(`Opening Spotify playlist for ${user.name}`);
                } catch (error) {
                    console.error('Error opening Spotify playlist:', error);
                }
            }

            return res.json(
                responseHelper.createResponse('success', message, { name: user.name })
            );
        } else {
            return res.status(404).json(
                responseHelper.createResponse('error', 'User not found')
            );
        }
    }
}

module.exports = RFIDController;