#!/usr/bin/env python3
import sys, os
import serial
import json
import RPi.GPIO as GPIO

from time import time, sleep, gmtime, strftime

DOSING_PUMP_1 = 24

# DOSE_RATE = 0.3895 # ml/sec at 3.3v
DOSE_RATE = 1.2055 # ml/sec at 12v
DOSE_VOLUME = 2 # ml
DOSE_INTERVAL = 15 # sec
TARGET_TDS = 300



class Pump:
    def __init__(self, ser, pump_index, dose_rate, dose_volume, dose_interval, target_tds):
        self.ser = ser

        self.pump_index = pump_index
        self.does_rate = dose_rate
        self.dose_volume = dose_volume
        self.dose_interval = dose_interval
        self.target_tds = target_tds

        self.last_tds = 0
        self.last_dose_time = time()

    def handle_tds(tds_str):

        t_current = time()
        t_since_last_dose = t_current - self.last_dose_time

        tds = int(tds_str)

        tds_offset = self.target_tds - tds

        print(strftime("%a, %d %b %Y %H:%M:%S +0000", gmtime(t_current)), " |  TDS :", tds_str.ljust(6, ' '), " |   TDS_OFFSET: ", str(tds_offset).ljust(4, ' '), "  |  TIME_TILL_NEXT_DOSE: ", self.dose_interval - t_since_last_dose)

        if (tds_offset > 0):
            if (t_since_last_dose > self.dose_interval):
                print('pump on')

                t_end = t_current + (self.dose_volume / self.does_rate)
                while time() < t_end:
                    self.ser.write("1".encode('utf-8'))

                self.ser.write("0".encode('utf-8'))
                
                self.last_dose_time = time()

        else:
            self.last_dose_time = time()
            self.ser.write("0".encode('utf-8'))

        self.last_tds = tds

if __name__ == '__main__':

    try:  
        # 6ml/15sec
        # .4ml/1sec

        # 10ml/7sec
        # 1.4285ml/sec

        ser = serial.Serial('/dev/ttyACM0', 115200, timeout=1)
        ser.reset_input_buffer()

        pump1 = Pump(ser, pump_index=1, dose_rate=1.2055, dose_volume=2, dose_interval=15, target_tds=300)

        first_message_sent = False

        while True:

            # t_current = time()
            # t_since_last_dose = t_current - LAST_DOSE_TIME

            # tds_str = str(LAST_TDS)
            # tds = LAST_TDS

            if(first_message_sent == False):
                print("Sending pump message \"1\"")
                ser.write("1".encode('utf-8'))
                first_message_sent = True

            if ser.in_waiting > 0:

                line = ser.readline().decode('utf-8').rstrip()
                try:
                    message = json.loads(line)

                    if "TDS" in message:
                        tds_str = message['TDS']
                        pump1.handle_tds(tds_str)
                    
                    if "Pump1" in message:
                        print(message['Pump1'])

                except json.decoder.JSONDecodeError:
                    print("error decoding line: ", line)
            
            sleep(0.1)
    
    except KeyboardInterrupt:  
        # here you put any code you want to run before the program   
        # exits when you press CTRL+C  
        print("\n CTRL+C pressed. Exiting.")
    
    except Exception as e:  
        # this catches ALL other exceptions including errors.  
        # You won't get any error messages for debugging  
        # so only use it once your code is working  
        exc_type, exc_obj, exc_tb = sys.exc_info()
        fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
        print(exc_type, fname, exc_tb.tb_lineno, e)
    
    finally:  
        # GPIO.cleanup() # this ensures a clean exit  
        print("cleanup in finally")
