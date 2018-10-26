interface TimeSpent {
    secs: number;
    nanos: number;
}

interface Success {
    Succeeded: TimeSpent;
}

interface EDMPorts {
    EDMRandomPorts: string;
}

interface NatTraversal {
    result: boolean;
    timeSpent: TimeSpent;
}

interface Peer {
    id: number;
    name: string;
    ip: string;
    geo_info: GeoInfo | GeoFetchError | ReservedIp;
    nat_type: string | EDMPorts;
    os: string;
}

interface IpGeoInfo {
    ip: string;
    geo_info: GeoInfo | GeoFetchError | ReservedIp;
}

interface ReservedIp {
    ip: string;
    reserved: boolean;
}

interface GeoFetchError {
    error: boolean;
    message: string;
    reason: string;
}

interface GeoInfo {
    ip: string;
    city: string;
    region: string;
    region_code: string;
    country: string;
    country_name: string;
    continent_code: string;
    in_eu: boolean;
    postal: string;
    latitude: number;
    longitude: number;
    timezone: string;
    utc_offset: string;
    country_calling_code: string;
    currency: string;
    languages: string;
    asn: string;
    org: string;
}

interface ConnectionLog {
    peer_requester: Peer;
    peer_responder: Peer;
    is_direct_successful: boolean;
    utp_hole_punch_result: string | TimeSpent;
    udp_hole_punch_result: string | TimeSpent;
    tcp_hole_punch_result: string | TimeSpent;
    logDataHash: string;
    isHairpinned: boolean;
    createdAt: Date;
}

interface User {
    userId: number;
    userName: string;
    email: string;
    trustLevel: number;
    strategy: string;
    ip: string;
}

interface PaginateResponse {
    logs: Array<ConnectionLog>;
    total: number;
}

export { TimeSpent, Success, NatTraversal, Peer, ConnectionLog, User, GeoInfo, PaginateResponse, GeoFetchError, ReservedIp, IpGeoInfo };
