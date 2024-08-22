import { HubConnectionBuilder, LogLevel, HubConnection } from '@microsoft/signalr';


class SignalRService {
    private connection: HubConnection;

    constructor(string baseUrl) {
        this.connection = new HubConnectionBuilder()
    }
}