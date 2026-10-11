import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should default to the teal palette', () => {
    service.init();
    expect(service.currentKey()).toBe('teal');
  });

  it('should apply the selected palette to the document root and persist it', () => {
    service.setTheme('steel');
    expect(service.currentKey()).toBe('steel');
    expect(document.documentElement.style.getPropertyValue('--app-primary')).toBe('#274b63f8');
    expect(localStorage.getItem('app-theme-color')).toBe('steel');
  });

  it('should restore the persisted palette on init', () => {
    localStorage.setItem('app-theme-color', 'wine');
    service.init();
    expect(service.currentKey()).toBe('wine');
    expect(document.documentElement.style.getPropertyValue('--app-primary')).toBe('#4d2533f8');
  });

  it('should fall back to the default palette for an unknown key', () => {
    service.setTheme('does-not-exist');
    expect(service.currentKey()).toBe('teal');
  });

  it('should expose a palette for the current selection', () => {
    service.setTheme('charcoal');
    expect(service.currentPalette().label).toBe('Charcoal');
  });
});
