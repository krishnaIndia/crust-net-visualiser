import { Document, Schema, Model, model} from "mongoose";
import { User } from "./../types/AppTypes";

interface IUser extends User, Document {};

const UserSchema: Schema = new Schema({
    userId: String,
    userName: String,
    email: String,
    stratergy: String,
    trustLevel: Number,
    ip: String,
    createdAt: Date
});

UserSchema.pre("save", function(next: Function) {
    const now = new Date();
    if (!this.createdAt) {
      this.createdAt = now;
    }
    next();
});

const UserModel: Model<IUser> = model<IUser>("user", UserSchema);
class UserService {

    public upsert(user: User): Promise<void> {
        return new Promise((resolve, reject) => {
            const opts = { upsert: true, new: true, setDefaultsOnInsert: true };
            UserModel.findOneAndUpdate({userId: user.userId}, user, opts, (err: Error) => {
                err ? reject(err) : resolve();
            });
        });
    }

    public list(): Promise<Array<User>> {
        return new Promise((resolve, reject) => {
            UserModel.find({}, (err: Error, list: Array<User>) => err ? reject(err) : resolve(list));
        });
    }

    
    public getDistinctIpList(): Promise<Array<string>> {
        return new Promise((resolve, reject) => {
            const query = UserModel.find({}).distinct("ip");
            query.exec(((err: Error, list: Array<string>) => err ? reject(err) : resolve(list)));
        });
    }
}

const userService = new UserService;
export default userService;
