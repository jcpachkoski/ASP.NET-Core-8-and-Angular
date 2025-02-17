import { Injectable, OnDestroy} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as signalR from "@microsoft/signalr";
import { environment } from './../../environments/environment';
import { Subject, of } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';

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

  private keepAliveConnection: boolean = true;
  private hubConnection!: signalR.HubConnection;
  private _result: Subject<Result> = new Subject<Result>();
  public readonly result$ = this._result.asObservable();
  private destroyed$ = new Subject<void>();

  private log(message: any, optionalParam?: any): void {
    if (!environment.production) {
      console.log(message);
    }
  }

  startHubConnection(): void {
      if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
        this.doSetup();
        return;
      }

      this.hubConnection = new signalR.HubConnectionBuilder()
        .configureLogging(signalR.LogLevel.Information)
        .withUrl(environment.baseUrl + 'api/health-hub', { withCredentials: false })
      .build();

      this.log("Starting connection...");
      this.hubConnection
        .start()
        .then(() => this.log("Connection started."))
      .catch((err: any) => this.log("Error starting connection: ", err));

      this.doSetup();
  }

  doSetup(): void {
    this.getHealthChecks();
    this.addDataListeners();
  }

  addDataListeners(): void {
    this.log('Adding listeners');
    this.hubConnection.on('Update', (msg: string) => {
      this.log("Update issued by SERVER for: " + msg);
      this.getHealthChecks();
    });

    this.hubConnection.on('ClientUpdate', (msg: string) => {
      this.log("Update issued by CLIENT for: " + msg);
      this.getHealthChecks();
    });

    this.hubConnection.onclose(error => {
      if (this.keepAliveConnection) {
        this.log("Connection closed due to error...reconnecting: ", error);
        setTimeout(() => this.startHubConnection(), 3);
      }
    });
  }

  getHealthChecks(): void {
    this.log("Fetching data...");
    this.http.get<Result>(environment.baseUrl + 'api/health')
      .pipe(
        takeUntil(this.destroyed$),
        catchError(error => {
          this.log("Error fetching health checks: ", error);
          return of({ checks: [], totalStatus: "unknown", totalResponseTime: 0 });
        })
      )
      .subscribe(result => {
        this._result.next(result);
        this.log(result);
      });
  }

  sendClientUpdate(): void {
    this.hubConnection.invoke('ClientUpdate', 'client test')
      .catch(err => this.log("Error sending client update: ", err));
  }

  stopHubConnection(): void {
    if (this.hubConnection && this.hubConnection.state !== signalR.HubConnectionState.Disconnected) {
      this.hubConnection.stop()
        .then(() => this.log("Connection stopped."))
        .catch(err => this.log("Error stopping connection: ", err));
    }
  }

  removeDataListeners(): void {
    this.hubConnection.off('Update');
    this.hubConnection.off('ClientUpdate');
  }

  ngOnDestroy(): void {
    this.keepAliveConnection = false;
    this.removeDataListeners();
    this.stopHubConnection();
    this.destroyed$.next();
    this.destroyed$.complete();
    this.log("Unsubscribed in HealthCheckService.");
  }
}
