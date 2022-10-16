#!/usr/bin/env python3
import sys, os
import serial
import json
import RPi.GPIO as GPIO

from time import time, gmtime, strftime

DOSING_PUMP_1 = 24

# DOSE_RATE = 0.3895 # ml/sec at 3.3v
DOSE_RATE = 1.2055 # ml/sec at 12v
DOSE_VOLUME = 2 # ml
DOSE_INTERVAL = 15 # sec
TARGET_TDS = 300

if __name__ == '__main__':

    try:  
        GPIO.setmode(GPIO.BCM)            # choose BCM or BOARD  
        GPIO.setup(DOSING_PUMP_1, GPIO.OUT) # set a port/pin as an output  

        GPIO.output(DOSING_PUMP_1, 1)       # set port/pin value to 1/GPIO.HIGH/True  

        # 6ml/15sec
        # .4ml/1sec

        # 10ml/7sec
        # 1.4285ml/sec

        LAST_TDS = 0
        LAST_DOSE_TIME = time()

        ser = serial.Serial('/dev/ttyACM0', 115200, timeout=1)
        ser.reset_input_buffer()

        print("Sending H/P/0/1\nH/P/1/1\n")
        ser.write("H/P/0/1\n".encode('utf-8'))

        while True:

            if ser.in_waiting > 0:

                break
                t_current = time()
                t_since_last_dose = t_current - LAST_DOSE_TIME

                tds_str = str(LAST_TDS)
                tds = LAST_TDS

                line = ser.readline().decode('utf-8').rstrip()
                try:
                    value = json.loads(line)
                    tds_str = value['TDS']
                    tds = int(tds_str)
                except json.decoder.JSONDecodeError:
                    print("error decoding line: ", line)

                tds_offset = TARGET_TDS - tds

                print(strftime("%a, %d %b %Y %H:%M:%S +0000", gmtime(t_current)), " |  TDS :", tds_str.ljust(6, ' '), " |   TDS_OFFSET: ", str(tds_offset).ljust(4, ' '), "  |  TIME_TILL_NEXT_DOSE: ", DOSE_INTERVAL - t_since_last_dose)

                if (tds_offset > 0):
                    if (t_since_last_dose > DOSE_INTERVAL):
                        print('pump on')

                        t_end = t_current + (DOSE_VOLUME / DOSE_RATE)
                        while time() < t_end:
                            GPIO.output(DOSING_PUMP_1, 0)       # set port/pin value to 0/GPIO.LOW/False  

                        GPIO.output(DOSING_PUMP_1, 1)       # set port/pin value to 1/GPIO.HIGH/True  
                        
                        LAST_DOSE_TIME = time()
                
                else:
                    LAST_DOSE_TIME = time()
                    GPIO.output(DOSING_PUMP_1, 1)       # set port/pin value to 1/GPIO.HIGH/True  

                LAST_TDS = tds
    
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
        print(exc_type, fname, exc_tb.tb_lineno)
    
    finally:  
        GPIO.cleanup() # this ensures a clean exit  