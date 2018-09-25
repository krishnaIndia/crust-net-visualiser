import mongoose from "mongoose";

const ConnectionLogSchema = new mongoose.Schema({
    NatTraversal: {
        Result: Boolean,
        Time_Spent: Number
    },
    Peer: {
        IP: String,
        NAT_Type: String,
        OS: String
    },
    NatType: {
        EIM: Boolean,
        EDM: Boolean
    },
    ConnectionId: {
        type: String,
        unique: true
    }
});

const ConnectionLog = mongoose.model("ConnectionLog", ConnectionLogSchema);

export default ConnectionLog;