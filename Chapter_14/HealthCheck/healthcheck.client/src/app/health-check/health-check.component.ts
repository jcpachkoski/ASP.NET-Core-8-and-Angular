import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { HealthCheckService, Result } from './health-check.service';

@Component({
  selector: 'app-health-check',
  templateUrl: './health-check.component.html',
  styleUrls: ['./health-check.component.scss']
})
export class HealthCheckComponent implements OnInit, OnDestroy {

  public result: Observable<Result | null>;
  // private subscription: Subscription = new Subscription();

  constructor(
    public service: HealthCheckService) {
    this.result = this.service.result;
  }

  ngOnInit() {
    this.service.startConnection();
    this.service.addDataListeners();
  }

  onRefresh() {
    this.service.sendClientUpdate();
  }

  ngOnDestroy() {
    // this.subscription?.unsubscribe();
    console.log("Unsubscribed and destroyed HealthCheckComponent.");
  }
}
