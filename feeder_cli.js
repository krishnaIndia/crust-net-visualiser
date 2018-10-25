#!/usr/bin/env node
'use strict';
const random = require("./randomGenerators");
const WebSocket = require('ws');
const args = require('minimist')(process.argv.slice(2))
const host = "ws://localhost:" + require("./src/config/app").crustWsPort;

const sendIterative = (count) => {
    const logs = [];
    for (var i = 0; i < count; i++) {
        const peer_requester = {
            id: random.randomNumber(),
            name: random.randomName(),
            ip: random.randomIP(args["startIp"], args["endIp"]),
            nat_type: random.randomNatType(),
            os: random.randomOS(),
        }

        const peer_responder = {
            id: random.randomNumber(),
            name: random.randomName(),
            ip: random.randomIP(args["startIp"], args["endIp"]),
            nat_type: random.randomNatType(),
            os: random.randomOS(),
        }

        const is_direct_successful = random.randomBoolean();
        const udp_hole_punch_result = random.randomFailSucceed();
        const tcp_hole_punch_result = random.randomFailSucceed();

        logs.push({
            message: JSON.stringify({
                peer_requester,
                peer_responder,
                tcp_hole_punch_result,
                udp_hole_punch_result,
                is_direct_successful
            })
        });
    }
    return logs;
}

let ws = new WebSocket(host);
function error(i, err) {
    console.log(`send log ${i}:` + (err ? ` Failed ${err}` : ` Success`));
    ws.close();
}

ws.on('open', () => {
    console.log('connected to ws server');
    const logs = sendIterative(args['count'] || 100);
    logs.forEach((log, i) => {
        ws.send(JSON.stringify(log), (err) => {
            error(i, err);
            if (args['showlog'] === "true")
                console.log(`${JSON.stringify(log)}\n`);
        });
    }
    );
});

ws.on('close', function close() {
    console.log('disconnected');
});
