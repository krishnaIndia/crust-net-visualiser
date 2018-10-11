import { Document, Schema, Model, model } from "mongoose";
import { ConnectionLog } from "../types/AppTypes";

export interface IConnectionLog extends ConnectionLog, Document {
}

export const ConnectionLogSchema = new Schema({
    peer_requester: Object,
    peer_responder: Object,
    is_direct_successful: Boolean,
    utp_hole_punch_result: Object,
    tcp_hole_punch_result: Object,
    udp_hole_punch_result: Object,
    logDataHash: String,
    isHairpinned: Boolean,
    createdAt: Date
});

ConnectionLogSchema.pre("validate", function (next) {
    const now = new Date();
    if (!this.createdAt) {
        this.createdAt = now;
    }
    next();
});

const ConnectionLogModel: Model<IConnectionLog> = model<IConnectionLog>("ConnectionLog", ConnectionLogSchema);

export default ConnectionLogModel;
