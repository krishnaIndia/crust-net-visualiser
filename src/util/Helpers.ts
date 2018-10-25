import userService from "../services/userservice";
import fs from "fs";
import { ConnectionLog, IpGeoInfo } from "../types/AppTypes";
import crypto from "crypto";
import geoInfoService from "../services/geoinfoservice";
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

    const peerData = [Object.assign({}, log.peer_requester), Object.assign({}, log.peer_responder)];
    peerData.sort((a, b) => {
        const num1 = Number(a.ip.split(".").map((num) => (`000${num}`).slice(-3)).join(""));
        const num2 = Number(b.ip.split(".").map((num) => (`000${num}`).slice(-3)).join(""));
        return num1 - num2;
    });
    peerData.forEach(peerInfo => {
        if (typeof peerInfo.nat_type === "object") {
            peerInfo.nat_type = "EDM_RANDOM";
        }
        delete peerInfo.id;
        delete peerInfo.name;
    });
    const hashData = [peerData, log.tcp_hole_punch_result, log.udp_hole_punch_result, log.is_direct_successful];
    const jsonData = JSON.stringify(hashData);
    return crypto.createHmac("sha256", "secret")
        .update(jsonData)
        .digest("hex");
};

const getGeoInfoFromIp = (ip: string): Promise<any> => {

    const getGeoDataFromService = (ip: string) => new Promise<IpGeoInfo>((resolve, reject) => {
        const cb = async (res: any, error: any) => {
            if (error) return reject(error);
            try {
                await geoInfoService.insert({ "ip": ip, "geo_info": res });
                resolve({ "ip": ip, "geo_info": res });
            }
            catch (e) {
                reject(e);
            }
        };
        ipApi.location(cb, ip, cred.ipApiSecret);
    });

    return new Promise(async (resolve, reject) => {
        try {
            const geoInfo = await geoInfoService.getPossibleDuplicate(ip);
            if (geoInfo) {
                resolve(geoInfo.geo_info);
            } else {
                const info = await getGeoDataFromService(ip);
                resolve(info.geo_info);
            }
        } catch (e) {
            reject(e);
        }
    });
};

export { updateIpFile, getClientIp, generateLogHash, getGeoInfoFromIp };
