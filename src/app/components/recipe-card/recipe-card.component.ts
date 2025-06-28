import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Recipe } from '../../services/recipe.service';
import { FavoriteService } from '../../services/favorite.service';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipe-card.component.html',
  styleUrls: ['./recipe-card.component.css']
})
export class RecipeCardComponent implements OnInit, OnDestroy {
  @Input({ required: true }) recipe!: Recipe;
  isFavorited = false;
  private favoriteSub!: Subscription;

  constructor(
    private favoriteService: FavoriteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.favoriteSub = this.favoriteService.favorites$.subscribe(() => {
      this.isFavorited = this.favoriteService.isFavorite(this.recipe.idMeal);
    });
  }

  ngOnDestroy(): void {
    if (this.favoriteSub) {
      this.favoriteSub.unsubscribe();
    }
  }

  toggleFavorite(event: MouseEvent): void {
    event.stopPropagation(); // Prevent card click when clicking the heart
    if (this.isFavorited) {
      this.favoriteService.removeFromFavorites(this.recipe.idMeal);
    } else {
      this.favoriteService.addToFavorites(this.recipe);
    }
    this.isFavorited = !this.isFavorited;
  }

  viewRecipe(): void {
    this.router.navigate(['/recipe', this.recipe.idMeal]);
  }

  shareRecipe(event: MouseEvent): void {
    event.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: this.recipe.strMeal,
        text: `Check out this amazing recipe for ${this.recipe.strMeal}!`,
        url: `${window.location.origin}/recipe/${this.recipe.idMeal}`
      }).catch(err => console.error("Share failed:", err));
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(`${window.location.origin}/recipe/${this.recipe.idMeal}`);
      alert('Recipe link copied to clipboard!');
    }
  }

  // Generate a plausible random rating for display purposes
  getRandomRating(): string {
    // This will generate a consistent "random" rating based on the recipe ID
    const seed = this.recipe.idMeal.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = parseFloat(`0.${Math.sin(seed).toString().substr(6)}`);
    return (3.8 + random * 1.2).toFixed(1);
  }
}
