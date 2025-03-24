const { goRed, goGreen, goYellow } = require('./TrafficLightActions');
const TrafficLightStatus = {
  RED: 0x00,
  YELLOW_TO_G: 0x01,
  GREEN: 0x02,
  YELLOW_TO_R: 0x03
};

class TrafficLight {
  constructor(id, x, y, status = TrafficLightStatus.RED, socket = null) {
    this.id = id;
    this.localization_x = x;
    this.localization_y = y;
    this.status = status;
    this.socket = socket;
  }

  isConnected() {
    return this.socket && this.socket.writable;
  }

  async goRed() {
    if (this.isConnected()) {
      await goRed(this.socket, this.id);
      this.status = TrafficLightStatus.RED;
    }
  }

  async goYellow() {
    if (this.isConnected()) {
      await goYellow(this.socket, this.id);
      this.status =
        this.status === TrafficLightStatus.RED
          ? TrafficLightStatus.YELLOW_TO_G
          : TrafficLightStatus.YELLOW_TO_R;
    }
  }

  async goGreen() {
    if (this.isConnected()) {
      await goGreen(this.socket, this.id);
      this.status = TrafficLightStatus.GREEN;
    }
  }

  changeStatus(newStatus) {
    this.status = newStatus;
  }

  getSocket() {
    return this.socket;
  }

  getInfo() {
    return `Traffic light ${this.id} at (${this.localization_x}, ${this.localization_y}) is currently ${this.status}`;
  }
}

module.exports = { TrafficLight, TrafficLightStatus };
