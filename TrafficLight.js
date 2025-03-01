// Enum  for Traffic Light Status
const TrafficLightStatus = {
    RED: 0x00,
    YELLOW_TO_G: 0x01,
    GREEN: 0x02,
    YELLOW_TO_R : 0x03
  };

  class TrafficLight {
    constructor(id, localization_x , localization_y , status , socket ) {
      this.id = id;
      this.localization_x = localization_x;
      this.localization_y = localization_y;
      this.status = status;
      this.socket = socket ;
    }

    // change the traffic light status
    changeStatus(newStatus){
        this.status = newStatus ;
    }


    getSocket() {
      return this.socket;
    }

    //get traffic light info
    getInfo() {
      return `Traffic light ${this.id} at ${this.localization_x} . ${this.localization_y}  is currently ${this.status}`;
    }
  }

  module.exports = { TrafficLight, TrafficLightStatus  };