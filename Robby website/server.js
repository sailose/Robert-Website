const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors'); 
const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(bodyParser.json());

// Enable CORS
app.use(cors());


// Serve static files
app.use(express.static('.', {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

// Path to bookings JSON file
const bookingsFile = path.join(__dirname, 'bookings.json');

// Initialize bookings file if it doesn't exist
async function initializeBookingsFile() {
    try {
        await fs.access(bookingsFile);
    } catch (error) {
        await fs.writeFile(bookingsFile, JSON.stringify([]));
    }
}

// Get all bookings
app.get('/bookings', async (req, res) => {
    try {
        const data = await fs.readFile(bookingsFile, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading bookings:', error);
        res.status(500).send('Error reading bookings');
    }
});

// Handle scheduling form submission
app.post('/schedule', async (req, res) => {
    const { service, date, time, name, email, message, slot } = req.body;

    // Set up email transporter (example using Gmail)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'FastFireDefense@gmail.com', // Replace with your email
            pass: 'iumx vros iamc xwyp'     // Replace with your app-specific password
        }
    });

    // Email options
    const mailOptions = {
        from: 'FastFireDefense@gmail.com',
        to: email,
        subject: 'Booking Confirmation - Thrive Nutrition Coaching',
        text: `Dear ${name},\n\nYour ${service} session has been scheduled for ${date} at ${time}.\n\nMessage: ${message || 'N/A'}\n\nWe look forward to helping you thrive!\n\nBest,\nThrive Nutrition Coaching`
    };

    // Save booking to file
    try {
        const data = await fs.readFile(bookingsFile, 'utf8');
        const bookings = JSON.parse(data);
        bookings.push({ slot });
        await fs.writeFile(bookingsFile, JSON.stringify(bookings, null, 2));

        // Send email
        await transporter.sendMail(mailOptions);
        res.status(200).send('Booking successful');
    } catch (error) {
        console.error('Error processing booking:', error);
        res.status(500).send('Error processing booking');
    }
});

// Start the server
app.listen(port, async () => {
    await initializeBookingsFile();
    console.log(`Server running at http://localhost:${port}`);
});