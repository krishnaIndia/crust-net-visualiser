import * as WebSocket from "ws";
import connectionLogService from "./services/connectionlogservice";
import { ConnectionLog } from "./types/AppTypes";
import { generateLogHash, getGeoInfoFromIp } from "./util/Helpers";
import http = require("http");
import app from "./app";
const config = require("./config/app.json");

interface QMsg {
  data: ConnectionLog;
  executor: Function;
}

class Queue {
  private messages: Array<QMsg> = new Array;
  private isRunning = false;

  private next() {
    if (this.messages.length === 0) {
      this.isRunning = false;
      return;
    }
    const tempMsg = this.messages.splice(0, 1)[0];
    tempMsg.executor(tempMsg.data, () => {
      this.next();
    });
  }

  private start() {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    this.next();
  }

  public push(msg: QMsg) {
    this.messages.push(msg);
    this.start();
  }
}

export default class WebSocketServer {
  private dashboardWS: WebSocket.Server;
  private crustWS: WebSocket.Server;
  private queue: Queue;
  // private server: any;
  constructor() {
    this.dashboardWS = new WebSocket.Server({ port: config.dashboardWsPort });
    this.createCrustWsServer();
    this.queue = new Queue;
  }

  private createCrustWsServer() {
    const server = http.createServer(app);
    this.crustWS = new WebSocket.Server({ server: server });
    server.listen(config.crustWsPort, () => {
      console.log(`Crust webSocketServer running on : ${config.crustWsPort} :)`);
    });
  }

  private async onMsgHandler(ws: WebSocket, log: ConnectionLog, next: Function) {
    try {
      log.logDataHash = generateLogHash(log);
      const hasDuplicate = await connectionLogService.getPossibleDuplicate(log);
      if (hasDuplicate) {
        console.log("Ignored potential duplicate");
        return next();
      }

      log.isHairpinned = (log.peer_requester.ip === log.peer_responder.ip);
      log.peer_requester.geo_info = await getGeoInfoFromIp(log.peer_requester.ip);
      log.peer_responder.geo_info = await getGeoInfoFromIp(log.peer_responder.ip);

      await connectionLogService.insert(log);
      this.dashboardWS.clients.forEach(function each(client: any) {
        if (client.readyState === WebSocket.OPEN) {
          log.createdAt = new Date();
          client.send(JSON.stringify(log));
        }
      });
      next();
    } catch (e) {
      console.log(e);
    }
  }

  start() {
    this.crustWS.on("connection", (ws: WebSocket) => {
      ws.send("crust ws client connected");

      ws.on("error", function (e) {
        console.log(e);
      });

      ws.on("message", async (message: string) => {
        // console.log(`Received -> ${message}`);
        try {
          const msgData = JSON.parse(message).message;
          // Extract msg data from the data received from websocket data
          const logData = JSON.parse(msgData);
          this.queue.push({
            data: logData,
            executor: (data: ConnectionLog, next: Function) => {
              this.onMsgHandler(ws, data, next);
            }
          });
        } catch (e) {
          return console.error(e.message);
        }
      });
    });
    this.crustWS.on("error", function (e) {
      console.log(e);
    });

    this.dashboardWS.on("connection", (ws: WebSocket) => {
      ws.send("dashboard ws client connected");

      ws.on("error", function (e) {
        console.log(e);
      });

      // connection is up, let's add a simple simple event
      ws.on("message", async (message: string) => {
        // console.log(`Received -> ${message}`);
      });

      this.dashboardWS.on("error", function (e) {
        console.log(e);
      });
    });
    this.dashboardWS.on("error", function (e) {
      console.log(e);
    });
  }
}
