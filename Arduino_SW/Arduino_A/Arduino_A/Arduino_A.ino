#include <WiFi101.h>
#include <ArduinoJson.h>

// Replace with your Wi-Fi credentials
#include <ArduinoJson.h>

char ssid[] = "SKA"; 
char password[] = "55333932s"; 


const char* serverIP = "192.168.0.107"; //
const int serverPort = 12345; 
char A1_Status = 'RED';
char A2_Status = 'RED';
uint16_t locX = 0x1234 ;
uint16_t locY = 0x200 ;
// RED 0x00 Yellow _TO_G 0x01 Green 0x02 Yellow_To_Red 0x03
int red = 2 ; 
int yellow =3 ; 
int green = 4 ; 


unsigned long redDuration = 5000;  // Red for 5 seconds
unsigned long yellowDuration = 2000; // Yellow for 2 seconds
unsigned long greenDuration = 5000; // Green for 5 seconds
bool begin = false ; 





enum TrafficLightStatus { RED, YELLOW_TO_GREEN , GREEN , YELLOW_TO_RED , YELLOW };

WiFiClient client;
TrafficLightStatus currentState = RED;

void setup() {
    pinMode(red, OUTPUT);
    pinMode(yellow, OUTPUT);
    pinMode(green, OUTPUT);

  Serial.begin(115200);

 connectToWiFi(); 
 connectToServer(); 
 //client.println("NEW: Light_ID:A1 , Localisation_x:12345 , Localisation_y:1234 , Status:Red");
 //client.println("NEW: Light_ID:A2 , Localisation_x:122345 , Localisation_y:133234 , Status:Red");
//client.flush();
  Serial.println("Messages sent!");
  


}

void loop() {
  // Reconnect if the client is not connected
  if (!client.connected()) {
    Serial.println("Lost connection to server, reconnecting...");
    client.stop();  // Close previous connection
    connectToServer();  // Reconnect to the server
  }

  handleRequests(); // Handle incoming requests from the server
  


  

  
}



unsigned long previousMillis = 0;
const long interval = 500;

void connectToServer() {
  digitalWrite(red, LOW);
  digitalWrite(green, LOW);


  Serial.print("Connecting to server...");
  while (!client.connect(serverIP, serverPort)) {


    unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis; 
   
    digitalWrite(yellow, !digitalRead(yellow));

    
    Serial.println("Connection failed, retrying...");
    delay(100);  
  
}
}
Serial.println("Connected to server!");

}


void connectToWiFi() {
  Serial.print("Connecting to Wi-Fi...");
  while (WiFi.status() != WL_CONNECTED) {
    WiFi.begin(ssid, password);
    delay(5000);
    Serial.print(".");
  }
  Serial.println("\nConnected to Wi-Fi");
}

void sendStatus() {
  // Create a JSON document
  StaticJsonDocument<200> doc;  // Adjust size as needed
  doc["command"] = 60;
  doc["lightID"] = "A2";
  doc["loc_x"] = locX;
  doc["loc_y"] = locY;
  doc["lightStatus"] = currentState;

  // Serialize the JSON document to a string
  String jsonString;
  serializeJson(doc, jsonString);

  // Send the JSON string over the network
  client.println(jsonString);  
  client.flush();
}

void handleRequests(){
if (client.available()){
  char request = client.read();
Serial.print("Received ");
Serial.print(request,HEX);  // Prints request in hex
Serial.println("from server");


  switch(request){
    case 0x20 :  sendStatus(); break ;
    case 0x21 : goRed();break;
    case 0x22 : goGreen(); break ;
    case 0x23:  goYellow();break ;
    case 0x24: sendLightStatus(); break ;
   // case 0x25 : begin() ; break ; 
    default : Serial.println("cant understand the request recieved"); break ;
  }



}
}






//void begin() {
//redDuration = 5000;
//yellowDuration = 2000;
//greenDuration = 5000;
//}

void goRed(){
  Serial.println("going RED");
  currentState = RED ;
  digitalWrite(red,HIGH);
  digitalWrite(yellow,LOW);
  digitalWrite(green,LOW);
 sendConfirmation();




}


  




void goYellow(){
   Serial.println("going YELLOW");
  currentState = YELLOW ;
  digitalWrite(red,LOW);
  digitalWrite(yellow,HIGH);
  digitalWrite(green,LOW);
  sendConfirmation();

}

void goGreen(){
    Serial.println("going Green");
    currentState = GREEN ;
  digitalWrite(red,LOW);
  digitalWrite(yellow,LOW);
  digitalWrite(green,HIGH);
  sendConfirmation();

} 


void sendConfirmation() {
    StaticJsonDocument<200> doc;
    doc["command"] = 90;
    doc["lightID"] = "A2";
    String jsonString;
    serializeJson(doc, jsonString);
    client.println(jsonString);
    client.flush();  // Ensure message is fully sent
}
void blink(){
  Serial.println("blinking");
  

} 
void sendLightStatus(){}


