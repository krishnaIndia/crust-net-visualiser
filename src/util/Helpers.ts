import userService from "../services/userservice";
import fs from "fs";
import { ConnectionLog, GeoInfo } from "../types/AppTypes";
import crypto from "crypto";
const ipApi = require("ipapi.co");
const config = require("../config/app.json");
const cred = require("../config/cred.json");

const getClientIp = (req: any) => {
    const ip = (req.headers["x-forwarded-for"] || req.connection.remoteAddress || "").split(",")[0].trim();
    return ip.replace("::ffff:", "");
};


const updateIpFile = async () => {
    const ipList = await userService.getDistinctIpList();
    const template = require(config.whitelistIpFile.templatePath);
    template.whitelisted_client_ips = ipList;
    fs.writeFile(config.whitelistIpFile.path + config.whitelistIpFile.filename, JSON.stringify(template), function (error: any) {
        if (error) {
            return console.log(error);
        }
    });
};

const generateLogHash = (log: ConnectionLog): string => {

    const peerData = [log.peer_requester, log.peer_responder];
    peerData.sort((a, b) => {
        const num1 = Number(a.ip.split(".").map((num) => (`000${num}`).slice(-3)).join(""));
        const num2 = Number(b.ip.split(".").map((num) => (`000${num}`).slice(-3)).join(""));
        return num1 - num2;
    });
    const hashData = [peerData, log.tcp_hole_punch_result, log.is_direct_successful];
    const jsonData = JSON.stringify(hashData);
    return crypto.createHmac("sha256", "secret")
        .update(jsonData)
        .digest("hex");
};

const getGeoInfoFromIp = (ip: string): Promise<GeoInfo> => {
    return new Promise((resolve, reject) => {
        const cb = (res: any, error: any) => {
            if (error) reject(error);
            resolve(res);
        };
        ipApi.location(cb, ip, cred.ipApiSecret);
    });
};

export { updateIpFile, getClientIp, generateLogHash, getGeoInfoFromIp };
