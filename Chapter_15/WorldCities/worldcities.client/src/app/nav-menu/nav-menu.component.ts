import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.scss'
})
export class NavMenuComponent implements OnInit, OnDestroy {

  private destroySubject = new Subject();
  isLoggedIn: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.authStatus$
      .pipe(takeUntil(this.destroySubject))
      .subscribe(result => {
        this.isLoggedIn = result;
      })
  }
  
  onLogout(): void {
    this.authService.logout();
    this.router.navigate(["/"]);
  }

  ngOnDestroy() {
    this.destroySubject.next(true);
    this.destroySubject.complete();
  }
}
