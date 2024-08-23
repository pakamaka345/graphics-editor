import { HubConnectionBuilder, LogLevel, HubConnection } from '@microsoft/signalr';


class SignalRService {
    private connection: HubConnection;

    constructor(baseUrl: string) {
        this.connection = new HubConnectionBuilder()
            .withUrl(`${baseUrl}/hub`)
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();
    
        this.startConnection();
    }

    private async startConnection() {
        try {
            await this.connection.start();
            console.log(`SignalR connection started: ${this.connection.state}`);
        } catch (error) {
            console.error(`Error starting SignalR connection: ${error}`);
            setTimeout(() => this.startConnection(), 5000);
        }
    }

    public async joinRoom(roomName: string) {
        await this.connection.invoke('JoinRoom', roomName);
    }

    public async leaveRoom(roomName: string) {
        await this.connection.invoke('LeaveRoom', roomName);
    }

    public async sendDrawingChange(points: { x: number, y:number }[], roomName: string) {
        await this.connection.invoke("SendDrawingChange", points, roomName);
    }

    private onDrawingChangeReceived(callback: (points: { x: number, y:number }) => void) {
        this.connection.on("ReceiveDrawingChange", callback);
    }
}

export default SignalRService;