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
      { log: "🟢 GREEN",      action: "goGreen",  durationKey: "green" },
      { log: "🟡 (Yellow to RED)",   action: "goYellow", durationKey: "yellow" },
      { log: "🔴 RED",        action: "goRed",    durationKey: "red" }
    ];

    while (true) {
      const light = this.getCurrentLight();
      const step = transitions[this.state];
      const isInterrupting = this.interrupt.active;
      const isTarget = light.id === this.interrupt.targetID;


    //   if (!light || !light.isConnected()) {
    //     console.log(`⚠️ Skipping ${light?.id} (not connected)`);
    //     await this.sleep(1000);
    //     continue;
    //   }

       while (!this.isReady()) {
          console.log(`⏳ [${this.name}] Waiting: one or more lights are disconnected...`);
           await this.sleep(2000);
       }
       if(this.reset) {
        this.reset = false ; 
        this.goAllRed() ; 
        this.state=0 ;
        await this.sleep(2000);


       }

    
        // Fast Cycle  then jump to Target 
        if (isInterrupting && !isTarget) {
            console.log(`⚠️ [${this.name}] ${light.id} is not the interrupt target. Finishing quickly...`);
    
            if (light.status === TrafficLightStatus.GREEN) {
              await this.sleep(1000);
              await light.goYellow();
              await this.sleep(1000);
            }
            await light.goRed();
            light.changeStatus(TrafficLightStatus.RED);
    
            // Jump to target 
            this.currentIndex = this.lights.findIndex(l => l.id === this.interrupt.targetID);
            this.state = 0;
            continue;
          }
    
          // Handle interrupt target light
          if (isInterrupting && isTarget) {
            await this.holdGreenForInterrupt(light.id);
            this.currentIndex = (this.currentIndex + 1) % this.lights.length;
            continue;
          }

    

      console.log(`[${this.name}] ${step.log} → ${light.id}`);
      await light[step.action]();
      light.changeStatus(this.state);

      this.state = (this.state + 1) % 4;

      if (this.state === 0) {
        this.currentIndex = (this.currentIndex + 1) % this.lights.length;
      }

      await this.sleep(this.durations[step.durationKey]);
    }
  }

  async holdGreenForInterrupt(targetID) {
    const targetLight = this.lights.find(l => l.id === targetID);
    if (!targetLight || !targetLight.isConnected()) return;

    console.log(`🟢 [${this.name}] ${targetID} → GREEN (holding for interrupt)`);
    await targetLight.goGreen();
    targetLight.changeStatus(TrafficLightStatus.GREEN);

    while (this.interrupt.active) {
      await this.sleep(1000);
    }
    
    await sleep(1000);
    await targetLight.goYellow();
    await sleep(2000);
    await targetLight.goRed();



    console.log(`🔄 [${this.name}] Interrupt cleared. Resuming normal cycle.`);

  }

  async goAllRed() {
    console.log(`🔴 [${this.name}] Forcing all lights to RED...`);
    
    for (const light of this.lights) {
      if (light.isConnected()) {
        await light.goRed();
        light.changeStatus(TrafficLightStatus.RED);
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
