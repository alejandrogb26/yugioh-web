import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { NotFoundPage } from './not-found-page';

describe('NotFoundPage', () => {
  it('shows an explanation, catalog link and page title', async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundPage],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(NotFoundPage);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Página no encontrada');
    expect(fixture.nativeElement.querySelector('a')?.getAttribute('href')).toBe('/cards');
    expect(TestBed.inject(Title).getTitle()).toBe(
      'Página no encontrada | Yu-Gi-Oh! First Generation',
    );
  });
});
