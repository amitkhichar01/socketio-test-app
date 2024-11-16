// Establish Socket.IO connection
const socket = io();

// Emit join event with user info
socket.emit("join", currentUser);

//DOM Element Selection
const addFriendBtn = document.getElementById("add-friend-btn");
const joinGroupBtn = document.getElementById("join-group-btn");
const createGroupBtn = document.getElementById("create-group-btn");

const addFriendForm = document.getElementById("add-friend-form");
const JoinGroupForm = document.getElementById("join-group-form");
const CreateGroupForm = document.getElementById("create-group-form");

const addFriendCloseBtn = document.getElementById("add-friend-close-btn");
const joinGroupCloseBtn = document.getElementById("join-group-close-btn");
const createGroupCloseBtn = document.getElementById("create-group-close-btn");

const addFriendSubmitBtn = document.getElementById("add-friend-submit-btn");
const joinGroupSubmitBtn = document.getElementById("join-group-submit-btn");
const createGroupSubmitBtn = document.getElementById("create-group-submit-btn");

const addFriendInput = document.getElementById("add-friend-input");
const joinGroupInput = document.getElementById("join-group-input");
const createGroupInput = document.getElementById("create-group-input");

const friendContainer = document.getElementById("friend-container");
const chatFriendName = document.getElementById("chat-friend-name");
const msgContainer = document.getElementById("msg-container");
const msgMainContainer = document.getElementById("msg-main-container");
const helperContainer = document.getElementById("helper-container");
const msgInputField = document.getElementById("msg-input-field");
const sendMsgBtn = document.getElementById("send-msg-btn");

let receiverUserName; // Store the selected friend to chat with
let isGroup = false;

// Event Listeners
addFriendBtn.addEventListener("click", () => showForm(addFriendForm));
joinGroupBtn.addEventListener("click", () => showForm(JoinGroupForm));
createGroupBtn.addEventListener("click", () => showForm(CreateGroupForm));

addFriendCloseBtn.addEventListener("click", () => hideForm(addFriendForm));
joinGroupCloseBtn.addEventListener("click", () => hideForm(JoinGroupForm));
createGroupCloseBtn.addEventListener("click", () => hideForm(CreateGroupForm));

addFriendSubmitBtn.addEventListener("click", submitAddFriendForm);
joinGroupSubmitBtn.addEventListener("click", submitJoinGroupForm);
createGroupSubmitBtn.addEventListener("click", submitCreateGroupForm);

document.addEventListener("click", outsideClickHandler);
friendContainer.addEventListener("click", friendSelectHandler);
sendMsgBtn.addEventListener("click", sendMessage);

// Socket Event Listeners

// Handle server errors and disconnections
socket.on("errorMessage", handleError);
socket.on("disconnect", handleDisconnect);

socket.on("userAdded", addUserToList);
socket.on("serverMessage", displayIncomingMessage);
socket.on("addElement", displaySentMessage);
socket.on("groupCreated", (msg) => {
    let isGroup = true;
    addUserToList(msg, isGroup);
});
socket.on("groupJoined", (msg) => {
    let isGroup = true;
    addUserToList(msg, isGroup);
});
socket.on("newUserJoined", (message) => alert(message));
socket.on("serverGroupMessage", displayGroupMessage);

// Event Handler Functions
function handleError(error) {
    console.error(`Server error: ${error}`);
    alert(error);
}

function handleDisconnect() {
    console.log("Disconnected from the server");
}

function showForm(element) {
    element.classList.remove("hidden");
}

function hideForm(element) {
    element.classList.add("hidden");
}

function submitAddFriendForm(event) {
    event.preventDefault();
    const username = addFriendInput.value.trim();
    if (username) {
        socket.emit("checkUser", { currentUser, username });
        addFriendInput.value = "";
    }
}

function submitJoinGroupForm(event) {
    event.preventDefault();
    const groupName = joinGroupInput.value.trim();
    if (groupName) {
        socket.emit("joinGroup", { groupName });
        joinGroupInput.value = "";
    }
}

function submitCreateGroupForm(event) {
    event.preventDefault();
    const groupName = createGroupInput.value.trim();
    if (groupName) {
        socket.emit("createGroup", { groupName });
        createGroupInput.value = "";
    }
}

function outsideClickHandler(event) {
    if (event.target == addFriendForm) {
        hideForm(addFriendForm);
    }

    if (event.target == JoinGroupForm) {
        hideForm(JoinGroupForm);
    }

    if (event.target == CreateGroupForm) {
        hideForm(CreateGroupForm);
    }
}

function friendSelectHandler(event) {
    if (event.target.tagName === "LI") {
        if (event.target.dataset.isGroup === "true") {
            isGroup = true;
        } else {
            isGroup = false;
        }
        receiverUserName = event.target.innerText;
        chatFriendName.innerText = receiverUserName;
        msgMainContainer.classList.remove("hidden");
        helperContainer.classList.add("hidden");
        loadChatMessage(receiverUserName);
    }
}

function sendMessage() {
    const message = msgInputField.value.trim();
    if (message && receiverUserName) {
        if (isGroup) {
            socket.emit("groupMessage", { groupName: receiverUserName, message, currentUser });
        } else {
            socket.emit("privateMessage", { sender: currentUser, receiver: receiverUserName, message });
        }
        msgInputField.value = "";
    }
}

//Utility Functions
function addUserToList(msg, isGroup = false) {
    const li = document.createElement("li");
    li.innerText = msg;
    li.classList.add("p-2", "cursor-pointer", "bg-[#4f4f4f]", "hover:bg-[#3f3f3f]", "rounded", "m-1");
    li.dataset.isGroup = isGroup;
    friendContainer.appendChild(li);
}

function loadChatMessage(friendName) {
    const chatMessages = messages.filter(
        (message) =>
            (message.senderId.username === currentUser && message.receiverId.username === friendName) || (message.senderId.username === friendName && message.receiverId.username === currentUser)
    );

    const sortedMessages = chatMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    msgContainer.innerHTML = ""; // Clear previous messages
    sortedMessages.forEach((msg) => displayMessage(msg, msg.senderId.username === currentUser));
}

function displayMessage(message, isSent) {
    const p = document.createElement("p");
    const small = document.createElement("small");
    p.innerText = message.message;
    small.innerText = formatMessageTime(message.createdAt);
    small.classList.add("pl-4", "text-end");
    p.classList.add("p-2", "my-2", "rounded", "max-w-max", "word-wrap", isSent ? "bg-[#dcf8c6]" : "bg-[#ffffff]", isSent && "ml-auto");
    p.appendChild(small);
    msgContainer.appendChild(p);
}

function displayGroupMessage(data) {
    const { message, user, timestamp } = data;
    const isSent = user === currentUser;
    displayMessage({ message, createdAt: timestamp }, isSent);
}

function formatMessageTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
}

function displayIncomingMessage(message, sender) {
    displayMessage(message, false);
}

function displaySentMessage(message) {
    displayMessage(message, true);
}
