import { Document, Schema, Model, model} from "mongoose";
import { ConnectionLog } from "./../types/Apptypes";

export interface IConnectionLog extends ConnectionLog, Document {
}

export const ConnectionLogSchema: Schema = new Schema({
    peer_requester: Object,
    peer_responder: Object,
    is_direct_successful: Boolean,
    utp_hole_punch_result: Object,
    tcp_hole_punch_result: Object,
    createdAt: Date
});

ConnectionLogSchema.pre("save", function(next: Function) {
    const now = new Date();
    if (!this.createdAt) {
      this.createdAt = now;
    }
    next();
});

const ConnectionLogModel: Model<IConnectionLog> = model<IConnectionLog>("ConnectionLog", ConnectionLogSchema);
class ConnectionLogService {
    insert(log: ConnectionLog): Promise<void> {
        return new Promise((resolve, reject) => {
            ConnectionLogModel.insertMany([log], (err: Error) => err ? reject(err) : resolve());
        });
    }

    list(): Promise<Array<ConnectionLog>> {
        return new Promise((resolve, reject) => {
            ConnectionLogModel.find({}, (err: Error, logs: Array<ConnectionLog>) => err ? reject(err) : resolve(logs));
        });
    }
}

const connectionLogService = new ConnectionLogService;
export default connectionLogService;
