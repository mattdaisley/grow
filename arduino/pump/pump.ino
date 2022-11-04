const boolean DEBUG = false;

#define TdsSensorPin A1
#define VREF 5.0             // analog reference voltage(Volt) of the ADC
#define SCOUNT  30           // sum of sample point
int analogBuffer[SCOUNT];    // store the analog value in the array, read from ADC
int analogBufferTemp[SCOUNT];
int analogBufferIndex = 0, copyIndex = 0;
float averageVoltage = 0, tdsValue = 0;
float temperature = 21.3, tdsOffset = 0.0372;  // defaults 25 and 0.02
bool enableTDS = true;

int incomingByte = 0; // for incoming serial data

const char HEADER = 'H';
const char TERMINATOR = '\n';
const int PACKET_SIZE = 15;

boolean readingString = false;
int charPointer = 0;
char buffer[PACKET_SIZE] = "";
bool first_message_sent = false;

#define NUM_RELAYS 5
int relayPins[NUM_RELAYS]                        = {8, 9, 10, 11, 12};
int relayCommandLimits[NUM_RELAYS]               = {0, 0, 0, 0, 0};
unsigned long relayCommandTimepoints[NUM_RELAYS] = {0, 0, 0, 0, 0};

const uint8_t OFF_VALUE = LOW;
const uint8_t ON_VALUE = HIGH;


unsigned long loopTimepoint;

void setup() {
  Serial.begin(115200); // opens serial port, sets data rate to 115200 bps
  Serial.flush();

  pinMode(TdsSensorPin, INPUT);

  for (int i = 0; i < NUM_RELAYS; i++) {
    pinMode(relayPins[i], OUTPUT);    // sets the digital pin as output
    digitalWrite(relayPins[i], OFF_VALUE); // sets the digital pin off

    relayCommandLimits[i] = 0;
    relayCommandTimepoints[i] = 0;
  }
}

void loop() 
{
  String reply = "";

  if (first_message_sent == false) 
  {
    reply = "H/P/" + String(0) + "/0";
    Serial.println(reply);
    // Serial.println("{\"Pump1\": \"0\"}");
    first_message_sent = true;
  }

  if (enableTDS) {
    static unsigned long analogSampleTimepoint = millis();
    if (millis() - analogSampleTimepoint > 40U)  //every 40 milliseconds, read the analog value from the ADC
    {
      analogSampleTimepoint = millis();
      analogBuffer[analogBufferIndex] = analogRead(TdsSensorPin);    //read the analog value and store into the buffer
      analogBufferIndex++;
      if (analogBufferIndex == SCOUNT)
        analogBufferIndex = 0;
    }

    static unsigned long printTimepoint = millis();
    if (millis() - printTimepoint > 800U)
    {
      printTimepoint = millis();
      for (copyIndex = 0; copyIndex < SCOUNT; copyIndex++) 
      {
        analogBufferTemp[copyIndex] = analogBuffer[copyIndex];
      }
      averageVoltage = getMedianNum(analogBufferTemp, SCOUNT) * (float)VREF / 1024.0; // read the analog value more stable by the median filtering algorithm, and convert to voltage value
      
      reply = "H/S/0/" + String(averageVoltage);
      Serial.println(reply);
    }
  }


  loopTimepoint = millis();

  if (DEBUG) {
    Serial.println("checking relay commands " + String(NUM_RELAYS));
  }
  for (int i = 0; i < NUM_RELAYS; i++) {

    if (DEBUG) {
      Serial.println("relayCommands:" + String(relayCommandLimits[i]));
    }

    if (relayCommandLimits[i] > 0) {

      if (loopTimepoint - relayCommandTimepoints[i] > relayCommandLimits[i]) {
        reply = "H/P/" + String(i) + "/0";
        Serial.println(reply);
        digitalWrite(relayPins[i], OFF_VALUE); // sets the digital pin 13 on

        relayCommandLimits[i] = 0;
        relayCommandTimepoints[i] = 0;
      }
    }
  }

  // send data only when you receive data:
  if (Serial.available() > 0) 
  {
    int incoming = Serial.read();
    if (DEBUG) {
      Serial.print(char(incoming));
      Serial.print(HEADER);
      Serial.println("");
    }
    
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
          if (DEBUG) {
            Serial.println("Received: " + message);
          }
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
            unsigned long value = atol(svalue.c_str());

            int relay_pin = relayPins[pump_index];
            if (DEBUG) {
              Serial.println(value);
            }
            if (value > 0) 
            {
              reply = "H/P/" + String(pump_index) + "/" + String(value);
              Serial.println(reply);
              // Serial.println("{\"Pump1\": \"1\"}");
              digitalWrite(relay_pin, ON_VALUE);  // sets the digital pin 13 off

              relayCommandLimits[pump_index] = value;
              relayCommandTimepoints[pump_index] = loopTimepoint;

              // delay(value);            // waits for specified ms

              // reply = "H/P/" + String(pump_index) + "/0";
              // Serial.println(reply);
              // // Serial.println("{\"Pump1\": \"0\"}");
              // digitalWrite(relay_pin, OFF_VALUE); // sets the digital pin 13 on
            } 
            else 
            {
              digitalWrite(relay_pin, OFF_VALUE); // sets the digital pin 13 on
              reply = "H/P/" + String(pump_index) + "/0";
              Serial.println(reply);
              
              relayCommandLimits[pump_index] = 0;
              relayCommandTimepoints[pump_index] = 0;
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
}


int getMedianNum(int bArray[], int iFilterLen)
{
  int bTab[iFilterLen];
  for (byte i = 0; i < iFilterLen; i++)
    bTab[i] = bArray[i];
  int i, j, bTemp;
  for (j = 0; j < iFilterLen - 1; j++)
  {
    for (i = 0; i < iFilterLen - j - 1; i++)
    {
      if (bTab[i] > bTab[i + 1])
      {
        bTemp = bTab[i];
        bTab[i] = bTab[i + 1];
        bTab[i + 1] = bTemp;
      }
    }
  }
  if ((iFilterLen & 1) > 0)
    bTemp = bTab[(iFilterLen - 1) / 2];
  else
    bTemp = (bTab[iFilterLen / 2] + bTab[iFilterLen / 2 - 1]) / 2;
  return bTemp;
}