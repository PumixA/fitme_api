const DemandesInvitationModel = require('../models/demandesInvitationModel');

exports.sendInvitation = async (req, res) => {
    const { email } = req.body;
    const dateInvitation = new Date();

    try {
        const invitationExists = await DemandesInvitationModel.checkInvitationEmailExists(email);
        if (invitationExists) {
            return res.status(400).json({ message: 'Vous avez déjà fait une demande' });
        }

        const userExists = await DemandesInvitationModel.checkUserEmailExists(email);
        if (userExists) {
            return res.status(400).json({ message: 'Vous avez déjà un compte' });
        }

        const newInvitation = await DemandesInvitationModel.addInvitation(email, dateInvitation);
        res.status(201).json(newInvitation);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
