const InvitationsModel = require('../models/invitationsModel');
const nodemailer = require('nodemailer');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

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
            const tokenUrl = `http://localhost:4000/api/users/register/${invitation.token}`;
            const qrCodePath = path.join(__dirname, '../uploads/qr-code.png');

            await QRCode.toFile(qrCodePath, tokenUrl);

            await sendInvitationEmail(email, tokenUrl, qrCodePath);
        }

        res.status(201).json(invitation);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const sendInvitationEmail = async (email, tokenUrl, qrCodePath) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: 'Invitation à tester la bêta de FitMe',
        html: `
            <div style="text-align: center;">
                <h1>FitMe</h1>
                <p>Vous avez été sélectionné pour tester la bêta</p>
                <a href="${tokenUrl}">${tokenUrl}</a>
                <div>
                    <img src="cid:qrCode" alt="QR Code" />
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
