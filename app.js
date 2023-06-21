// Import dependencies
const moment = require("moment");
const PDFDocument = require("pdfkit");
const express = require("express");
const nodemailer = require("nodemailer");
const fs = require('fs');
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Setup Express
const app = express();
const port = 3000;
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(express.static(__dirname + "/public"));
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function generatePDF(callback,name,email) {
    const doc = new PDFDocument({
        layout: "landscape",
        size: "A4",
    });
    // The name
    const certificateInput = name;
    // Draw the certificate image
    doc.image("images/certificate.png", 0, 0, { width: 842 });
    // Set the font to Dancing Script
    doc.font("fonts/DancingScript-VariableFont_wght.ttf");
    // Draw the name
    doc.fontSize(60).text(certificateInput, 20, 265, {
        align: "center"
    });
    // Draw the date
    doc.fontSize(17).text(moment().format("MMMM Do YYYY"), 500, 490, {
        align: "center"
    });

    // Save the PDF to a file
    const filePath = `${name}.pdf`;
    doc.pipe(fs.createWriteStream(filePath));
    doc.end();

    callback(filePath,name,email);
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function sendEmailWithAttachment(filePath,name,email) {
    const sender = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'junkhunt1947@gmail.com',
            pass: process.env.APP_PASSWORD
        }
    });

    // Define the email options
    const mailOptions = {
        from: 'junkhunt1947@gmail.com',
        to: email,
        subject: 'Your JunkHunter Certificate!',
        text: 'Please find the attached certificate below.',
        attachments: [
            {
                filename: `${name}.pdf`,
                path: filePath,
                contentType: 'application/pdf',
            },
        ],
    };

    // Send the email
    sender.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error occurred while sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post("/", (req, res) => {
    const name = req.body.name;
    const email = req.body.email;

    generatePDF(sendEmailWithAttachment,name,email);
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});