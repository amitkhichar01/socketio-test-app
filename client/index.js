const socket = io("http://localhost:4000");
const user = prompt("Enter your name") || "Anonymous"; 

const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");

// Function to add a new message element
const addMessageElement = (message, user, position) => {
    const li = document.createElement("li");
    li.innerText = `${user}: ${message}`;
    li.classList.add(position);
    messages.appendChild(li);
};

const handleFormSubmit = (event) => {
    event.preventDefault();
    const message = input.value.trim(); 
    if (message) {
        socket.emit("chat message", message, user);
        addMessageElement(message, user, "right");
        input.value = "";
    }
};

// Set up event listeners
form.addEventListener("submit", handleFormSubmit);

// Listen for messages from the server
socket.on("server-message", (message, user) => {
    console.log(`Received from Server: ${message}`);
    addMessageElement(message, user, "left");
});

socket.on("disconnect", () => {
    console.log("Disconnected from the server");
});
