import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { HealthCheckService, Result } from './health-check.service';

@Component({
  selector: 'app-health-check',
  templateUrl: './health-check.component.html',
  styleUrls: ['./health-check.component.scss']
})
export class HealthCheckComponent implements OnInit, OnDestroy {
  // This code was tested and all works.  Put in Chapter 15 and deploy it to the Linux Server.
  result$: Observable<Result | null>;
  constructor(public service: HealthCheckService) {
    this.result$ = this.service.result$;
  }

  ngOnInit(): void {
    this.service.startHubConnection();
    this.service.addDataListeners();
  }

  onRefresh() {
    this.service.sendClientUpdate();
  }

  ngOnDestroy(): void {
    // Necessary or get multiple calls to fetch data after leaving this component and coming back.
    this.service.ngOnDestroy();
  }
}
