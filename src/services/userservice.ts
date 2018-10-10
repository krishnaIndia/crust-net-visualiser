import { User } from "../types/AppTypes";

import UserModel from "../models/User";

class UserService {

    public upsert(user: User): Promise<void> {
        return new Promise((resolve, reject) => {
            const opts = { upsert: true, new: true, setDefaultsOnInsert: true };
            UserModel.findOneAndUpdate({ userId: user.userId }, user, opts, (err: Error) => {
                err ? reject(err) : resolve();
            });
        });
    }

    public list(): Promise<Array<User>> {
        return new Promise((resolve, reject) => {
            UserModel.find({}, (err: Error, list: Array<User>) => err ? reject(err) : resolve(list));
        });
    }

    public findbyId(userId: string): Promise<User> {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ userId: userId }, (err: Error, user: User) => err ? reject(err) : resolve(user));
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
