const responseHelper = require('../utils/responseHelper');
const open = require('open'); // Add this package for opening URLs
const User = require('../models/User'); // Import the User model

class RFIDController {
    // Helper method to normalize UID
    normalizeUID(uid) {
        return uid.replace(/\s+/g, '').toUpperCase();
    }

    async findUserByUID(uid) {
        try {
            const normalizedUID = this.normalizeUID(uid);
            return await User.findOne({ uid: normalizedUID });
        } catch (error) {
            console.error('Error finding user by UID:', error);
            throw error;
        }
    }

    async handleRFIDRequest(req, res) {
        try {
            const uid = req.query.uid;

            if (!uid) {
                return res.status(400).json(
                    responseHelper.createResponse('error', 'UID parameter is required')
                );
            }

            const user = await this.findUserByUID(uid);

            if (user) {
                // Create the response message
                const message = `Abrindo a música/playlist de ${user.name}`;

                // If there's a Spotify link, open it in the Spotify app or browser
                if (user.spotifyLink) {
                    try {
                        // Convert HTTP URL to Spotify URI if it's a web URL
                        let spotifyUri = user.spotifyLink;
                        if (spotifyUri.startsWith('https://open.spotify.com/')) {
                            // Extract the type and ID from the URL
                            const urlParts = spotifyUri.split('/');
                            const resourceIndex = urlParts.indexOf('open.spotify.com') + 1;

                            if (resourceIndex < urlParts.length - 1) {
                                const resourceType = urlParts[resourceIndex];  // playlist, track, album, etc.
                                const resourceId = urlParts[resourceIndex + 1].split('?')[0]; // Remove query params
                                spotifyUri = `spotify:${resourceType}:${resourceId}`;
                            }
                        }

                        // Open the URI - this will open in Spotify app if installed, otherwise in browser
                        await open(spotifyUri);
                        console.log(`Opening Spotify resource for ${user.name}: ${spotifyUri}`);
                    } catch (error) {
                        console.error('Error opening Spotify resource:', error);
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
        } catch (error) {
            console.error('Error handling RFID request:', error);
            return res.status(500).json(
                responseHelper.createResponse('error', 'Erro interno do servidor')
            );
        }
    }

    async createUser(req, res) {
        try {
            const { uid, name, spotifyLink } = req.body;

            if (!uid || !name || !spotifyLink) {
                return res.status(400).json(
                    responseHelper.createResponse('error', 'Faltam campos obrigatórios (uid, name, spotifyLink)')
                );
            }

            const normalizedUID = this.normalizeUID(uid);

            // Check if user already exists
            const existingUser = await User.findOne({ uid: normalizedUID });
            if (existingUser) {
                return res.status(409).json(
                    responseHelper.createResponse('error', 'Usuário com este UID já existe')
                );
            }

            // Create new user
            const newUser = new User({
                uid: normalizedUID,
                name: name.trim(),
                spotifyLink: spotifyLink.trim()
            });

            const savedUser = await newUser.save();

            return res.status(201).json(
                responseHelper.createResponse('success', 'Usuário criado com sucesso', savedUser)
            );

        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            
            // Handle MongoDB validation errors
            if (error.name === 'ValidationError') {
                const errorMessages = Object.values(error.errors).map(err => err.message);
                return res.status(400).json(
                    responseHelper.createResponse('error', `Erro de validação: ${errorMessages.join(', ')}`)
                );
            }
            
            // Handle duplicate key error
            if (error.code === 11000) {
                return res.status(409).json(
                    responseHelper.createResponse('error', 'Usuário com este UID já existe')
                );
            }

            return res.status(500).json(
                responseHelper.createResponse('error', 'Erro interno do servidor')
            );
        }
    }

    async deleteUser(req, res) {
        try {
            const uid = this.normalizeUID(req.params.uid);

            const deletedUser = await User.findOneAndDelete({ uid });

            if (!deletedUser) {
                return res.status(404).json(
                    responseHelper.createResponse('error', 'Usuário não encontrado')
                );
            }

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
            const uidToUpdate = this.normalizeUID(req.params.uid);
            const { name, spotifyLink } = req.body;

            if (!name && !spotifyLink) {
                return res.status(400).json(
                    responseHelper.createResponse('error', 'Pelo menos um campo (name ou spotifyLink) é necessário para a atualização')
                );
            }

            // Build update object
            const updateData = {};
            if (name) updateData.name = name.trim();
            if (spotifyLink) updateData.spotifyLink = spotifyLink.trim();

            const updatedUser = await User.findOneAndUpdate(
                { uid: uidToUpdate },
                updateData,
                { new: true, runValidators: true }
            );

            if (!updatedUser) {
                return res.status(404).json(
                    responseHelper.createResponse('error', 'Usuário não encontrado')
                );
            }

            return res.json(
                responseHelper.createResponse('success', 'Usuário atualizado com sucesso', updatedUser)
            );

        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            
            // Handle MongoDB validation errors
            if (error.name === 'ValidationError') {
                const errorMessages = Object.values(error.errors).map(err => err.message);
                return res.status(400).json(
                    responseHelper.createResponse('error', `Erro de validação: ${errorMessages.join(', ')}`)
                );
            }

            return res.status(500).json(
                responseHelper.createResponse('error', 'Erro interno do servidor')
            );
        }
    }

    async getAllUsers(req, res) {
        try {
            const users = await User.find().sort({ createdAt: -1 });
            
            return res.json(
                responseHelper.createResponse('success', 'Lista de usuários recuperada com sucesso', users)
            );
        } catch (error) {
            console.error('Erro ao recuperar usuários:', error);
            return res.status(500).json(
                responseHelper.createResponse('error', 'Erro interno do servidor')
            );
        }
    }
}

module.exports = RFIDController;
