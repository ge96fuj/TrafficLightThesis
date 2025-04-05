const net = require('net');
const { TrafficLight } = require('./core/TrafficLight.js');
const TrafficGroup = require('./core/TrafficGroup.js');
const lightConfig = require('./config/lightConfig.js');
require('./services/api.server.js');
require('./services/mqtt.service.js');
// SERVER CONFIG 
IP = '192.168.1.73';
// IP = '192.168.1.21' ;
// IP = '172.20.10.2';
PORT = 12345;
global.lights = {};
global.trafficGroupsList = [];

const DEFAULT_DURATIONS = {
  red: 2000,
  yellow: 2000,
  green: 10000
};

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

    const {command} = JSON.parse(data);
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
  
  
  for (const { id, localization_x, localization_y, group, durations } of lightConfig) {
    if (usedIDs.has(id)) {
      throw new Error(`❌ Duplicate light ID found: "${id}" in group "${group}"`);
    }
  
    const lightDurations = durations || DEFAULT_DURATIONS; // fallback duration values if there is no duration in the config file
  
    global.lights[id] = new TrafficLight(id, localization_x, localization_y, undefined, null, lightDurations);
    console.log(`✅ Created light ${id} with durations:`, lightDurations);

    usedIDs.add(id);
  
    if (!groupedIDs[group]) groupedIDs[group] = [];
    groupedIDs[group].push(id);
  }
  
  for (const [groupName, lightIDs] of Object.entries(groupedIDs)) {
    const group = new TrafficGroup(groupName, lightIDs);

    global.trafficGroupsList.push(group);
  }

  console.log("✅ Lights initialized:", Object.keys(global.lights));
  console.log("✅ Groups initialized:", global.trafficGroupsList.map(g => g.name));
}


global.launchedGroups = new Set();
  
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
setInterval(() => {
  const allGroupsLaunched = global.trafficGroupsList.length === global.launchedGroups.size;
  if (!allGroupsLaunched) {
    checkAndLaunchGroups().catch(console.error);
  }
}, 3000);