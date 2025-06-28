import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { RecipeService, Recipe } from '../../services/recipe.service';
import { FavoriteService } from '../../services/favorite.service';
import { RecipeListComponent } from '../../components/recipe-list/recipe-list.component';

interface Ingredient {
  name: string;
  measure: string;
}

@Component({
  selector: 'app-recipe-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipe-details.component.html',
  styleUrls: ['./recipe-details.component.css']
})
export class RecipeDetailsComponent implements OnInit, OnDestroy {
  recipe: Recipe | null = null;
  loading = true;
  error: string | null = null;
  isFavorite = false;
  
  ingredients: Ingredient[] = [];
  instructions: string[] = [];
  
  relatedRecipes: Recipe[] = [];
  relatedLoading = true;

  private routeSub!: Subscription;
  private favSub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private recipeService: RecipeService,
    private favoriteService: FavoriteService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        window.scrollTo(0, 0);
        this.loadRecipe(id);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) this.routeSub.unsubscribe();
    if (this.favSub) this.favSub.unsubscribe();
  }

  loadRecipe(id: string): void {
    this.loading = true;
    this.error = null;
    this.recipe = null;
    
    this.recipeService.getRecipeById(id).subscribe({
      next: (recipe) => {
        if (recipe) {
          this.recipe = recipe;
          this.parseIngredientsAndInstructions();
          this.setupFavoriteSubscription();
          this.loadRelatedRecipes();
        } else {
          this.error = `The recipe with ID "${id}" could not be found.`;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load the recipe. Please check your connection and try again.';
        this.loading = false;
        console.error('Error loading recipe:', err);
      }
    });
  }

  parseIngredientsAndInstructions(): void {
    if (!this.recipe) return;
    
    const ingredients: Ingredient[] = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = this.recipe[`strIngredient${i}`];
      const measure = this.recipe[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push({ name: ingredient.trim(), measure: measure ? measure.trim() : '' });
      }
    }
    this.ingredients = ingredients;

    this.instructions = this.recipe.strInstructions
      ?.split(/\r?\n/)
      .filter(step => step.trim().length > 5)
      .map(step => step.trim()) || [];
  }

  setupFavoriteSubscription(): void {
    if (this.favSub) this.favSub.unsubscribe();
    
    this.favSub = this.favoriteService.favorites$.subscribe(() => {
      if (this.recipe) {
        this.isFavorite = this.favoriteService.isFavorite(this.recipe.idMeal);
      }
    });
  }

  toggleFavorite(): void {
    if (!this.recipe) return;
    
    if (this.isFavorite) {
      this.favoriteService.removeFromFavorites(this.recipe.idMeal);
    } else {
      this.favoriteService.addToFavorites(this.recipe);
    }
  }

  loadRelatedRecipes(): void {
    if (!this.recipe?.strCategory) return;
    
    this.relatedLoading = true;
    this.recipeService.getRecipesByCategory(this.recipe.strCategory).subscribe({
      next: (recipes) => {
        this.relatedRecipes = recipes
          .filter(r => r.idMeal !== this.recipe?.idMeal)
          .slice(0, 3);
        this.relatedLoading = false;
      },
      error: (err) => {
        console.error('Error loading related recipes:', err);
        this.relatedLoading = false;
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  getTags(): string[] {
    return this.recipe?.strTags?.split(',') || [];
  }
  
  getDifficulty(): string {
    const difficulties = ['Easy', 'Medium', 'Hard'];
    return difficulties[((this.recipe?.idMeal || '0').charCodeAt(4) || 0) % 3];
  }
}