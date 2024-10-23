import User from "../models/user.js";
import Message from "../models/message.js";

export const getUserChat = async (req, res) => {
    const { username } = req.params;

    try {
        let user = await User.findOne({ username });

        // If user does not exist, create a new user
        if (!user) {
            user = new User({ username });
            await user.save();
            return res.render("main.ejs", { user: user.username, messages: [] });
        }

        // Fetch sent and received messages
        const sentMessages = await Message.find({ senderId: user._id });
        const receivedMessages = await Message.find({ receiverId: user._id }).populate("senderId", "username").exec();

        // Combine sent and received messages, flagging each accordingly
        const messages = [...sentMessages.map((msg) => ({ ...msg._doc, isSent: true })), ...receivedMessages.map((msg) => ({ ...msg._doc, isSent: false }))];

        // Sort messages by their creation time
        messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        // Render the main.ejs template with user and messages
        res.render("main.ejs", {
            user: username,
            messages,
        });
    } catch (error) {
        console.error("Error fetching user or messages:", error);
        res.status(500).send("Internal server error");
    }
};
