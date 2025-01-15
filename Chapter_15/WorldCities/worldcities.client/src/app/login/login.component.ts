import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { FormBuilder, Validators } from '@angular/forms';
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
  passwordFocused: boolean = false;
  // loginForm!: FormGroup; // Use form from the base class, not loginForm.
  loginResult: LoginResult = { success: false, token: '', message: ''};
  loginRequest: LoginRequest = { email: '', password: '' };
  subscription?: Subscription;
  errorMessage: string = '';

  constructor(private activatedRoute: ActivatedRoute, private router: Router,
    private fb: FormBuilder, private authService: AuthService)
  {
    super();
  }

  ngOnInit(): void {
    this.authService.logout();
    this.buildLoginForm();
    console.log('Login form initialized');
  }

  buildLoginForm(): void {
    // this.form is the base-form in the base class.
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit() {
    if (this.form.valid)
    {
      console.log(this.form.value);

      /*
      this.loginRequest.email = this.form.controls['email'].value;
      this.loginRequest.password = this.form.controls['password'].value;
      */

      this.loginRequest = { email: this.form.value.email, password: this.form.value.password }

      this.subscription = this.authService.login(this.loginRequest)
        .subscribe({
          next: (result: LoginResult) => {
            console.log(result);
            this.loginResult = result;
            if (this.loginResult.success) {
              const returnUrl = this.activatedRoute.snapshot.queryParamMap.get('returnUrl') || '/';
              this.router.navigateByUrl(returnUrl);
              this.form.reset();
              this.router.navigateByUrl(returnUrl);
            }
          },
          error: (err) => {
            console.log(err);
            // console.error('Error attempting to login: ', err.error);
            if (err.status == 401) {
              this.loginResult = err.error;
              this.errorMessage = 'Invalid email or password. Please try again';
            }
          },
          complete: () => {
            console.log('Login attempt completed');
          }
        });
      }
  }

  onCancel(): void {
    this.form.reset();
    console.log('Form was reset');
    // this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    console.log('LoginComponent destroyed');
  }
}
