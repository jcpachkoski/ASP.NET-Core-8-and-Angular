import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { environment } from '../../environments/environment';

interface WeatherForecast {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}

@Component({
  selector: 'app-fetch-data',
  templateUrl: './fetch-data.component.html',
  styleUrl: './fetch-data.component.scss'
})
export class FetchDataComponent implements OnDestroy {
  subscription?: Subscription;
  public forecasts?: WeatherForecast[];

  constructor(http: HttpClient) {
    this.subscription = http.get<WeatherForecast[]>(environment.baseUrl + 'api/weatherforecast')
      .subscribe(result => {
        this.forecasts = result;
      },
        error => console.error(error));
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    console.log("Unsubscribed and destroyed FetchDataComponent.")
  }
}
