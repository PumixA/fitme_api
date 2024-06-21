const InvitationsModel = require('../models/invitationsModel');

exports.inviter = async (req, res) => {
    const { email, limite_utilisation } = req.body;

    if (isNaN(limite_utilisation)) {
        return res.status(400).json({ message: 'limite_utilisation doit être un nombre' });
    }

    try {
        if (email) {
            const userExists = await InvitationsModel.checkUserEmailExists(email);
            if (userExists) {
                return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
            }

            const invitationExists = await InvitationsModel.checkInvitationEmailExists(email);
            if (invitationExists) {
                return res.status(400).json({ message: 'Une invitation avec cet email existe déjà' });
            }
        }

        const invitation = await InvitationsModel.createInvitation(email || null, limite_utilisation);
        res.status(201).json(invitation);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
