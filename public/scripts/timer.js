
// Timer functionality
let timer;
let timeInSeconds = 0;

function startTimer() {
    if (!timer) {
    timer = setInterval(updateTimer, 1000);
    }
}

function clearTimer() {
    clearInterval(timer);
    timer = null;
    timeInSeconds = 0;
    updateDisplay();
}

function setPomodoroTime() {
    timeInSeconds = 25 * 60;
    updateDisplay();
}

function addShortBreak() {
    timeInSeconds = 5 * 60;
    updateDisplay();
}

function addLongBreak() {
    timeInSeconds = 10 * 60;
    updateDisplay();
}

function updateTimer() {
    if (timeInSeconds > 0) {
    timeInSeconds--;
    updateDisplay();
    } else {
    clearInterval(timer);
    timer = null;
    alert('Timer ended. Take a break!');
    setPomodoroTime(); // Reset to Pomodoro time after timer ends
    }
}

function updateDisplay() {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    document.getElementById('display').innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}