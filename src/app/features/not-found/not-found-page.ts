import { Component, OnInit, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { pageTitle } from '../../core/page-title';

@Component({
  imports: [RouterLink],
  templateUrl: './not-found-page.html',
  styleUrl: './not-found-page.css',
})
export class NotFoundPage implements OnInit {
  private readonly title = inject(Title);

  ngOnInit(): void {
    this.title.setTitle(pageTitle('Página no encontrada'));
  }
}
