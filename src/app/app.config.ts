import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ThemeService } from './service/theme.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withXhr()),
    provideNativeDateAdapter(),
    provideAppInitializer(() => inject(ThemeService).init())
  ],
};
