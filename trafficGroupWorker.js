const { parentPort, workerData } = require('worker_threads');
const { goRed, goGreen, goYellow } = require('./TrafficLightActions');

const { groupName, lightIDs, durations  , lights} = workerData;

let groupState = {
  currentIndex: 0,
  state: 0, // 0: YELLOW_TO_G, 1: GREEN, 2: YELLOW_TO_R, 3: RED
  lastChange: Date.now(),
};

const transitions = [
  { log: '🟡 (to GREEN)', action: goYellow, durationKey: 'yellow' },
  { log: '🟢 GREEN', action: goGreen, durationKey: 'green' },
  { log: '🟡 (to RED)', action: goYellow, durationKey: 'yellow' },
  { log: '🔴 RED', action: goRed, durationKey: 'red' }
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function begin() {
  console.log(`🚦 [${groupName}] Starting traffic light group loop`);
  
  // Set all lights to RED initially
  for (const id of lightIDs) {
    const light = global.lights?.[id];
    if (light?.socket && light.socket.writable) {
      await goRed(light.socket, id);
      light.status = 0x00;
    }
  }

  loop(); // start cycle
}

async function loop() {
  const now = Date.now();
  const step = transitions[groupState.state];
  const currentLightID = lightIDs[groupState.currentIndex];
  // const light = global.lights?.[currentLightID];
  const light = lights

  console.log(lights);

  // if (!light || !light.socket || !light.socket.writable) {
  //   console.log(`⚠️ [${groupName}] ${currentLightID} not connected. Skipping...`);
  //   await sleep(1000);
  //   return loop();
  // }

  if (now - groupState.lastChange >= durations[step.durationKey]) {
    console.log(`🔄 [${groupName}] ${step.log} → ${currentLightID}`);

    await step.action(light.socket, currentLightID);
    light.status = groupState.state;

    groupState.state = (groupState.state + 1) % 4;

    if (groupState.state === 0) {
      // full cycle done for this light → move to next light
      groupState.currentIndex = (groupState.currentIndex + 1) % lightIDs.length;
    }

    groupState.lastChange = now;
  }

  setTimeout(loop, 100);
}

begin();
