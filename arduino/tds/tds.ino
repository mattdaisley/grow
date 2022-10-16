#define TdsSensorPin A1
#define VREF 5.0             // analog reference voltage(Volt) of the ADC
#define SCOUNT  30           // sum of sample point
int analogBuffer[SCOUNT];    // store the analog value in the array, read from ADC
int analogBufferTemp[SCOUNT];
int analogBufferIndex = 0, copyIndex = 0;
float averageVoltage = 0, tdsValue = 0, temperature = 25;

int incomingByte = 0; // for incoming serial data

int relayPin1 = 8;
bool first_message_sent = false;

void setup()
{
  Serial.begin(115200);
  
  pinMode(TdsSensorPin, INPUT);

  pinMode(relayPin1, OUTPUT);    // sets the digital pin 8 as output
}

void loop()
{
  static unsigned long analogSampleTimepoint = millis();
  if (millis() - analogSampleTimepoint > 40U)  //every 40 milliseconds,read the analog value from the ADC
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
      analogBufferTemp[copyIndex] = analogBuffer[copyIndex];
    averageVoltage = getMedianNum(analogBufferTemp, SCOUNT) * (float)VREF / 1024.0; // read the analog value more stable by the median filtering algorithm, and convert to voltage value
    float compensationCoefficient = 1.0 + 0.02 * (temperature - 25.0); //temperature compensation formula: fFinalResult(25^C) = fFinalResult(current)/(1.0+0.02*(fTP-25.0));
    float compensationVolatge = averageVoltage / compensationCoefficient; //temperature compensation
    tdsValue = (133.42 * compensationVolatge * compensationVolatge * compensationVolatge - 255.86 * compensationVolatge * compensationVolatge + 857.39 * compensationVolatge) * 0.5; //convert voltage value to tds value
    //Serial.print("voltage:");
    //Serial.print(averageVoltage,2);
    //Serial.print("V   ");
    Serial.print("{\"TDS\": \"");
    Serial.print(tdsValue, 0);
    Serial.println("\"}");
  }


  if (first_message_sent == false) {
    digitalWrite(relayPin1, HIGH); // sets the digital pin 13 on
    Serial.println("{\"Pump1\": \"0\"}");
    first_message_sent = true;
  }

  // send data only when you receive data:
  if (Serial.available() > 0) {
    String teststr = Serial.readString();  //read until timeout
    teststr.trim();                        // remove any \r \n whitespace at the end of the String
    if (teststr == "1") {
      Serial.println("{\"Pump1\": \"1\"}");
      digitalWrite(relayPin1, LOW);  // sets the digital pin 13 off
      delay(1000);            // waits for a second
      Serial.println("{\"Pump1\": \"0\"}");
      digitalWrite(relayPin1, HIGH); // sets the digital pin 13 on
    } else {
      digitalWrite(relayPin1, HIGH); // sets the digital pin 13 on
      Serial.println("{\"Pump1\": \"0\"}");
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