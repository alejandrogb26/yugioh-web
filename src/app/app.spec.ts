import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { App } from './app';

@Component({ template: '<h1>Test page</h1>' })
class TestPage {}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the application header', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.site-header')?.textContent).toContain(
      'Yu-Gi-Oh! First Generation',
    );
  });
});

describe('App focus management', () => {
  it('moves focus for a path change but not a query-only navigation', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([
          { path: 'cards', component: TestPage },
          { path: 'cards/:id', component: TestPage },
        ]),
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    fixture.detectChanges();

    await router.navigateByUrl('/cards');
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    const main = fixture.nativeElement.querySelector('main') as HTMLElement;
    expect(document.activeElement).toBe(main);

    const brand = fixture.nativeElement.querySelector('.brand') as HTMLAnchorElement;
    brand.focus();
    await router.navigateByUrl('/cards?name=Dragon');
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    expect(document.activeElement).toBe(brand);
  });
});
