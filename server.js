const express = require('express');
const nodemailer = require('nodemailer');
const fs = require('fs');
const cors = require('cors'); // Add this line


const app = express();
const port = 3000;

app.use(cors()); // Enable CORS for all routes
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // Ensure JSON body parsing is enabled

// Route for the root URL
app.get('/', (req, res) => {
    res.send('Welcome to the Fast Fire Defense backend server!');
});

// Route for handling the contact form submission
app.post('/submit-form', (req, res) => {
    const { name, email, message } = req.body;

    // Send email using Nodemailer
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'FastFireDefense@gmail.com',
            pass: 'iumx vros iamc xwyp',
        },
    });

    const mailOptions = {
        from: email,
        to: 'FastFireDefense@gmail.com',
        subject: 'New Contact Form Submission',
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            res.status(500).json({ success: false, message: 'Error sending email' });
        } else {
            console.log('Email sent successfully:', info.response);
            res.json({ success: true, message: 'Email sent successfully' });
        }
    });
});

// Route for serving the contact.html file
app.get('/contact.html', (req, res) => {
    const filePath = './Robby website/contact.html';
    fs.readFile(filePath, (error, data) => {
        if (error) {
            console.error('Error reading file:', error);
            res.status(500).send('Error reading file');
        } else {
            res.send(data.toString());
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

