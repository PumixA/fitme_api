require('dotenv').config();

const InvitationsModel = require('../models/invitationsModel');
const nodemailer = require('nodemailer');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const apiUrl = process.env.API_URL;
const frontUrl = process.env.FRONT_URL;

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

        if (email) {
            const tokenUrl = `${frontUrl}/register/${invitation.token}`;
            const qrCodePath = path.join(__dirname, '../uploads/qr-code.png');

            await QRCode.toFile(qrCodePath, tokenUrl);

            await sendInvitationEmail(email, tokenUrl, qrCodePath, limite_utilisation);
        }

        res.status(201).json(invitation);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const sendInvitationEmail = async (email, tokenUrl, qrCodePath, limite_utilisation) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: 'Fitme',
        to: email,
        subject: 'Invitation à tester la bêta de FitMe',
        html: `
            <div style="background: url(${apiUrl}/img/background_email.jpg); padding: 50px 0; text-align: center;">
                <div style="background: white; border-radius: 20px; padding: 20px; display: inline-block; max-width: 600px; width: 100%;">
                    <h1 style="font-family: 'Lato', sans-serif; color: #FF5722; font-size: 20px;">FITME (Bêta) 0.1</h1>
                    <p style="font-family: 'Rubik', sans-serif; color: #000000; font-size: 12px;">
                        Félicitations, vous avez été sélectionné pour participer à la bêta de l'application sportive FitMe! Nous restons à votre disposition pour toute demande, problème ou idée d'améliorations futures.
                    </p>
                    <a href="${tokenUrl}" style="font-family: 'Rubik', sans-serif; color: #000000; font-size: 15px;">Lien</a>
                    <div>
                        <img src="cid:qrCode" alt="QR Code" />
                    </div>
                    <p style="font-family: 'Rubik', sans-serif; color: #000000; font-size: 12px;">
                        Vous pouvez créer (sauf si modifications par l'administrateur) ${limite_utilisation} comptes avec ce lien.
                    </p>
                    <p style="font-family: 'Rubik', sans-serif; color: #000000; font-size: 10px;">
                        Développé par Melvin Delorme.
                    </p>
                </div>
            </div>
        `,
        attachments: [
            {
                filename: 'qr-code.png',
                path: qrCodePath,
                cid: 'qrCode'
            }
        ]
    };

    await transporter.sendMail(mailOptions);

    fs.unlinkSync(qrCodePath);
};

exports.getAllInvitations = async (req, res) => {
    try {
        const invitations = await InvitationsModel.getAllInvitations();
        res.status(200).json(invitations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getOneInvitation = async (req, res) => {
    try {
        const invitation = await InvitationsModel.getOneInvitation(req.params.id);
        if (!invitation) {
            return res.status(404).json({ message: 'Invitation non trouvée' });
        }
        const baseUrl = `${apiUrl}/api/users/register/`;
        invitation.registrationLink = `${baseUrl}${invitation.token}`;
        res.status(200).json(invitation);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.editInvitation = async (req, res) => {
    const { limite_utilisation } = req.body;
    const { id } = req.params;

    try {
        const updatedInvitation = await InvitationsModel.editInvitation(id, limite_utilisation);
        if (!updatedInvitation) {
            return res.status(404).json({ message: 'Invitation not found' });
        }
        res.status(200).json({ message: 'Invitation mise à jour avec succès !' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
