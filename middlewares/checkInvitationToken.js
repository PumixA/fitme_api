const InvitationsModel = require('../models/invitationsModel');

const checkInvitationToken = async (req, res, next) => {
    const token = req.params.token;

    if (!token) {
        return res.status(400).json({ message: 'Le token est requis' });
    }

    try {
        const invitation = await InvitationsModel.checkTokenValid(token);

        if (invitation.nombre_utilisation >= invitation.limite_utilisation) {
            return res.status(403).json({ message: `Limite d'utilisation du token atteinte` });
        }

        req.invitation = invitation;
        next();
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = checkInvitationToken;
