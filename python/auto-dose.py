#!/usr/bin/env python3
import sys, os
import serial
import json
import RPi.GPIO as GPIO

from time import time, sleep, gmtime, strftime


HEADER = b'H'
PACKET_SIZE = 8

DOSING_PUMP_1 = 0
DOSING_PUMP_2 = 1
DOSING_PUMP_3 = 2

# DOSE_RATE = 0.3895 # ml/sec at 3.3v
DOSE_RATE = 1.2055 # ml/sec at 12v
DOSE_VOLUME = 2 # ml
DOSE_INTERVAL = 15 # sec
TARGET_TDS = 300



class Pump:
    def __init__(self, serial_port, pump_index, dose_rate, dose_volume, dose_interval, target_tds):
        self.serial_port = serial_port

        self.pump_index = pump_index
        self.does_rate = dose_rate
        self.dose_volume = dose_volume
        self.dose_interval = dose_interval
        self.target_tds = target_tds

        self.last_tds = 0
        self.last_dose_time = time()

    def send_dose(self, dose_volume):
        message = "H/P/" + str(self.pump_index) + "/1\n"
        self.serial_port.write(message.encode('utf-8'))


    def handle_tds(self, tds_str):

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
                    self.serial_port.write("H/P/1/1\n".encode('utf-8'))

                self.serial_port.write("H/P/1/0\n".encode('utf-8'))
                
                self.last_dose_time = time()

        else:
            self.last_dose_time = time()
            self.serial_port.write("H/P/1/0\n".encode('utf-8'))

        self.last_tds = tds

if __name__ == '__main__':

    try:  
        # 6ml/15sec
        # .4ml/1sec

        # 10ml/7sec
        # 1.4285ml/sec

        serial_port = serial.Serial('/dev/ttyACM0', 115200, timeout=1)
        serial_port.reset_input_buffer()

        pump1 = Pump(serial_port, pump_index=0, dose_rate=1.2055, dose_volume=2, dose_interval=15, target_tds=300)
        pump2 = Pump(serial_port, pump_index=1, dose_rate=1.2055, dose_volume=2, dose_interval=15, target_tds=300)
        pump3 = Pump(serial_port, pump_index=2, dose_rate=1.2055, dose_volume=2, dose_interval=15, target_tds=300)

        first_message_sent = False

        while True:

            # t_current = time()
            # t_since_last_dose = t_current - LAST_DOSE_TIME

            # tds_str = str(LAST_TDS)
            # tds = LAST_TDS

            if(serial_port.in_waiting > 0):

                if(first_message_sent == False):
                    pump1.send_dose(1)

                    pump2.send_dose(1)

                    pump3.send_dose(1)

                    first_message_sent = True

                incoming = serial_port.read()

                if (incoming == HEADER):

                    message = serial_port.readline().decode('utf-8').rstrip()
                    print("Received message:",message)
                    try:
                        command = message[1]

                        if (command == 'T'):
                            tds_str = message['TDS']
                            pump1.handle_tds(tds_str)
                        
                        if (command.upper() == "P"):
                            pump_index = message[3]
                            value = message[5]

                    except json.decoder.JSONDecodeError:
                        print("error decoding line:", message)
                else:
                    print("Message recieved did not begin with HEADER", incoming)
            
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
