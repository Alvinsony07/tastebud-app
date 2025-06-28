import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RecipeService, Recipe } from '../../services/recipe.service';

// This is required to access the Bootstrap library from TypeScript
declare var bootstrap: any;

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css']
})
export class HeroComponent implements OnInit, AfterViewInit {
  // THE FIX IS HERE: Added '!' after carouselElement
  @ViewChild('heroCarousel') carouselElement!: ElementRef;

  featuredRecipes: Recipe[] = [];
  loading = true;

  constructor(private recipeService: RecipeService) {}

  ngOnInit(): void {
    this.loadFeaturedRecipes();
  }

  ngAfterViewInit(): void {
    // We initialize the carousel after the view is ready
    this.initCarousel();
  }

  loadFeaturedRecipes(): void {
    this.loading = true;
    // Fetch 3 random recipes for the carousel
    this.recipeService.getMultipleRandomRecipes(3).subscribe({
      next: (recipes) => {
        this.featuredRecipes = recipes;
        this.loading = false;
        // Re-initialize the carousel once data arrives to ensure it works
        this.initCarousel();
      },
      error: (err) => {
        console.error('Failed to load featured recipes:', err);
        this.loading = false;
      }
    });
  }

  private initCarousel(): void {
    // A small delay to ensure the DOM is fully updated with the recipes
    setTimeout(() => {
      if (this.carouselElement && this.carouselElement.nativeElement) {
        const carousel = new bootstrap.Carousel(this.carouselElement.nativeElement, {
          interval: 3000, // Slide every 3 seconds
          ride: 'carousel',
          pause: 'hover', // Pause when the mouse is over it
          wrap: true      // Loop continuously
        });
      }
    }, 0);
  }
}