const PoweredUP = require("node-poweredup");
const poweredUP = new PoweredUP.PoweredUP();
let mqtt = require('mqtt')

poweredUP.on("discover", async (hub) => {
    console.log(`Discovered ${hub.name}!`);
    await hub.connect(); // Connect to the Hub
    const motorA = await hub.waitForDeviceAtPort("A");
    const motorB = await hub.waitForDeviceAtPort("B");
    const motorC = await hub.waitForDeviceAtPort("C");
    console.log("Connected");
});

// Start scanning for Hubs
poweredUP.scan();
console.log("Scanning for Hubs...");

let client = mqtt.connect('ws://39.97.32.130:8083/mqtt', {
    clientId: 'node_lego',
});

client.subscribe('lego', {qos:0});

client.on('message', async (topic, message) => {
    console.log('received message: ', message.toString())
    let ret = JSON.parse(message.toString());

    const connectedHubs = poweredUP.getHubs();
    let hub = connectedHubs[0];
    const motorA = await hub.waitForDeviceAtPort('A');
    const motorB = await hub.waitForDeviceAtPort('B');
    const motorC = await hub.waitForDeviceAtPort('C');

    if (ret.port !== 'C') {
        await motorA.setPower(ret.value);
        await motorB.setPower(ret.value);
    } else {
        await motorC.setPower(ret.value);
    }
    await hub.sleep(ret.time);
    await motorA.brake();
    await motorB.brake();
    await motorC.brake();
});

