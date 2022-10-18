int incomingByte = 0; // for incoming serial data

const char HEADER = 'H';
const char TERMINATOR = '\n';
const int PACKET_SIZE = 13;

boolean readingString = false;
int charPointer = 0;
char buffer[PACKET_SIZE] = "";

int relayPins[5] = {8, 9, 10, 11, 12};

const uint8_t OFF_VALUE = HIGH;
const uint8_t ON_VALUE = LOW;

bool first_message_sent = false;


void setup() {
  Serial.begin(115200); // opens serial port, sets data rate to 115200 bps
  Serial.flush();

  for (int i = 0; i < sizeof(relayPins); i++) {
    pinMode(relayPins[i], OUTPUT);    // sets the digital pin as output
    digitalWrite(relayPins[i], OFF_VALUE); // sets the digital pin off
  }
}

void loop() 
{
  if (first_message_sent == false) 
  {
    Serial.println("first_message_sent == false");
    String reply = "Sending: H/P/" + String(0) + "/0";
    Serial.println(reply);
    // Serial.println("{\"Pump1\": \"0\"}");
    first_message_sent = true;
  }

  // send data only when you receive data:
  if (Serial.available() > 0) 
  {
    int incoming = Serial.read();
    Serial.print(char(incoming));
    Serial.print(HEADER);
    Serial.println("");
    
    switch (incoming) {
      case HEADER:
        readingString = true; // Start reading string
        charPointer = 0; // Set the buffer pointer to the start
        buffer[0] = 0; // Make the string empty
        break;

      case TERMINATOR:
        if (readingString) {
          // String message = Serial.readStringUntil(TERMINATOR);
          String message = String(buffer);
          Serial.println("Received: " + message);
          String command = String(message.charAt(1));
          command.toUpperCase();

          // handle message for Pump
          if (command == "P") 
          {
            int pump_index = String(message.charAt(3)).toInt();
            
            String svalue = "";
            for(int k=5; k<PACKET_SIZE - 2; k++){
              svalue += String(message[k]);
            }
            int value = svalue.toInt();

            int relay_pin = relayPins[pump_index];

            String reply = "";
            Serial.println(value);
            if (value > 0) 
            {
              reply = "Sending: H/P/" + String(pump_index) + "/" + String(value);
              Serial.println(reply);
              // Serial.println("{\"Pump1\": \"1\"}");
              digitalWrite(relay_pin, ON_VALUE);  // sets the digital pin 13 off
              delay(value);            // waits for a second

              reply = "Sending: H/P/" + String(pump_index) + "/0";
              Serial.println(reply);
              // Serial.println("{\"Pump1\": \"0\"}");
              digitalWrite(relay_pin, OFF_VALUE); // sets the digital pin 13 on
            } 
            else 
            {
              digitalWrite(relay_pin, OFF_VALUE); // sets the digital pin 13 on
              reply = "Sending: H/P/" + String(pump_index) + "/0";
              Serial.println(reply);
              // Serial.println("{\"Pump1\": \"0\"}");
            }
          }
        }
        readingString = false; // Finish reading
        break;

      default: // Anything that's not > or <
        // If we are reading the string and the buffer isn't full
        if (readingString && charPointer < PACKET_SIZE) {
          // Add the character to the buffer and increment the pointer
          buffer[charPointer++] = incoming;
          buffer[charPointer] = 0; // Don't forget to terminate the string
        }
    }
  }
  // digitalWrite(8, HIGH); // sets the digital pin 13 on
  // delay(1000);            // waits for a second
  // digitalWrite(8, LOW);  // sets the digital pin 13 off
  // delay(1000);            // waits for a second
}