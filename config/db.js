import mongoose from "mongoose";

const connectDb = async () => {
    await mongoose
        .connect(process.env.DATABASE_URL)
        .then(() => {
            console.log("Connected to DataBase");
        })
        .catch((err) => console.log(err));
};

export default connectDb;
