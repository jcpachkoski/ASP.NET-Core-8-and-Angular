import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Observable, Subscription, interval } from 'rxjs';
import { HealthCheckService, Result } from './health-check.service';
// import { ChangeDetectionStrategy } from '@angular/compiler';

@Component({
  selector: 'app-health-check',
  templateUrl: './health-check.component.html',
  styleUrls: ['./health-check.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HealthCheckComponent implements OnInit, OnDestroy {
  // This code was tested and all works, so can deploy it to the Linux Server.
  result$: Observable<Result | null>;
  private intervalSubscription: Subscription | undefined;

  constructor(public service: HealthCheckService) {
    this.result$ = this.service.result$;
  }

  ngOnInit(): void {
    this.service.startHubConnection();
    this.startInterval();
  }

  startInterval(): void {
    this.intervalSubscription = interval(15000).subscribe(() => {
      this.service.sendClientUpdate();
    });
  }

  stopInterval(): void {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }

  onRefresh(): void {
    this.service.sendClientUpdate();
  }

  ngOnDestroy(): void {
    this.stopInterval();
    // Necessary or get multiple calls to fetch data
    // after leaving this component and coming back.
    this.service.ngOnDestroy();
  }
}
