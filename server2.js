const net = require('net');
const { TrafficLight } = require('./TrafficLight');
const TrafficGroup = require('./TrafficGroup');
require('./api.js'); 
require('./mqttBridge.js'); 
const { spawn } = require('child_process');
const lightConfig = require('./lightConfig');
const { Worker } = require('worker_threads');
const path = require('path');

// SERVER CONFIG 
IP = '192.168.1.21' ;
// IP = '172.20.10.2';
PORT = 12345 ;

global.lights = {};              
const groupedIDs = {};           
global.trafficGroupsList = [];   



const server = net.createServer((socket) => {
    console.log('✅ Client connected');
  
    // Identify the Arduino , send 0x20
    socket.write(Buffer.from([0x20]));
    socket.setKeepAlive(true, 5000);
  
    console.log('➡️ Sent 0x20 to client');
  
    socket.on('data', (data) => {
      console.log('📥 Received message:', data.toString());
      handleReceivedMessage(data.toString(), socket);
    });
  
    //  handle disconnects
    const cleanDisconnect = () => {
      console.log('⚠️ Client disconnected or errored.');
  
      // Find the light corresponding to the socket
      const light = Object.values(global.lights).find(l => l.socket === socket);
      if (light) {
        console.log(`🛑 Disconnected light: ${light.id}`);
        light.socket = null;
        light.status = null; 
      }
    };
  
    socket.on('end', cleanDisconnect);
    socket.on('close', cleanDisconnect);
    socket.on('error', (err) => {
      console.error(`❌ Socket error: ${err.message}`);
      cleanDisconnect();
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
                break;
            default:
                console.log(`❌ Command not found: ${command}`);
        }
    } catch (error) {
        socket.end();
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
  
    // Get the light 
    const light = global.lights[lightID];
  
    if (!light) {
      return console.log(`❌ No preconfigured light found for ID ${lightID}`);
    }
  
    // Attach socket
    light.socket = socket;
    light.localization_x = loc_x;
    light.localization_y = loc_y;
    light.status = lightStatus;
  
    console.log(`✅ ${lightID} is now connected.`);
    console.log(`   ↪️  Status: ${lightStatus}, Socket Writable: ${socket.writable}`);
  }


  function initializeLightsAndGroups() {
    const groupedIDs = {};
    global.lights = {};
    global.trafficGroupsList = [];
    global.launchedGroups = new Set();
  
    const usedIDs = new Set();
  
    for (const { id, localization_x, localization_y, group } of lightConfig) {
      if (usedIDs.has(id)) {
        throw new Error(`❌ Duplicate light ID found: "${id}" in group "${group}"`);
      }
  
      global.lights[id] = new TrafficLight(id, localization_x, localization_y);
      usedIDs.add(id);
  
      if (!groupedIDs[group]) groupedIDs[group] = [];
      groupedIDs[group].push(id);
    }
  
  
    for (const [groupName, lightIDs] of Object.entries(groupedIDs)) {
      const group = new TrafficGroup(groupName, lightIDs, {
        red: 6000,
        yellow: 3000,
        green: 6000
      });
  
      global.trafficGroupsList.push(group);
    }
  
    console.log("✅ Lights initialized:", Object.keys(global.lights));
    console.log("✅ Groups initialized:", global.trafficGroupsList.map(g => g.name));
  }
  



  global.launchedGroups = new Set();

// function checkAndLaunchGroups() {
//   for (const group of global.trafficGroupsList) {
//     const groupName = group.name;

//     if (global.launchedGroups.has(groupName)) continue;

//     if (group.isReady()) { //change
//       global.launchedGroups.add(groupName);

//       const worker = new Worker(path.resolve(__dirname, 'trafficGroupWorker.js'), {
//         workerData: {
//           groupName,
//           lightIDs: group.lightIDs,
//           durations: group.durations,
          
//         }
//       });

//       worker.on('error', (err) => {
//         console.error(`❌ Worker error [${groupName}]:`, err);
//       });

//       worker.on('exit', (code) => {
//         console.log(`🧵 Worker [${groupName}] exited with code ${code}`);
//       });

//       console.log(`🚦 Group ${groupName} started in thread ✅`);
//     } else {
//       console.log(`⏳ Group ${groupName} not ready...`);
//     }
//   }
// }
async function checkAndLaunchGroups() {
  console.log("Running checkandlaunch function");
    for (const group of global.trafficGroupsList) {
      const groupName = group.name;
  
      //running
      if (global.launchedGroups.has(groupName)) continue;
  
      //Ready
      if (group.isReady()) {
        global.launchedGroups.add(groupName);
        group.goAllRed();
  
        console.log(`🚦 Group ${groupName} is ready. Starting cycle ✅`);
        group.runCycle(); 
      } else {
        console.log(`⏳ Group ${groupName} not ready...`);
      }
    }
  }

  initializeLightsAndGroups();
  // setInterval(() => {
  //   checkAndLaunchGroups().catch(console.error);
  //  }, 3000);

// run only if all groups are launched 
  setInterval(() => {
    const allGroupsLaunched = global.trafficGroupsList.length === global.launchedGroups.size;
    if (!allGroupsLaunched) {
      checkAndLaunchGroups().catch(console.error);
    }
  }, 3000);