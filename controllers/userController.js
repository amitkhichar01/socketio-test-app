import User from "../models/user.js";
import Message from "../models/message.js";

export const registerUser = async (req, res) => {
    res.render("registerUser.ejs");
};

export const addUser = async (req, res) => {
    const { username } = req.body;

    try {
        let user = await User.findOne({ username });

        if (!user) {
            let newUser = await User.create({ username });
            return res.redirect(`/${username}`);
        }

        res.redirect(`/${username}`);
    } catch (error) {
        console.error("Error adding user", error);
        res.status(500).send("Internal server error");
    }
};

export const getUserChat = async (req, res) => {
    const { username } = req.params;

    try {
        let user = await User.findOne({ username }).populate({
            path: "friends",
            select: "username",
        });

        if (!user) {
            return res.status(404).send("User does not exist");
        }

        // Fetch sent and received messages
        const [sentMessages, receivedMessages] = await Promise.all([
            Message.find({ senderId: user._id }).populate("senderId", "username").populate("receiverId", "username").exec(),
            Message.find({ receiverId: user._id }).populate("senderId", "username").populate("receiverId", "username").exec(),
        ]);

        const messages = [...sentMessages, ...receivedMessages];

        res.render("main.ejs", {
            user: user,
            messages: messages || [],
        });
    } catch (error) {
        console.error("Error fetching user or messages:", error);
        res.status(500).send("Internal server error");
    }
};
