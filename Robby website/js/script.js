// Form submission handler
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();  // Prevent page reload on submit

  // Get form data
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;

  if(name && email && message) {
      alert(`Thank you for contacting us, ${name}. We will respond to ${email} soon.`);
      // Here you could add an AJAX request to submit the data to a server
      // For now, we just clear the form
      document.getElementById('contactForm').reset();
  } else {
      alert("Please fill in all fields.");
  }
});

// "Return to Home" button handler
function goHome() {
  window.location.href = "index.html";  // Replace "index.html" with your homepage URL
}