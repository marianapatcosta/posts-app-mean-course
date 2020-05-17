import { AbstractControl } from "@angular/forms";
import { Observable, Observer, of } from "rxjs";

//[key: string] means that we will have a property of type string and that we dont care about property name
export const mimeTypeValidator = (
  control: AbstractControl
): Promise<{ [key: string]: any }> | Observable<{ [key: string]: any }> => {
  if (typeof(control.value) === 'string') {
    // of() adds an observable that emits data immediately
    return of(null);
  }
  const file = control.value as File;
  const fileReader = new FileReader();
  const fileReaderObservable = Observable.create(
    (observer: Observer<{ [key: string]: any }>) => {
      fileReader.addEventListener("loadend", () => {
        // read certain patterns in file and file metadata used to define file type; we do not only check file extension
        //we want to infer the file by "looking at " it; subarray(0,4) alows ti get mime type
        const arr = new Uint8Array(<ArrayBuffer>fileReader.result).subarray(0, 4);
        let header: string = "";
        let isValid: boolean;
        for (let i = 0; i < arr.length; i++) {
          header += arr[i].toString(16);
        }
        switch (header) {
          case "89504e47":
            isValid = true;
            break;
          case "ffd8ffe0":
          case "ffd8ffe1":
          case "ffd8ffe2":
          case "ffd8ffe3":
          case "ffd8ffe8":
            isValid = true;
            break;
          default:
            isValid = false; // Or you can use the blob.type as fallback
            break;
        }
        if (isValid) {
          // emit null if is valid
          observer.next(null);
        } else {
          observer.next({ invalidMimeType: true });
        }
        observer.complete();
      });
      fileReader.readAsArrayBuffer(file);
    }
  );
  return fileReaderObservable;
};
