import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly httpClient = inject(HttpClient);

  verifyEmail(data: object): Observable<any> {
    return this.httpClient.post(environment.baseUrl + 'auth/send-email-verification', data);
  }
  confirmEmail(data: object): Observable<any> {
    return this.httpClient.post(environment.baseUrl + 'auth/confirm-email-verification', data);
  }
  registerForm(data: object): Observable<any> {
    return this.httpClient.post(environment.baseUrl + 'auth/register', data);
  }

  loginForm(data: object): Observable<any> {
    return this.httpClient.post(environment.baseUrl + 'auth/login', data);
  }
  submitVerifyEmail(data: object): Observable<any> {
    return this.httpClient.post(environment.baseUrl + 'auth/forgot-password', data);
  }
  
  submitResetPassword(data: object): Observable<any> {
    return this.httpClient.post(environment.baseUrl + 'auth/reset-password', data);
  }
}
