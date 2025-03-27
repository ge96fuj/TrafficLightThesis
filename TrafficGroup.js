const { TrafficLightStatus } = require('./TrafficLight');

class TrafficGroup {
  constructor(name, lightIDs, durations) {
    this.name = name;                     
    this.lightIDs = lightIDs;            
    this.lights = lightIDs.map(id => global.lights[id]); 
    this.durations = durations;          
    this.currentIndex = 0;               
    this.state = 0;         
    this.interrupt = {
        active : false , 
        targetID: null
    } ;             
    this.reset=false ; // Force all Red  ( for example after disconnecting one arduino )
  }

  isReady() {
    const notConnected = this.lights.filter(l => !l.isConnected());
    if (notConnected.length > 0) {
      console.warn(`⚠️ [${this.name}] Disconnected lights: ${notConnected.map(l => l.id).join(', ')}`);
      this.reset=true ; 
      return false;
    }
    return true;
  }

  getCurrentLight() {
    return this.lights[this.currentIndex];
  }

  async runCycle() {
    console.log(`🚦 Starting cycle for group [${this.name}]`);
  
    const transitions = [
      { log: "🟡 (Yellow to GREEN)", action: "goYellow", durationKey: "yellow" },
      { log: "🟢 GREEN", action: "goGreen", durationKey: "green" },
      { log: "🟡 (Yellow to RED)", action: "goYellow", durationKey: "yellow" },
      { log: "🔴 RED", action: "goRed", durationKey: "red" }
    ];
  
    let lastTransitionTime = Date.now();
    let transitionStarted = false;
  
    while (true) {
      const currentTime = Date.now();
  
      if (!this.isReady()) {
        console.log(`⏳ [${this.name}] Not ready – retrying...`);
        this.reset = true;
        await this.sleep(1000);
        continue;
      }
  
      if (this.reset) {
        console.log(`🔁 [${this.name}] Resetting group...`);
        await this.goAllRed();
        this.state = 0;
        this.currentIndex = 0;
        this.reset = false;
        lastTransitionTime = Date.now();
        transitionStarted = false;
        continue;
      }
  
      const light = this.getCurrentLight();
      const step = transitions[this.state];
      const isInterrupting = this.interrupt.active;
      const isTarget = light.id === this.interrupt.targetID;
  
      if (isInterrupting && !isTarget) {
        console.log(`⚠️ [${this.name}] ${light.id} is not target. Fast finish.`);
        if (light.status === TrafficLightStatus.GREEN) {
          await light.goYellow();
        }
        await light.goRed();
        this.currentIndex = this.lights.findIndex(l => l.id === this.interrupt.targetID);
        this.state = 0;
        transitionStarted = false;
        lastTransitionTime = Date.now();
        continue;
      }
  
      if (isInterrupting && isTarget) {
        console.log(`⚠️ [${this.name}] Holding GREEN for interrupt target: ${light.id}`);
        await this.holdGreenForInterrupt(light.id);
        this.currentIndex = (this.currentIndex + 1) % this.lights.length;
        this.state = 0;
        transitionStarted = false;
        lastTransitionTime = Date.now();
        continue;
      }
  
      const duration = this.durations[step.durationKey];
  
      if (!transitionStarted) {
        console.log(`[${this.name}] ${step.log} → ${light.id}`);
        await light[step.action]();
        transitionStarted = true;
        lastTransitionTime = Date.now();
      }
  
      if (currentTime - lastTransitionTime >= duration) {
        // Move to next state
        this.state = (this.state + 1) % 4;
        if (this.state === 0) {
          this.currentIndex = (this.currentIndex + 1) % this.lights.length;
        }
        transitionStarted = false;
      }
  
      await this.sleep(200); // small delay to avoid CPU burn
    }
  }
  

  async holdGreenForInterrupt(targetID) {
    const targetLight = this.lights.find(l => l.id === targetID);
    if (!targetLight || !targetLight.isConnected()) return;
  
    console.log(`⚠️ [${this.name}] Handling interrupt for ${targetID}...`);
  
   
    switch (targetLight.status) {
      case TrafficLightStatus.RED:
        console.log(`🟡 ${targetID} is RED → transitioning to GREEN`);
        await targetLight.goYellow(); // RED → YELLOW_TO_G
        await this.sleep(1000);
        await targetLight.goGreen();
        break;
  
      case TrafficLightStatus.YELLOW_TO_R:
        console.log(`🟡 ${targetID} is in YELLOW_TO_R → reversing to GREEN`);
        await targetLight.goRed();
        await this.sleep(1000);
        await targetLight.goYellow();
        await this.sleep(1000);
        await targetLight.goGreen(); 
        break;
  
      case TrafficLightStatus.YELLOW_TO_G:
        console.log(`⏳ ${targetID} already transitioning to GREEN`);
        await this.sleep(1000); 
        break;
  
      case TrafficLightStatus.GREEN:
        console.log(`🟢 ${targetID} already GREEN`);
        break;
  
      default:
        console.warn(`❓ Unknown status for ${targetID}. Forcing GREEN`);
        await targetLight.goGreen();
        break;
    }
  
    console.log(`🟢 [${this.name}] ${targetID} is now GREEN (holding for interrupt)`);
  
    // Hold while interrupt is active
    while (this.interrupt.active) {
      await this.sleep(1000);
    }
  
    // Interrupt ends .. - go to Red
    console.log(`🔄 [${this.name}] Interrupt cleared. Returning to RED for ${targetID}`);
    await targetLight.goYellow();  // GREEN → YELLOW_TO_R
    await this.sleep(2000);
    await targetLight.goRed();
  }
  

  async goAllRed() {
    console.log(`🔴 [${this.name}] Forcing all lights to RED...`);
    
    for (const light of this.lights) {
      if (light.isConnected()) {
        // light.changeStatus(TrafficLightStatus.RED);
        await light.goRed();
        
      } else {
        console.warn(`⚠️ [${this.name}] Light ${light.id} is not connected. Skipped.`);
      }
    }
  
    // Reset group state so it starts clean on next cycle
    this.state = 0;
    this.currentIndex = 0;
  }


  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = TrafficGroup;
