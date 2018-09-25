import NetworkUser from "../models/NetworkUser";
import ConnectionLog from "../models/ConnectionLog";
import fs from "fs";

const config = require("../config/app.json");

export default class DBUtils {

    public async saveNetworkUser(networkuser: string) {
        try {
            const JsonObj = JSON.parse(networkuser);
            const query = { "userid": JsonObj.userid };
            const options = { upsert: true, new: true, setDefaultsOnInsert: true };
            const newvalues = {
                $set: {
                    username: JsonObj.username,
                    email: JsonObj.email,
                    ip: JsonObj.ip,
                    trustLevel: JsonObj.trustLevel,
                    strategy: JsonObj.strategy,
                }
            };
            NetworkUser.findOneAndUpdate(query, newvalues, options, (err, doc) => {
                if (err) {
                    console.log(err);
                } else {
                    this.updateIPFile();
                    console.log("updated");
                }
            }
            );
            console.log("Done!");
        } catch (e) {
            console.log(e);
        }
    }


    public async updateIPFile() {
        try {
            const query = NetworkUser.find({}).distinct("ip");
            query.exec(function (err, values) {
                const template = require(config.whitelistIpFile.templatePath);
                template.whitelistIps = values;
                fs.writeFile(config.whitelistIpFile.path + config.whitelistIpFile.filename, JSON.stringify(template), function (error: any) {
                    if (error) {
                        return console.log(error);
                    }
                    console.log("The file was saved!");
                });
            });
            console.log("IP file updated!");
        } catch (e) {
            console.log(e);
        }
    }

    public async saveConnectionLog(connectionlog: string) {
        try {
            await ConnectionLog.insertMany(JSON.parse(connectionlog));
            console.log("Log Saved!");
        } catch (e) {
            console.log(e);
        }
    }

    public async getConnectionLogs() {
        try {
            await ConnectionLog.find({}, function (err, logs) {
                if (err) {
                    return "error";
                } else {
                    return logs;
                }
            });
        } catch (e) {
            console.log(e);
        }
    }
}