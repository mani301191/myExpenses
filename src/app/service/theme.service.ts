import { Injectable, signal } from '@angular/core';

export interface ThemePalette {
  key: string;
  label: string;
  /* Main colour used for backgrounds, text and borders */
  primary: string;
  /* Fully opaque shade used for shadows, borders and swatches */
  solid: string;
  /* Lighter shade used for the print header */
  light: string;
}

const STORAGE_KEY = 'app-theme-color';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  readonly palettes: ThemePalette[] = [
    { key: 'teal', label: 'Teal', primary: '#075068f8', solid: '#075068', light: '#76a8b8f8' },
    { key: 'gunmetal', label: 'Gunmetal', primary: '#3b4a52f8', solid: '#3b4a52', light: '#7d919cf8' },
    { key: 'steel', label: 'Deep Steel', primary: '#274b63f8', solid: '#274b63', light: '#7ba3bdf8' },
    { key: 'charcoal', label: 'Charcoal', primary: '#42484df8', solid: '#42484d', light: '#8a9297f8' },
    { key: 'bronze', label: 'Dark Bronze', primary: '#5a4121f8', solid: '#5a4121', light: '#94784af8' },
    { key: 'copper', label: 'Burnt Copper', primary: '#714736f8', solid: '#714736', light: '#a97d68f8' },
    { key: 'wine', label: 'Dark Wine', primary: '#4d2533f8', solid: '#4d2533', light: '#9a6476f8' }
  ];

  readonly currentKey = signal<string>(this.palettes[0].key);

  init(): void {
    let key = this.palettes[0].key;
    try {
      key = localStorage.getItem(STORAGE_KEY) ?? key;
    } catch {
      /* storage unavailable - fall back to default */
    }
    this.apply(key);
  }

  setTheme(key: string): void {
    this.apply(key);
    try {
      localStorage.setItem(STORAGE_KEY, this.currentKey());
    } catch {
      /* storage unavailable - selection is not persisted */
    }
  }

  currentPalette(): ThemePalette {
    return this.palettes.find(p => p.key === this.currentKey()) ?? this.palettes[0];
  }

  private apply(key: string): void {
    const palette = this.palettes.find(p => p.key === key) ?? this.palettes[0];
    const root = document.documentElement;
    root.style.setProperty('--app-primary', palette.primary);
    root.style.setProperty('--app-primary-solid', palette.solid);
    root.style.setProperty('--app-primary-light', palette.light);
    this.currentKey.set(palette.key);
  }

}
