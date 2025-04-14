const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const { google } = require('googleapis');
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

// Set up Google Calendar API authentication
let oAuth2Client;
async function initializeGoogleCalendarAuth() {
    try {
        const credentials = JSON.parse(await fs.readFile('credentials.json', 'utf8'));
        const { client_secret, client_id, redirect_uris } = credentials.web;
        oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

        // Load or get the refresh token
        let token;
        try {
            token = JSON.parse(await fs.readFile('token.json', 'utf8'));
            oAuth2Client.setCredentials(token);
        } catch (error) {
            console.log('No token found. You need to authorize the app.');
            const authUrl = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: ['https://www.googleapis.com/auth/calendar'],
            });
            console.log('Authorize this app by visiting this URL:', authUrl);
        }
    } catch (error) {
        console.error('Error initializing Google Calendar auth:', error);
        throw error;
    }
}

// Temporary route to handle OAuth redirect
app.get('/oauth2callback', async (req, res) => {
    const code = req.query.code;
    try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        await fs.writeFile('token.json', JSON.stringify(tokens));
        console.log('Token stored to token.json');
        res.send('Authorization successful! You can close this window.');
    } catch (error) {
        console.error('Error retrieving access token:', error);
        res.status(500).send('Error during authorization.');
    }
});

// Function to add an event to Google Calendar
async function addToGoogleCalendar(bookingDetails) {
    if (!oAuth2Client) {
        throw new Error('Google Calendar API not initialized. Please authorize the app first.');
    }

    const { name, date, time, email } = bookingDetails;
    
// Validate date and time
if (typeof date !== 'string' || !date.includes(', ')) {
    console.error('Invalid date format:', date);
    throw new Error('Invalid date format. Expected format: "DAY, MONTH DD" (e.g., "SATURDAY, APRIL 12")');
}
if (typeof time !== 'string' || !time.includes(' ')) {
    console.error('Invalid time format:', time);
    throw new Error('Invalid time format. Expected format: "HH:MM AM/PM" (e.g., "10:00 AM")');
}
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    // Parse the date and time (e.g., "SATURDAY, APRIL 12" and "10:00 AM")
    const [dayOfWeek, monthDayYear] = date.split(', ');
    const [month, day] = monthDayYear.split(' ');
    const year = "2025"; // Assuming the year based on the screenshot; adjust as needed
    const [hourMinute, period] = time.split(' ');
    let [hour, minute] = hourMinute.split(':').map(Number);

    // Convert to 24-hour format
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    // Create start and end dates (assume 1-hour duration)
    const eventDate = new Date(`${month} ${day}, ${year} ${hour}:${minute}:00`);
    const eventEnd = new Date(eventDate.getTime() + 60 * 60 * 1000); // 1 hour later

    const event = {
        summary: `MD CCW Class Booking - ${name}`,
        location: '5770 Smallwood Church Rd, Indian Head, MD 20640',
        description: `Booking for ${name}. Email: ${email}`,
        start: {
            dateTime: eventDate.toISOString(),
            timeZone: 'America/New_York',
        },
        end: {
            dateTime: eventEnd.toISOString(),
            timeZone: 'America/New_York',
        },
    };

    try {
        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
        });
        console.log('Event created:', response.data.htmlLink);
    } catch (error) {
        console.error('Error creating event:', error);
        throw error;
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

    if (!date || !time || !name || !email) {
        console.error('Missing required fields:', { date, time, name, email });
        return res.status(400).send('Missing required fields: date, time, name, and email are required.');
    }

    // Set up email transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'FastFireDefense@gmail.com',
            pass: 'iumx vros iamc xwyp'
        }
    });

    const address = "5770 Smallwood Church Rd, Indian Head, MD 20640";
    const encodedAddress = encodeURIComponent(address);
    const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

    // Email options
    const mailOptions = {
        from: 'FastFireDefense@gmail.com',
        to: email,
        subject: 'Booking Confirmation',
        html: `
            <h2>Booking Confirmation</h2>
            <p>Dear ${name},</p>
            <p>Thank you for choosing Fast Fire Defense for your ${service} session.</p>
            <p>Your session will take place on ${date} at ${time}.</p>
            <p>Message: ${message || 'N/A'}</p>
            <p>We are located at: <a href="${googleMapsLink}" target="_blank">${address}</a></p>
            <p>Looking forward to your session!</p>
            <p>Best regards,</p>
            <p>Fast Fire Defense Team</p>
        `,
    };

    // Save booking to file and send email
    try {
        const data = await fs.readFile(bookingsFile, 'utf8');
        const bookings = JSON.parse(data);
        bookings.push({ slot });
        await fs.writeFile(bookingsFile, JSON.stringify(bookings, null, 2));

        // Send email
        await transporter.sendMail(mailOptions);

        // Add to Google Calendar
        const bookingDetails = { name, date, time, email };
        await addToGoogleCalendar(bookingDetails);

        res.status(200).send('Booking successful');
    } catch (error) {
        console.error('Error processing booking:', error);
        res.status(500).send('Error processing booking');
    }
});

// Start the server
app.listen(port, async () => {
    await initializeBookingsFile();
    await initializeGoogleCalendarAuth();
    console.log(`Server running at http://localhost:${port}`);
});