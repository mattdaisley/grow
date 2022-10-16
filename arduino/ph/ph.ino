#define SensorPin 0
#define Offset 24.01

bool graph = true;

unsigned long int sampleVAverage;

const int vAverageSampleSize = 10;
float vAverageBuffer[vAverageSampleSize];
int vAverageCurrentIndex = 0;
float vAverage = 3;

const int phAverageSampleSize = 10;
float phAverageBuffer[phAverageSampleSize];
int phAverageCurrentIndex = 0;
float phAverage = 7;

void setup() {
  // put your setup code here, to run once:
  //pinMode(13, OUTPUT);
  pinMode(SensorPin, INPUT);
  Serial.begin(9600);

  if (!graph) {
    Serial.print("Ready");
    Serial.println("");
  }
}

void loop() {
  // read anolog input and save to buffer
  int buf[10];
  for(int i=0;i<10;i++) {
    buf[i]=analogRead(SensorPin); 

    if (!graph) {
      Serial.print((float)buf[i] * 5.0/1024, 2);
      Serial.print(", ");
    }
    delay(10);
  }
  Serial.println("");

  // calculate sample average analog value
  for(int i=0;i<9;i++) {
    for(int j=i+1;j<10;j++) {
      if(buf[i]>buf[j]) {
        int temp = buf[i];
        buf[i] = buf[j];
        buf[j] = temp;
      }
    }
  }

  sampleVAverage=0;
  for(int i=2;i<8;i++) {
    sampleVAverage += buf[i];
  }

  // convert sample analog value to voltage
  float voltage = (float)sampleVAverage * 5.0/1024/6;

  if (!graph) {
    Serial.print("v:");
  }

  Serial.print(voltage, 4);
  Serial.print(" ");

  // calculate average voltage
  vAverageBuffer[vAverageCurrentIndex] = voltage;

  float vSum = 0;
  for (int i = 0; i < vAverageSampleSize; i++) {
    vSum += vAverageBuffer[i];
  }

  vAverage = vSum / vAverageSampleSize;

  if (vAverageCurrentIndex == vAverageSampleSize) {
    vAverageCurrentIndex = 0;
  }
  else {
    vAverageCurrentIndex++;
  }
  
  if (!graph) {
    Serial.print("average v:");
  }
  Serial.print(vAverage, 4);

  Serial.print(" ");

  // convert to PH value
  float phValue = -5.76 * voltage + Offset;

  if (!graph) {
    Serial.print("pH:");
  }

  Serial.print(phValue, 2);
  Serial.print(" ");

  // calculate average ph value
  phAverageBuffer[phAverageCurrentIndex] = phValue;

  float phSum = 0;
  for (int i = 0; i < phAverageSampleSize; i++) {
    phSum += phAverageBuffer[i];
  }

  phAverage = phSum / phAverageSampleSize;

  if (phAverageCurrentIndex == phAverageSampleSize) {
    phAverageCurrentIndex = 0;
  }
  else {
    phAverageCurrentIndex++;
  }
  
  if (!graph) {
    Serial.print("average pH:");
  }
  Serial.print(phAverage, 2);

  // new line
  if (!graph) {
    Serial.println("");
  }

  delay(900);
}
