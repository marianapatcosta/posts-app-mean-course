import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from "../../environments/environment"

const BACKEND_URL = `${environment.apiUrl}/user`;

@Injectable({providedIn: 'root'})
export class AuthService {

  private isAuthenticated = false;
  private token: string;
  private tokenTimer: any;
  private userId: string;
  private authStatusListener = new Subject<boolean>();

  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getIsAuthenticated() {
    return this.isAuthenticated;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getUserId(): string {
    return this.userId;
  }

  createUser(email: string, password: string) {
    const authData: AuthData = {
      email,
      password
    };

    this.http.post<{message: string}>(`${BACKEND_URL}/signup`, authData)
    .subscribe(response => {
      this.login(email, password);
      this.router.navigate(['/']);
    }, () => {
      this.authStatusListener.next(false);
    });
  }

  login(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
    this.http
    .post<{ token: string, expiresIn: number, userId: string }>(`${BACKEND_URL}/login`, authData)
      .subscribe(response => {
        this.token = response.token;
        if (this.token) {
          const expiresInDuration = response.expiresIn;
          this.setAuthTimer(expiresInDuration); //comes in seconds
          this.isAuthenticated = true;
          this.userId = response.userId;
          this.authStatusListener.next(true);
          const currentDate = new Date();
          const expirationDate = new Date(currentDate.getTime() + expiresInDuration * 1000);
          this.saveAuthData(this.token, expirationDate, this.userId);
          this.router.navigate(['/']);
        }
      }, () => {
        this.authStatusListener.next(false);
      }
    );
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.userId = null;
    this.router.navigate(['/']);
  }

  autoAuthUser(){
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const currentDate: Date = new Date();
    const expiresIn: number = authInformation.expirationDate.getTime() - currentDate.getTime(); // time in ms
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId = authInformation.userId;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  private setAuthTimer(duration: number) {
    //duration * 100= because it comes from BE in seconds, the argument duration in in seconds
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    if (!token || !expirationDate) {
      return;
    }
    return {
      token,
      expirationDate: new Date(expirationDate),
      userId
    };
  }
}
