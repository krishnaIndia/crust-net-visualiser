import { ConnectionLog, PaginateResponse, GeoFetchError, ReservedIp, GeoInfo } from "../types/AppTypes";

import ConnectionLogModel from "../models/ConnectionLog";

class ConnectionLogService {
    ignoreFields: string = "-peer_requester.ip -peer_responder.ip " +
        "-peer_requester.geo_info.region -peer_requester.geo_info.region_code -peer_requester.geo_info.country " +
        "-peer_requester.geo_info.postal -peer_requester.geo_info.timezone -peer_requester.geo_info.longitude -peer_requester.geo_info.utc_offset " +
        "-peer_requester.geo_info.latitude -peer_requester.geo_info.languages -peer_requester.geo_info.org -peer_requester.geo_info.ip -peer_requester.geo_info.city " +
        "-peer_requester.geo_info.in_eu -peer_requester.geo_info.asn -peer_requester.geo_info.country_calling_code -peer_requester.geo_info.currency " +
        "-peer_requester.geo_info.continent_code -peer_responder.geo_info.continent_code " +
        "-peer_responder.geo_info.postal -peer_responder.geo_info.timezone -peer_responder.geo_info.longitude -peer_responder.geo_info.utc_offset " +
        "-peer_responder.geo_info.latitude -peer_responder.geo_info.languages -peer_responder.geo_info.org -peer_responder.geo_info.ip -peer_responder.geo_info.city " +
        "-peer_responder.geo_info.region -peer_responder.geo_info.region_code -peer_responder.geo_info.country " +
        "-peer_responder.geo_info.in_eu -peer_responder.geo_info.asn -peer_responder.geo_info.country_calling_code -peer_responder.geo_info.currency ";

    isHairpinnedCondition: any = { "isHairpinned": { "$in": ["false", false] } };

    projectOptions: any = { _id: 0, __v: 0 };

    insert(log: ConnectionLog): Promise<void> {
        return new Promise((resolve, reject) => {
            ConnectionLogModel.insertMany([log], (err: Error) => err ? reject(err) : resolve());
        });
    }

    list(): Promise<Array<ConnectionLog>> {
        return new Promise((resolve, reject) => {
            ConnectionLogModel.find(this.isHairpinnedCondition, this.projectOptions, (err: Error, logs: Array<ConnectionLog> = new Array) => {
                if (err) return reject(err);

                logs.forEach((log) => {
                    log = this.finalizeLogItem(log);
                });

                resolve(logs);
            })
                .sort("-createdAt")
                .select(this.ignoreFields);
        });
    }

    listBetweenDates(startDate: Date, endDate: Date): Promise<Array<ConnectionLog>> {
        return new Promise((resolve, reject) => {
            ConnectionLogModel.find({ "createdAt": { "$gte": startDate, "$lt": endDate }, "isHairpinned": { "$in": ["false", false] } },
                this.projectOptions, (err: Error, logs: Array<ConnectionLog> = new Array) => {
                    if (err) return reject(err);

                    logs.forEach((log) => {
                        log = this.finalizeLogItem(log);
                    });

                    resolve(logs);
                })
                .sort("-createdAt")
                .select(this.ignoreFields);
        });
    }

    paginate(size: number, pageNo: number): Promise<PaginateResponse> {
        const getCount = (size: number) => new Promise<number>((resolve, reject) => {
            ConnectionLogModel.count(this.isHairpinnedCondition, (err, totalCount) => err ? reject(err) : resolve(Math.ceil(totalCount / size)));
        });

        const getData = (query: any) => new Promise<Array<ConnectionLog>>((resolve, reject) => {
            ConnectionLogModel.find(this.isHairpinnedCondition, this.projectOptions, query, (err: Error, data: Array<ConnectionLog> = new Array) => {
                if (err) {
                    return reject(err);
                } else {

                    data.forEach((item) => {
                        item = this.finalizeLogItem(item);
                    });

                    resolve(data);
                }
            }).select(this.ignoreFields);
        });

        return new Promise(async (resolve, reject) => {
            try {
                const query = {
                    skip: size * (pageNo - 1),
                    limit: size
                };
                const totalPages: number = await getCount(size);
                const logs = await getData(query);

                resolve({
                    logs,
                    totalPages
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    getPossibleDuplicate(log: ConnectionLog): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            ConnectionLogModel.count({ "logDataHash": log.logDataHash }, function (err, c) {
                if (err) return reject(err);
                c > 0 ? resolve(true) : resolve(false);
            });
        });
    }

    finalizeLogItem(log: ConnectionLog): ConnectionLog {
        if (typeof log.peer_requester.nat_type === "object") {
            log.peer_requester.nat_type = "EDM_RANDOM";
        }
        if (typeof log.peer_responder.nat_type === "object") {
            log.peer_responder.nat_type = "EDM_RANDOM";
        }

        if (this.instanceOfReservedIp(log.peer_requester.geo_info) || this.instanceOfGeoFetchError(log.peer_requester.geo_info)) {
            log.peer_requester.geo_info = {
                "country_name": "NA"
            } as GeoInfo;
        }

        if (this.instanceOfReservedIp(log.peer_responder.geo_info) || this.instanceOfGeoFetchError(log.peer_responder.geo_info)) {
            log.peer_responder.geo_info = {
                "country_name": "NA"
            } as GeoInfo;
        }

        log.logDataHash = log.logDataHash.substr(0, 6);
        return log;
    }

    instanceOfGeoFetchError(object: any): object is GeoFetchError {
        return "error" in object;
    }

    instanceOfReservedIp(object: any): object is ReservedIp {
        return "reserved" in object;
    }
}

const connectionLogService = new ConnectionLogService;
export default connectionLogService;
