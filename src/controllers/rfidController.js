const responseHelper = require('../utils/responseHelper');
const open = require('open'); // Add this package for opening URLs
const User = require('../models/User');

class RFIDController {
    constructor() {
    }

    async findUserByUID(uid) {
        // Normalize UID - remove spaces and convert to uppercase
        const normalizedUID = uid.replace(/\s+/g, '').toUpperCase();
        return await User.findOne({ uid: normalizedUID });
    }

    async handleRFIDRequest(req, res) {
        const uid = req.query.uid;

        if (!uid) {
            return res.status(400).json(
                responseHelper.createResponse('error', 'UID parameter is required')
            );
        }

        try {
            const user = await this.findUserByUID(uid);

            if (user) {
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
            console.error('Error finding user:', error);
            return res.status(500).json(
                responseHelper.createResponse('error', 'Internal server error')
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

            const normalizedUID = uid.replace(/\s+/g, '').toUpperCase();

            // Verificar se o usuário já existe
            const existingUser = await User.findOne({ uid: normalizedUID });
            if (existingUser) {
                return res.status(409).json(
                    responseHelper.createResponse('error', 'Usuário com este UID já existe')
                );
            }

            // Criar novo usuário
            const newUser = new User({
                uid: normalizedUID,
                name,
                spotifyLink
            });

            // Salvar no MongoDB
            await newUser.save();

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

            // Procurar e remover o usuário
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
            const uidToUpdate = req.params.uid.replace(/\s+/g, '').toUpperCase();
            const { name, spotifyLink } = req.body;

            if (!name && !spotifyLink) {
                return res.status(400).json(
                    responseHelper.createResponse('error', 'Pelo menos um campo (name ou spotifyLink) é necessário para a atualização')
                );
            }

            // Criar objeto com os campos a serem atualizados
            const updateData = {};
            if (name) updateData.name = name;
            if (spotifyLink) updateData.spotifyLink = spotifyLink;

            // Encontrar e atualizar o usuário
            const updatedUser = await User.findOneAndUpdate(
                { uid: uidToUpdate },
                updateData,
                { new: true } // Retorna o documento atualizado
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
            return res.status(500).json(
                responseHelper.createResponse('error', 'Erro interno do servidor')
            );
        }
    }

    async getAllUsers(req, res) {
        try {
            const users = await User.find();
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