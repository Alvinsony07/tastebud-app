import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { FavoriteService } from '../../services/favorite.service';
import { Recipe } from '../../services/recipe.service';
import { RecipeCardComponent } from '../../components/recipe-card/recipe-card.component'; // Import RecipeCardComponent

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule, RecipeCardComponent], // Add RecipeCardComponent to imports
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit, OnDestroy {
  favorites: Recipe[] = [];
  private favSub!: Subscription;

  constructor(private favoriteService: FavoriteService) {}

  ngOnInit(): void {
    this.favSub = this.favoriteService.favorites$.subscribe(favs => {
      this.favorites = favs;
    });
  }

  ngOnDestroy(): void {
    if (this.favSub) {
      this.favSub.unsubscribe();
    }
  }

  clearAllFavorites(): void {
    if (confirm('Are you sure you want to remove all your favorite recipes? This cannot be undone.')) {
      this.favoriteService.clearAllFavorites();
    }
  }
}
