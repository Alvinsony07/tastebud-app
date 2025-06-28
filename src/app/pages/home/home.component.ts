import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeroComponent } from '../../components/hero/hero.component';
import { RecipeListComponent } from '../../components/recipe-list/recipe-list.component';
import { RecipeService, Recipe, Category } from '../../services/recipe.service';
import { FavoriteService } from '../../services/favorite.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeroComponent, RecipeListComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  featuredRecipes: Recipe[] = [];
  featuredLoading = true;
  featuredError: string | null = null;
  
  popularCategories: Category[] = [];
  
  // Statistics - ADDED THESE PROPERTIES BACK
  totalRecipes = 280; 
  totalCountries = 50;
  favoriteCount = 0;

  constructor(
    private recipeService: RecipeService,
    private favoriteService: FavoriteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFeaturedRecipes();
    this.loadPopularCategories();
    this.loadStats();
  }

  loadFeaturedRecipes(): void {
    this.featuredLoading = true;
    this.featuredError = null;
    
    this.recipeService.getMultipleRandomRecipes(6).subscribe({
      next: (recipes: Recipe[]) => {
        this.featuredRecipes = recipes;
        this.featuredLoading = false;
      },
      error: (error: any) => {
        this.featuredError = 'Failed to load featured recipes. Please try again.';
        this.featuredLoading = false;
        console.error('Error loading featured recipes:', error);
      }
    });
  }

  loadPopularCategories(): void {
    this.recipeService.getCategories().subscribe({
      next: (categories) => {
        const popularCategoryNames = ['Chicken', 'Beef', 'Dessert', 'Pasta', 'Seafood', 'Vegetarian', 'Breakfast', 'Side'];
        this.popularCategories = categories.filter(cat => 
          popularCategoryNames.includes(cat.strCategory)
        ).slice(0, 8);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadStats(): void {
    this.favoriteService.favorites$.subscribe(favorites => {
      this.favoriteCount = favorites.length;
    });
  }

  browseCategory(category: string): void {
    this.router.navigate(['/recipes'], { queryParams: { category } });
  }

  // ADDED THIS METHOD BACK
  navigateToRecipes(): void {
    this.router.navigate(['/recipes']);
  }

  truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}