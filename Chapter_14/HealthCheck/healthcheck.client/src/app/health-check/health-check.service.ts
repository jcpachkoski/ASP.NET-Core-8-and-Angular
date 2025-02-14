import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as signalR from "@microsoft/signalr";
import { environment } from './../../environments/environment';
import { Observable, Subject, Subscription } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HealthCheckService implements OnDestroy {

  private hubConnection!: signalR.HubConnection;
  private _result: Subject<Result> = new Subject<Result>();
  public result = this._result.asObservable();
  private subscriptions: Subscription = new Subscription();

  constructor(private http: HttpClient) { }

  /**
   * Starts the SignalR connection.
   */
  public startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .configureLogging(signalR.LogLevel.Information)
      .withUrl(environment.baseUrl + 'api/health-hub', { withCredentials: false })
      .build();

    console.log("Starting connection...");
    this.hubConnection
      .start()
      .then(() => console.log("Connection started."))
      .catch((err: any) => console.error("Error starting connection: ", err));

    this.addDataListeners();
    this.updateData();
  }

  /**
   * Adds listeners for data updates from the server.
   */
  public addDataListeners(): void {
    this.hubConnection.on('Update', (msg: string) => {
      console.log("Update issued by SERVER for the following reason: " + msg);
      this.updateData();
    });

    this.hubConnection.on('ClientUpdate', (msg: string) => {
      console.log("Update issued by CLIENT for the following reason: " + msg);
      this.updateData();
    });
  }

  /**
   * Fetches the latest health check data from the server.
   */
  public updateData(): void {
    console.log("Fetching data...");
    const subscription = this.http.get<Result>(environment.baseUrl + 'api/health')
      .pipe(
        tap(result => {
          this._result.next(result);
          console.log(result);
        }),
        catchError(err => {
          console.error("Error fetching data: ", err);
          throw err;
        })
      )
      .subscribe();

    this.subscriptions.add(subscription);
  }

  /**
   * Sends a client update to the server.
   */
  public sendClientUpdate(): void {
    this.hubConnection.invoke('ClientUpdate', 'client test')
      .catch(err => console.error("Error sending client update: ", err));
  }

  /**
   * Cleans up subscriptions and connections.
   */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.hubConnection) {
      this.hubConnection.stop().catch(err => console.error("Error stopping connection: ", err));
    }
  }
}

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
