import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { HealthCheckService, Result } from './health-check.service';

@Component({
  selector: 'app-health-check',
  templateUrl: './health-check.component.html',
  styleUrls: ['./health-check.component.scss']
})
export class HealthCheckComponent implements OnInit {

  // This code was tested and all works.  Put in Chapter 15 and deploy it to the Linux Server.
  result$: Observable<Result | null>;

  constructor(public service: HealthCheckService) {
    this.result$ = this.service.result$;
  }

  ngOnInit(): void {
    this.service.startConnection();
    this.service.addDataListeners();
  }

  onRefresh() {
    this.service.sendClientUpdate();
  }

  ngOnDestroy(): void {
    this.service.ngOnDestroy();
  }
}
