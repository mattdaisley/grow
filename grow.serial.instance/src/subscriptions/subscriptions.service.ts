import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { exec } from 'child_process'
import { io, Socket } from "socket.io-client";
import { BinaryValue, Gpio } from 'onoff';
import * as fs from 'fs/promises'
import * as os from 'node:os'
import * as SerialNumber from 'serial-number'

@Injectable()
export class SubscriptionsService implements OnModuleDestroy {
  private Socket: Socket;

  public DeviceSerial: string;

  public DeviceName: string;

  constructor(private configService: ConfigService) {
    this.initialize();
  }

  onModuleDestroy() {
    const self = this;

    console.log(`The module is being destroyed.`);
  }

  private async initialize(): Promise<void> {
    const self = this;

    console.log('SubscriptionsService initializing...');

    await this.setDeviceInfo();
    console.log(`SubscriptionsService initialized DeviceName: ${this.DeviceName}`);

    const websocketHost = this.configService.get<string>('WEBSOCKET_HOST');
    this.Socket = io(websocketHost)
    this.Socket.on(`connect`, self.handleConnectEvent.bind(self)); 
    // this.Socket.on(`discover`, self.handleDiscoverEvent.bind(self));
    // this.Socket.on(`gpio-config`, self.handleGpioCommand.bind(self));
    // this.Socket.on(`gpio-command`, self.handleGpioCommand.bind(self));
  }

  private async handleConnectEvent(): Promise<void> {
    console.log(
      `SubscriptionsService Socket id: '${this.Socket?.id}' connected: ${this.Socket?.connected}`,
    );
  }

  private async setDeviceInfo(): Promise<void> {
    const self = this;

    let serialNumber = '';

    try {
      serialNumber = await this.getWindowsSerialNumber();
      self.DeviceSerial = serialNumber;
      self.DeviceName = `windows - ${serialNumber}`;
      return;
    } catch (e) {
      console.log('windows serial error: ', e);
    }

    try {
      serialNumber = await this.getRaspiSerialNumber();
      self.DeviceSerial = serialNumber;
      self.DeviceName = `raspi - ${serialNumber}`;
      return;
    } catch (e) {
      console.log('raspi serial error: ', e);
    }

    try {
      serialNumber = await this.getMacSerialNumber();
      self.DeviceSerial = serialNumber;
      self.DeviceName = `mac - ${serialNumber}`;
      return;
    } catch (e) {
      console.log('mac serial error: ', e);
    }

    self.DeviceSerial = 'unknown';
    self.DeviceName = 'unknown';
  }

  private async getRaspiSerialNumber(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        exec(
          `cat /proc/cpuinfo | grep Serial | cut -d ":" -f2`,
          async (error, stdout, stderr) => {
            console.log('raspi info: ', { error, stdout, stderr });
            if (error) {
              console.log(`error: ${error.message}`);
              reject(error);
              return;
            }
            if (stderr) {
              reject(stderr);
              return;
            }

            const serial = stdout.trim().replace('"', '').replace('"', '');

            resolve(serial);
          },
        );
    });
  }

  private async getMacSerialNumber(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      exec(
        `ioreg -l | grep IOPlatformSerialNumber | cut -d "=" -f2`,
        async (error, stdout, stderr) => {
          if (error) {
            console.log(`error: ${error.message}`);
            reject(error);
            return;
          }
          if (stderr) {
            console.log(`stderr: ${stderr}`);
            reject(error);
            return;
          }

          const serial = stdout.trim().replace('"', '').replace('"', '');

          resolve(`mac - ${serial}`);
        },
      );
    });
  }

  private async getWindowsSerialNumber(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        SerialNumber((err, value) => {
            if (err) {
                console.log('serial number error: ', err);
                reject(err);
                return;
            }
            resolve(value);
        });
    });
  }
}
