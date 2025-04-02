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

    async createUser(req, res) {
        try {
            const { uid, name, spotifyPlaylist } = req.body;

            if (!uid || !name || !spotifyPlaylist) {
                return res.status(400).json(
                    responseHelper.createResponse('error', 'Faltam campos obrigatórios (uid, name, spotifyPlaylist)')
                );
            }

            const normalizedUID = uid.replace(/\s+/g, '').toUpperCase();

            if (this.findUserByUID(normalizedUID)) {
                return res.status(409).json(
                    responseHelper.createResponse('error', 'Usuário com este UID já existe')
                );
            }

            const usersData = JSON.parse(fs.readFileSync(this.usersFilePath, 'utf8'));

            const newUser = {
                uid: normalizedUID,
                name,
                spotifyPlaylist
            };

            usersData.users.push(newUser);
            this.users.push(newUser);

            fs.writeFileSync(this.usersFilePath, JSON.stringify(usersData, null, 2), 'utf8');

            return res.status(201).json(
                responseHelper.createResponse('success', 'Usuário criado com sucesso', newUser)
            );

        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            return res.status(500).json(
                responseHelper.createResponse('error', 'Erro interno do servidor')
            );
        }
    }

    async deleteUser(req, res) {
        try {
            const uid = req.params.uid.replace(/\s+/g, '').toUpperCase();

            const userIndex = this.users.findIndex(user => user.uid === uid);

            if (userIndex === -1) {
                return res.status(404).json(
                    responseHelper.createResponse('error', 'Usuário não encontrado')
                );
            }

            this.users.splice(userIndex, 1);

            const usersData = { users: this.users };
            fs.writeFileSync(this.usersFilePath, JSON.stringify(usersData, null, 2), 'utf8');

            return res.status(200).json(
                responseHelper.createResponse('success', 'Usuário deletado com sucesso')
            );

        } catch (error) {
            console.error('Erro ao deletar usuário:', error);
            return res.status(500).json(
                responseHelper.createResponse('error', 'Erro interno do servidor')
            );
        }
    }

    async updateUser(req, res) {
        try {
            const uidToUpdate = req.params.uid.replace(/\s+/g, '').toUpperCase();
            const { name, spotifyPlaylist } = req.body;

            if (!name && !spotifyPlaylist) {
                return res.status(400).json(
                    responseHelper.createResponse('error', 'Pelo menos um campo (name ou spotifyPlaylist) é necessário para a atualização')
                );
            }

            const userIndex = this.users.findIndex(user => user.uid === uidToUpdate);

            if (userIndex === -1) {
                return res.status(404).json(
                    responseHelper.createResponse('error', 'Usuário não encontrado')
                );
            }

            // Update user fields
            if (name) this.users[userIndex].name = name;
            if (spotifyPlaylist) this.users[userIndex].spotifyPlaylist = spotifyPlaylist;

            const usersData = { users: this.users };
            fs.writeFileSync(this.usersFilePath, JSON.stringify(usersData, null, 2), 'utf8');

            return res.json(
                responseHelper.createResponse('success', 'Usuário atualizado com sucesso', this.users[userIndex])
            );

        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            return res.status(500).json(
                responseHelper.createResponse('error', 'Erro interno do servidor')
            );
        }
    }
}

module.exports = RFIDController;