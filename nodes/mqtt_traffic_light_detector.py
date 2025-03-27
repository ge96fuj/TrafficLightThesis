#!/usr/bin/env python3

# import rospy
import json
import time
import traceback

import paho.mqtt.client as paho

# from autoware_msgs.msg import TrafficLightResult, TrafficLightResultArray
# from helpers.lanelet2 import load_lanelet2_map, get_stoplines_api_id

MQTT_TO_AUTOWARE_TFL_MAP = {
    "RED": 0,
    "RED/AMB": 0,
    "REDVAMB": 0,
    "RED\\AMB": 0,
    "AMBER-RED": 0,
    "AMBERRED" : 0,
    "YELLOW": 0,
    "AMBER": 0,
    "FLASH" : 2,
    "AMB FLASH" : 2,
    "AMBER FLASH" : 2,
    "GREEN FLASH": 1,
    "GREEN": 1,
    "OFF": 2,
    "UNKNOWN": 2
}

class MqttTrafficLightDebugger:
    def __init__(self):
        # test values
        self.mqtt_host = "localhost"
        self.mqtt_port = 1883
        self.mqtt_topic = "detection/traffic_lights/#"
        self.timeout = 5 
        self.id_string = "_debug"

        # test values 
        self.stop_line_ids = {
            101: "A2",
            102: "B2",
            103: "C2"
        }

        self.mqtt_status = {}

        self.rate = 0.1  # 10 Hz = 0.1s per cycle

        client = paho.Client()
        client.on_message = self.on_message
        client.on_disconnect = self.on_disconnect
        client.on_connect = self.on_connect

        client.connect(self.mqtt_host, self.mqtt_port, keepalive=10)
        client.loop_start()

        self.client = client

    def on_connect(self, client, userdata, flags, rc):
        if rc != 0:
            print(f"[ERROR] Failed to connect to MQTT {self.mqtt_host}:{self.mqtt_port} (rc={rc})")
            return
        print(f"[MQTT] Connected to {self.mqtt_host}:{self.mqtt_port}")
        client.subscribe(self.mqtt_topic)
        print(f"[MQTT] Subscribed to {self.mqtt_topic}")

    def on_disconnect(self, client, userdata, rc):
        print(f"[MQTT] Disconnected from {self.mqtt_host}:{self.mqtt_port} (rc={rc})")

    def on_message(self, client, userdata, msg):
        try:
            api_id = msg.topic.split("/")[-1]
            self.mqtt_status[api_id] = json.loads(msg.payload.decode())
            print(f"🟢 {api_id}: {self.mqtt_status[api_id]['status']}")
        except Exception as e:
            print("❌ Error parsing MQTT message:", e)

    def combine_and_print(self):
        try:
            print("\n--- Combined Traffic Light Status ---")
            now_ms = int(time.time() * 1000)

            for lane_id, api_id in self.stop_line_ids.items():
                result_str = "UNKNOWN"
                result = MQTT_TO_AUTOWARE_TFL_MAP[result_str]

                if api_id in self.mqtt_status:
                    status_obj = self.mqtt_status[api_id]
                    if status_obj["timestamp"] < (now_ms - self.timeout * 1000):
                        print(f"⚠️ Timeout on {api_id}")
                    else:
                        result_str = status_obj["status"]
                        result = MQTT_TO_AUTOWARE_TFL_MAP.get(result_str, 2)

                print(f"[Lane {lane_id}] {api_id} → {result_str} ({result})")

        except Exception as e:
            print("❌ Exception during processing:", traceback.format_exc())

    def run(self):
        while True:
            self.combine_and_print()
            time.sleep(self.rate)

if __name__ == '__main__':
    print("🚦 MQTT Traffic Light Debugger (ROS-Free)")
    node = MqttTrafficLightDebugger()
    node.run()
