document.addEventListener('DOMContentLoaded', () => {
    const calendar = document.getElementById('calendar');
    const submitBtn = document.getElementById('submit-btn');
    const popup = document.getElementById('popup');
    const closePopup = document.getElementById('close-popup');
    let selectedDate = null;
    let selectedTime = null;
    let selectedSlot = null;

    // Backend URL
    const backendUrl = 'http://localhost:3000';

    // Fetch bookings from the server
    async function fetchBookings() {
        try {
            const response = await fetch(`${backendUrl}/bookings`);
            const bookings = await response.json();
            return bookings;
        } catch (error) {
            console.error('Error fetching bookings:', error);
            return [];
        }
    }

    // Available time slots for each day
    const timeSlots = [
        '10:00 AM', '11:00 AM', '12:00 PM',
        '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM',
    ];

    // New function to generate only the upcoming Saturday and Sunday
    function generateWeekendDates() {
        const today = new Date();
        const dates = [];
        let currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        let daysUntilSaturday = (6 - currentDay + 7) % 7; // Days until the next Saturday
        if (daysUntilSaturday === 0) {
            daysUntilSaturday = 7; // If today is Saturday, get the next Saturday
        }

        // Calculate the next Saturday
        const saturday = new Date(today);
        saturday.setDate(today.getDate() + daysUntilSaturday);
        dates.push(saturday);

        // Calculate the next Sunday (1 day after Saturday)
        const sunday = new Date(saturday);
        sunday.setDate(saturday.getDate() + 1);
        dates.push(sunday);

        return dates;
    }

    // Format date as "Day, Month Date" (e.g., "Friday, August 8")
    function formatDate(date) {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    }

    // Format date as "YYYY-MM-DD" for data attributes
    function formatDateForData(date) {
        return date.toISOString().split('T')[0];
    }

    // Render the calendar
    async function renderCalendar() {
        calendar.innerHTML = '';
        const dates = generateWeekendDates();
        const bookings = await fetchBookings();
        console.log('Fetched bookings:', bookings); // Debug log
    
        dates.forEach(date => {
            const dateSection = document.createElement('div');
            dateSection.classList.add('date-section');
    
            const dateHeader = document.createElement('h3');
            dateHeader.textContent = formatDate(date);
            dateSection.appendChild(dateHeader);
    
            const timesContainer = document.createElement('div');
            timesContainer.classList.add('times');
    
            const dateString = formatDateForData(date);
            const formattedDate = date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
            }).toUpperCase();
    
            timeSlots.forEach(time => {
                const slotKey = `${formattedDate} ${time}`;
                console.log('Checking slotKey:', slotKey); // Debug log
                const isBooked = bookings.some(booking => {
                    console.log('Comparing with booking.slot:', booking.slot); // Debug log
                    return booking.slot === slotKey;
                });
    
                const timeButton = document.createElement('button');
                timeButton.classList.add('time-slot');
                if (isBooked) {
                    timeButton.classList.add('booked');
                    timeButton.disabled = true;
                } else {
                    timeButton.classList.add('available');
                }
                timeButton.dataset.date = dateString;
                timeButton.dataset.time = time;
                timeButton.textContent = time;
    
                timeButton.addEventListener('click', () => {
                    if (!timeButton.classList.contains('booked')) {
                        document.querySelectorAll('.time-slot').forEach(slot => {
                            slot.classList.remove('selected');
                        });
                        timeButton.classList.add('selected');
                        selectedSlot = { date: dateString, time };
                        console.log('Selected slot:', selectedSlot);
                    }
                });
    
                timesContainer.appendChild(timeButton);
            });
    
            dateSection.appendChild(timesContainer);
            calendar.appendChild(dateSection);
        });
    }
    // Handle form submission
    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        if (!selectedSlot) {
            alert('Please select a time slot.');
            return;
        }

        const service = document.getElementById('service').value;
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        if (!name || !email) {
            alert('Please fill in all required fields.');
            return;
        }

        // Step 4.1: Add stricter validation and convert date format
        if (!selectedSlot.date || !selectedSlot.time || typeof selectedSlot.date !== 'string' || typeof selectedSlot.time !== 'string') {
            alert('Please select a valid date and time.');
            return;
        }

        // Convert date from "YYYY-MM-DD" to "DAY, MONTH DD"
        const dateObj = new Date(selectedSlot.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        }).toUpperCase(); // e.g., "SATURDAY, APRIL 12"

        const bookingData = {
            service,
            date: formattedDate,
            time: selectedSlot.time,
            name,
            email,
            message,
            slot: `${formattedDate} ${selectedSlot.time}`
        };

        console.log('Submitting booking with details:', bookingData); // Step 4.2: Debug logging

        try {
            const response = await fetch(`${backendUrl}/schedule`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingData)
            });

            if (response.ok) {
                popup.style.display = 'flex';
                await renderCalendar();
                selectedSlot = null;
                document.getElementById('service').value = 'Fire Fire Defense Team';
                document.getElementById('name').value = '';
                document.getElementById('email').value = '';
                document.getElementById('message').value = '';
            } else {
                alert('Error scheduling your session. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting booking:', error);
            alert('Error scheduling your session. Please try again.');
        }
    });

    // Close popup
    closePopup.addEventListener('click', () => {
        popup.style.display = 'none';
    });

    // Initialize the calendar
    renderCalendar();
});