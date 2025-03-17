const net = require('net');
const { TrafficLight } = require('./TrafficLight');
const { goRed, goYellow, goGreen, goBlink, sendKeepAlive } = require('./TrafficLightActions');
const {  handleInterrupt , resetBegin, sleep } = require('./InterruptHandling');
require('./api.js');
const { spawn } = require('child_process');

// SERVER CONFIG 
IP = '172.20.10.2'
PORT = 12345 ;
//TO DO , check for sockets during interuption . (APIs)
// Global variable for Light A and B 
global.socketA = null; 
global.socketB = null;
aBlink=false ;
bBlink=false ;
// Light Status 
global.A_Status = 0x00; 
global.B_Status = 0x00;
global.interrupt = 0x00;
//variable to check if the arduino sends response and confirmation after recieving requests
global.keepAliveA = false;
global.keepAliveB = false;
// global.stopLoop = false;
// current Light that server handle . 
global.currentLight = 'A';
// here you can change the time .
const redDuration = 3000;
const yellowDuration = 2000;
const greenDuration = 5000;
let remainingTime = redDuration;
let previousTime = Date.now();
// Variable for change status API
global.interrupt = 0x00 ; 

const server = net.createServer((socket) => {
    console.log('Client connected');
    // Send 0x20 as first request to identify the arduino 
    socket.write(Buffer.from([0x20]));
    // every 5 seconds there is keep alive socket sent by the server 
    socket.setKeepAlive(true, 5000);
    console.log('Server sent 0x20 to client');

    socket.on('data', (data) => {
        console.log('Received message:', data.toString());
        handleReceivedMessage(data.toString(), socket);
    });
    
    socket.on('end', () => {
        console.log('Client disconnected');
        if (global.socketA === socket) global.socketA = null;
        else if (global.socketB === socket) global.socketB = null;
    });
    socket.on('close', () => {
        console.log('Client disconnected');
        if (global.socketA === socket) global.socketA = null;
        else if (global.socketB === socket) global.socketB = null;
    });
    socket.on('error', (err) => {
        console.error(`Socket error: ${err.message}`);
        if (global.socketA === socket) global.socketA = null;
        else if (global.socketB === socket) global.socketB = null;
    });
});

server.listen(PORT, IP, () => {
    console.log('TCP server running on 192.168.0.107:12345');
});

function handleReceivedMessage(data, socket) {
    try {
        if (!data.trim()) return console.log("⚠️ Empty message. Ignoring...");
        
        const { command, lightID } = JSON.parse(data);
        switch (command) {
            case 60:
                addNewTrafficLight(JSON.parse(data), Object.keys(data).length, socket);
                break;
          
            case 90:
                if (lightID === "A2") global.keepAliveA = true;
                else if (lightID === "B2") global.keepAliveB = true;
                break;
            default:
                console.log(`❌ Command not found: ${command}`);
        }
    } catch (error) {
        console.log('❌ JSON parsing error:', error.message);
    }
}

function addNewTrafficLight(parsedData, dataLength, socket) {
    



    console.log('🚦 Adding Traffic Light...');
    console.log(`📏 Data length: ${dataLength}`);
    
    const { lightID, loc_x, loc_y, lightStatus } = parsedData;
    if (!lightID || loc_x === undefined || loc_y === undefined || lightStatus === undefined) {
        return console.log("❌ Missing required fields!");
    }
    
    const newTrafficLight = lightID === "A2"
        ? (global.Light_A = new TrafficLight(lightID, loc_x, loc_y, lightStatus, socket), global.socketA = socket)
        : (global.Light_B = new TrafficLight(lightID, loc_x, loc_y, lightStatus, socket), global.socketB = socket);
    
    console.log(`✅ NEW TRAFFIC LIGHT:`, JSON.stringify(newTrafficLight, null, 2));

    if (lightID === "A2") {
        global.keepAliveA= true
        global.socketA = socket ; 
     
    } else if (lightID === "B2") {
        global.keepAliveB = true ;
        global.socketB = socket ; 
    }

}

async function begin() {
    console.log("🚦 Traffic Light System Starting...");
    previousTime = Date.now();
    remainingTime = 5000;
    await goRed(global.socketA, "A2");
    await goRed(global.socketB, "B2");
    global.A_Status = global.B_Status = 0x00;
    
    loop();
}

async function loop() {

    if (!global.keepAliveA || !global.keepAliveB) {
        global.socketA = global.keepAliveA ? global.socketA : null;
        global.socketB = global.keepAliveB ? global.socketB : null;
        console.log("⚠️ One or both Arduinos not responding! Pausing...");
        return waitForReconnect();
    }

    if(global.interrupt != 0x00) {
        console.log('INTERRUPT : ' , global.interrupt);
        await handleInterrupt();

    }

    



    const currentTime = Date.now();
    if (currentTime - previousTime >= remainingTime) {
        previousTime = currentTime;
        await processLightCycle();
    }
    setTimeout(loop, 100);
}

async function processLightCycle() {
    switch (global.currentLight) {
        case 'A':
            if (global.A_Status === 0x03) {
                console.log("🔴 A: Switching to RED, switching to B");
                await goRed(global.socketA, "A2");
                remainingTime = 3000;
                global.A_Status = 0x00;
                global.currentLight = 'B';
            } else {
                await updateTrafficLight('A');
            }
            break;
        case 'B':
            if (global.B_Status === 0x03) {
                console.log("🔴 B: Switching to RED, switching to A");
                await goRed(global.socketB, "B2");
                remainingTime = 3000;
                global.B_Status = 0x00;
                global.currentLight = 'A';
            } else {
                await updateTrafficLight('B');
            }
            break;
    }
}

async function updateTrafficLight(light) {
    const socket = light === 'A' ? global.socketA : global.socketB;
    const lightID = light === 'A' ? "A2" : "B2";
    const status = light === 'A' ? global.A_Status : global.B_Status;

    const transitions = [
        { log: "🔶 Switching to YELLOW", action: goYellow },
        { log: "🟢 Switching to GREEN", action: goGreen },
        { log: "🟠 Switching to YELLOW again", action: goYellow }
    ];

    console.log(transitions[status].log);
    await transitions[status].action(socket, lightID);
    remainingTime = [yellowDuration, greenDuration, yellowDuration][status];
    light === 'A' ? global.A_Status++ : global.B_Status++;
}


intervalId = setInterval(() => {
    if (global.Light_A && global.Light_B && global.socketA && global.socketB) {
        clearInterval(intervalId);
        clearTimeout(timeoutId); 
        console.log("✅ Both clients connected. Starting system...");
        // aBlink = false ; 
        // bBlink = false ;
        begin();
    } else {
        // if(global.socketA && !aBlink  ){
        //     goBlink(global.socketA,"A2");
        //     aBlink=true ;             

        // }
        // else if(global.socketB && !bBlink )  {
        //     goBlink(global.socketB,"B2");
        //     bBlink=true ; 

        // }    
       
        console.log(" 🔄 Waiting for clients...");
    }
}, 1000);

timeoutId = setTimeout(() => {
    clearInterval(intervalId);
    restartServer();
}, 3000000);


function waitForReconnect() {
    console.log("⏳ Waiting for Arduinos...");
    
    let interval = setInterval(() => {
        if (global.socketA && global.socketB) {
            console.log("✅ Both Arduinos reconnected. Resuming...");
            global.keepAliveA = global.keepAliveB = true;
            clearInterval(interval);
            clearTimeout(timeout); 
            aBlink = false ; 
            bBlink = false ;
            begin();
        } else {
            if(global.socketA && !aBlink  ){
                goBlink(global.socketA,"A2");
                aBlink=true ;             
            }
            else if(global.socketB && !bBlink )  {
                goBlink(global.socketB,"B2");
                bBlink=true ; 
            }    
            console.log("🔄 Still waiting for reconnection...");
        }
    }, 3000);

    // Set a timeout to restart if reconnection fails within 30 seconds
    let timeout = setTimeout(() => {
        clearInterval(interval);
        restartServer();
    }, 30000000); 
}


function restartServer() {
    console.log("⏳ Clients did not connect within 10 seconds. Restarting server...");
    spawn(process.argv[0], process.argv.slice(1), {
        detached: true,
        stdio: 'inherit'
    });
    process.exit();
}

