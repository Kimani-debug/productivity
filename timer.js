let count = 60; // Initial time in seconds
const timerDisplay = document.getElementById('timer');
const startButton = document.getElementById('start_button').addEventListener('click', countdown.startButton);
// Function to update the display and manage the countdown
const countdown = setInterval(function() {
    count--;
    timerDisplay.textContent = count;

    if (count <= 0) {
        clearInterval(countdown); // Stop the timer when it reaches 0
        timerDisplay.textContent = "Time's up!"; // Optional: Display a message
    }
}, 1000); // Update every 1000ms (1 second)