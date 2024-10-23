const socket = io();

const form = document.getElementById("form");
const receiverInput = document.getElementById("receiverInput");
const msgInput = document.getElementById("msgInput");
const messages = document.getElementById("messages");

// Helper function to create a message element
const addMessageElement = (messageData, sender, position) => {
    const li = document.createElement("li");
    li.classList.add(position);

    // Determine the message sender's name
    const userName = position === "right" ? "You" : sender;

    // Create message content
    const messageContent = document.createElement("span");
    messageContent.innerText = `${userName}: ${messageData.message}`;

    // Create time element
    const timeContainer = document.createElement("small");
    timeContainer.classList.add("time_container");
    const timeString = new Date(messageData.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
    timeContainer.innerText = timeString;

    // Append message content and time to the message element
    li.appendChild(messageContent);
    li.appendChild(timeContainer);

    // Append message element to the messages container
    messages.appendChild(li);
};

// Handle form submission
const handleFormSubmit = (event) => {
    event.preventDefault();

    const message = msgInput.value.trim();
    const receiver = receiverInput.value.trim();

    if (message && receiver) {
        socket.emit("private_message", { sender: user, receiver, message });
        msgInput.value = "";
        receiverInput.value = "";
    }
};

// Set up event listeners for form submission
form.addEventListener("submit", handleFormSubmit);

// Join the chat with the current user
socket.emit("join", { user });

// Handle incoming messages from the server
socket.on("server_message", (Message, sender) => {
    addMessageElement(Message, sender, "left");
});

socket.on("add_element", (Message, sender) => {
    addMessageElement(Message, sender, "right");
});

socket.on("error_message", (error) => {
    console.error(`Server error: ${error}`);
    alert(error);
});

socket.on("disconnect", () => {
    console.log("Disconnected from the server");
});
