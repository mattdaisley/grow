export declare class SerialService {
    private port;
    private paths;
    private currentPathIndex;
    private pumpsReady;
    constructor();
    private createSerialPort;
    private isPortOpen;
    private isPortReady;
    private handlePortData;
    write(message: string): Promise<void>;
    private sleep;
}
