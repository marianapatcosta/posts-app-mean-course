import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from "@angular/common/http";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ErrorComponent } from './error/error.component';

// All the requests made by the app are intercepted and if the error response, this interceptor should kick in
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private dialog: MatDialog) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // here we listen the response, which is given by handle()
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        /*console.log(error);
        alert(error.error.error.message); */
        let errorMessage: string = 'An unknown error occurred!';
        if (error.error.message) {
          errorMessage = error.error.message;
        }
        this.dialog.open(ErrorComponent, {data: {message: errorMessage}});
        //generates a new observable with the error
        return throwError(error);
      })
    );
  }
}
