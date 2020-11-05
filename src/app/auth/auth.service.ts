import { Injectable } from "@angular/core";
import { HttpClient} from "@angular/common/http"
import { AuthData } from "./auth-data.model";
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({providedIn: "root"})
export class AuthService{
    private isAuthenticated = false;
    private token: string;
    private tokenTimer: any;
    private authStatusListener = new Subject<boolean>();

    userURL = "http://localhost:3000/api/users";

    constructor(private http: HttpClient, public router: Router) {}

    getToken(){
        return this.token;
    }

    getAuthStatusListener() {
        return this.authStatusListener.asObservable();
    }

    getIsAuth() {
    return this.isAuthenticated;
    }

    createUser(email: string, password: string){
        const AuthData : AuthData = {email: email, password: password};
        let final_userURL = this.userURL+"/signup";
        this.http.post(final_userURL, AuthData)
        .subscribe(
            () => {
                this.router.navigate(['/dashboard/plans']);
            },
            (error) => {
                this.authStatusListener.next(false);
            }
        );
    }

    loginUser(email: string, password: string){
        const AuthData : AuthData = {email: email, password: password};
        let final_userURL = this.userURL+"/login";
        this.http.post<{token : string, expiresIn: number}>(final_userURL, AuthData)
        .subscribe(
            (response) => {
                const token = response.token;
                this.token = token;
                if(token){
                    const expiresInDuration = response.expiresIn;
                    this.setAuthTimer(expiresInDuration);
                    this.isAuthenticated = true;
                    this.authStatusListener.next(true);
                    const now = new Date();
                    const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
                    this.saveAuthData(token,expirationDate);
                    this.router.navigate(['/dashboard/plans']);
                }
                return 
            },
            (error) => {
                this.authStatusListener.next(false);
            }
        );
    }

    autoAuthUser(){
        const authInformation = this.getAuthData();
        if(!authInformation){
            return;
        }
        const now =  new Date();
        const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
        if(expiresIn > 0){
            this.token = authInformation.token;
            this.isAuthenticated = true;
            this.setAuthTimer(expiresIn / 1000);
            this.authStatusListener.next(true);
        }
    }

    logout(){
        this.token = null;
        this.isAuthenticated = false;
        this.authStatusListener.next(false);
        clearTimeout(this.tokenTimer);
        this.clearAuthData();
        this.router.navigate(['/home']);
    }

    private saveAuthData(token: string, expirationDate: Date){
        localStorage.setItem('token',token);
        localStorage.setItem('expiration', expirationDate.toISOString());
    }

    private clearAuthData(){
        localStorage.removeItem('token');
        localStorage.removeItem('expiration');
    }

    private getAuthData(){
        const token = localStorage.getItem("token");
        const expirationDate = localStorage.getItem("expiration");
        if(!token || !expirationDate){
            return;
        }
        return {
            token: token,
            expirationDate: new Date(expirationDate)
        }
    }

    private setAuthTimer(duration : number){
        console.log("Setting Timer: "+ duration);
        setTimeout( () => {
            this.tokenTimer = this.logout();
        }, duration * 1000);
    }
}