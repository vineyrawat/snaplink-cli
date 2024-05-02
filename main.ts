class SnapLink {
  name: string = "SnapLink";
  constructor() {
    Logger.info(`Creating an instance of ${this.name}`);
    this.init()
      .then(() => {
        Logger.success(`Successfully created an instance of ${this.name}`);
      })
      .catch((error) => {
        Logger.error(`Failed to create an instance of ${this.name}`);
        Logger.error(error);
      });
  }

  async init() {
    await this.createVirtualWebcam();
    await this.createWebSocketServre();
  }

  async createWebSocketServre() {
    Logger.info("Creating web socket server");
    const server = Deno.serve((req) => {
      if (req.headers.get("upgrade") != "websocket") {
        return new Response(null, { status: 501 });
      }

      const { socket, response } = Deno.upgradeWebSocket(req);

      socket.addEventListener("open", () => {
        Logger.info("WebSocket connection opened");
      });

      return response;
    });
  }

  async createVirtualWebcam() {
    const virtualDevice = await new Deno.Command("modprobe", {
      args: [
        "v4l2loopback",
        "exclulsive_caps=1",
        "video_nr=10",
        'card_label="SnaplinkVirtualCamera"',
        "device=/dev/video10",
      ],
    }).output();

    if (virtualDevice.success) {
      Logger.success("Successfully created virtual webcam");
    }

    if (virtualDevice.code !== 0) {
      throw new Error("Failed to create virtual webcam");
    }
  }
}

const Logger = {
  info(message: string) {
    console.log(`%c[+] ${message}`, "color: blue");
  },

  warn(message: string) {
    console.log(`%c[!] ${message}`, "color: orange");
  },

  error(message: string) {
    console.log(`%c[-] ${message}`, "color: red");
  },

  debug(message: any) {
    console.log(message);
    // console.log(`%c[?] ${message}`, "color: gray");
  },

  success(message: string) {
    console.log(`%c[✔] ${message}`, "color: green");
  },

  clear() {
    console.clear();
  },
};

new SnapLink();
