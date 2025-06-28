import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Recipe } from './recipe.service'; // <-- CORRECTED IMPORT PATH

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private favoritesSubject = new BehaviorSubject<Recipe[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();
  private readonly FAVORITES_KEY = 'tastebud_favorites';

  constructor() {
    this.loadFavoritesFromStorage();
  }

  private loadFavoritesFromStorage(): void {
    const storedFavorites = localStorage.getItem(this.FAVORITES_KEY);
    if (storedFavorites) {
      try {
        const favorites = JSON.parse(storedFavorites);
        this.favoritesSubject.next(favorites);
      } catch (e) {
        console.error('Error parsing favorites from localStorage', e);
        localStorage.removeItem(this.FAVORITES_KEY);
      }
    }
  }

  private saveFavoritesToStorage(favorites: Recipe[]): void {
    localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
    this.favoritesSubject.next(favorites);
  }

  addToFavorites(recipe: Recipe): void {
    const currentFavorites = this.favoritesSubject.getValue();
    if (!this.isFavorite(recipe.idMeal)) {
      const updatedFavorites = [...currentFavorites, recipe];
      this.saveFavoritesToStorage(updatedFavorites);
    }
  }

  removeFromFavorites(recipeId: string): void {
    const currentFavorites = this.favoritesSubject.getValue();
    const updatedFavorites = currentFavorites.filter(fav => fav.idMeal !== recipeId);
    this.saveFavoritesToStorage(updatedFavorites);
  }

  isFavorite(recipeId: string): boolean {
    return this.favoritesSubject.getValue().some(fav => fav.idMeal === recipeId);
  }

  getFavorites(): Recipe[] {
    return this.favoritesSubject.getValue();
  }

  // ADDED a method to clear all favorites
  clearAllFavorites(): void {
    this.saveFavoritesToStorage([]);
  }
}
