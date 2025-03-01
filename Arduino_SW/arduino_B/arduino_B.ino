#include <WiFiNINA.h>
#include <ArduinoJson.h>

char ssid[] = "SKA"; 
char password[] = "55333932s"; 

const char* serverIP = "192.168.0.107";  
const int serverPort = 12345;  // Ensure this is included

String A1_Status = "RED", A2_Status = "RED";
uint16_t locX = 0x1234, locY = 0x200;

int red = 2, yellow = 3, green = 4;

unsigned long redDuration = 5000, yellowDuration = 2000, greenDuration = 5000;
bool begin = false;

enum TrafficLightStatus { RED, YELLOW_TO_GREEN, GREEN, YELLOW_TO_RED, YELLOW };

WiFiClient client;
TrafficLightStatus currentState = RED;

void setup() {
    pinMode(red, OUTPUT);
    pinMode(yellow, OUTPUT);
    pinMode(green, OUTPUT);
    Serial.begin(115200);
    connectToWiFi();
    connectToServer();
    Serial.println("Messages sent!");
}

void loop() {
    if (!client.connected()) {
        Serial.println("Lost connection to server, reconnecting...");
        client.stop();
        connectToServer();
    }
    handleRequests();
}

unsigned long previousMillis = 0;
const long interval = 500;

void connectToServer() {
    digitalWrite(red, LOW);
    digitalWrite(green, LOW);
    
    Serial.print("Connecting to server...");
    unsigned long startAttemptTime = millis(); 

    while (!client.connect(serverIP, serverPort)) {  // Ensure 'serverPort' is properly declared
        if (millis() - startAttemptTime > 5000) { // Timeout after 5 seconds
            Serial.println("\nServer connection failed. Retrying later...");
            return;
        }
        
        digitalWrite(yellow, !digitalRead(yellow)); // Blinking yellow
        Serial.print(".");
        delay(500);
    }

    Serial.println("\nConnected to server!");
}

void sendStatus() {
    StaticJsonDocument<200> doc;
    doc["command"] = 60;
    doc["lightID"] = "B2";
    doc["loc_x"] = locX;
    doc["loc_y"] = locY;
    doc["lightStatus"] = currentState;

    String jsonString;
    serializeJson(doc, jsonString);
    client.println(jsonString);
    client.flush();  // Ensure message is fully sent
}

void handleRequests() {
    if (client.available()) {
        char request = client.read();
        Serial.print("Received ");
        Serial.print(request, HEX);
        Serial.println(" from server");

        switch (request) {
            case 0x20: sendStatus(); break;
            case 0x21: goRed(); break;
            case 0x22: goGreen(); break;
            case 0x23: goYellow(); break;
            case 0x24: sendLightStatus(); break;
            default: Serial.println("Can't understand the request received"); break;
        }
    }
}

void goRed() {
    Serial.println("Going RED");
    currentState = RED;
    digitalWrite(red, HIGH);
    digitalWrite(yellow, LOW);
    digitalWrite(green, LOW);
    sendConfirmation();

}

void goYellow() {
    Serial.println("Going YELLOW");
    currentState = YELLOW;
    digitalWrite(red, LOW);
    digitalWrite(yellow, HIGH);
    digitalWrite(green, LOW);
    sendConfirmation();
}

void goGreen() {
    Serial.println("Going GREEN");
    currentState = GREEN;
    digitalWrite(red, LOW);
    digitalWrite(yellow, LOW);
    digitalWrite(green, HIGH);
    sendConfirmation();
}

void sendLightStatus() {}

void sendConfirmation() {
    StaticJsonDocument<200> doc;
    doc["command"] = 90;
    doc["lightID"] = "B2";
    String jsonString;
    serializeJson(doc, jsonString);
    client.println(jsonString);
    client.flush();  // Ensure message is fully sent
}

void connectToWiFi() {
    Serial.print("Connecting to Wi-Fi...");
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) {
        Serial.print(".");
        delay(500);  // Retry connection
    }

    Serial.println("\nConnected to Wi-Fi!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
}
