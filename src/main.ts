import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component'; // <-- CORRECTED IMPORT

bootstrapApplication(AppComponent, appConfig) // <-- CORRECTED USAGE
  .catch((err) => console.error(err));
