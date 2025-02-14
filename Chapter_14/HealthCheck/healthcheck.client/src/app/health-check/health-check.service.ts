import { Injectable, OnDestroy} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as signalR from "@microsoft/signalr";
import { environment } from './../../environments/environment';
import { Subject } from 'rxjs';

export interface Result {
  checks: Check[];
  totalStatus: string;
  totalResponseTime: number;
}

interface Check {
  name: string;
  responseTime: number;
  status: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class HealthCheckService implements OnDestroy {
  constructor(private http: HttpClient) { }

  private hubConnection!: signalR.HubConnection;
  private _result: Subject<Result> = new Subject<Result>();
  public result$ = this._result.asObservable();

  /* Starts the SignalR connection. */
  startConnection(): void {
    // if (!this.hubConnection) {
      this.hubConnection = new signalR.HubConnectionBuilder()
        .configureLogging(signalR.LogLevel.Information)
        .withUrl(environment.baseUrl + 'api/health-hub', { withCredentials: false })
        .build();

      console.log("Starting connection...");
      this.hubConnection
        .start()
        .then(() => console.log("Connection started."))
        .catch((err: any) => console.error("Error starting connection: ", err));
    // }
      this.updateData();
  }

  /* Adds listeners for data updates from the server. */
  addDataListeners(): void {
    console.log('Adding listeners');
    this.hubConnection.on('Update', (msg: string) => {
      console.log("Update issued by SERVER for: " + msg);
      this.updateData();
    });

    this.hubConnection.on('ClientUpdate', (msg: string) => {
      console.log("Update issued by CLIENT for: " + msg);
      this.updateData();
    });
  }

  /* Fetches the latest health check data from the server. */
  updateData(): void {
    console.log("Fetching data...");
    this.http.get<Result>(environment.baseUrl + 'api/health')
      .subscribe(result => {
        this._result.next(result);
        console.log(result);
      });
  }

  /* Sends a client update to the server. */
  sendClientUpdate(): void {
    this.hubConnection.invoke('ClientUpdate', 'client test')
      .catch(err => console.error("Error sending client update: ", err));
  }

  /* Cleans up subscriptions and connections. */
  ngOnDestroy(): void {
    if (this.hubConnection) {
      this.hubConnection.stop().catch(err => console.error("Error stopping connection: ", err));
    }
    console.log("Stopped hub connection.");
  }
}
