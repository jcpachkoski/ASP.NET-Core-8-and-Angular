import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { FormGroup, FormControl, Validators, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { BaseFormComponent } from '../base-form.component';
import { LoginRequest } from './login-request';
import { LoginResult } from './login-result';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent extends BaseFormComponent implements OnInit, OnDestroy {
  title: string = "Login Form";
  // loginForm!: FormGroup; // Use form from the base class, not loginForm.
  loginResult?: LoginResult;
  loginRequest: LoginRequest = { email: '', password: '' };
  subscription?: Subscription;
  errorMessage: string = '';

  constructor( private activatedRoute: ActivatedRoute, private router: Router,
    private authService: AuthService) {
    super();
  }

  ngOnInit() {
    this.buildLoginForm();
  }

  buildLoginForm(): void {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
      });
  }

  onSubmit() {
    if (this.form.valid)
    {
      console.log(this.form.value);
      this.loginRequest.email = this.form.controls['email'].value;
      this.loginRequest.password = this.form.controls['password'].value;

      this.subscription = this.authService.login(this.loginRequest)
        .subscribe({
          next: (result: LoginResult) => {
            console.log(result);
            this.loginResult = result;
            if (result.success) {
              const returnUrl = this.activatedRoute.snapshot.queryParamMap.get('returnUrl') || '/';
              this.router.navigateByUrl(returnUrl);
            }
          },
          error: (err) => {
            console.log(err);
            if (err.status == 401) {
              this.loginResult = err.error;
            }
          },
          complete: () => {
            console.log('Login attempt completed');
          }
        });
      }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    console.log('LoginComponent destroyed');
  }
}
