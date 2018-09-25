import mongoose from "mongoose";

const NetworkUserSchema = new mongoose.Schema({
    username: String,
    userid: {
        type: Number,
        unique: true
    },
    email: String,
    ip: String,
    trustLevel: String,
    strategy: String,
});

const NetworkUser = mongoose.model("NetworkUser", NetworkUserSchema);

export default NetworkUser;