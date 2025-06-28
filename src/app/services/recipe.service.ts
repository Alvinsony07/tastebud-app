import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError, mergeMap } from 'rxjs/operators';

// This is the single source of truth for the Recipe data shape.
export interface Recipe {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strTags?: string;
  strYoutube?: string;
  [key: string]: string | undefined; // Index signature for ingredient properties
}

export interface RecipeResponse {
  meals: Recipe[];
}

export interface Category {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

export interface CategoryResponse {
    categories: Category[];
}

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private readonly baseUrl = 'https://www.themealdb.com/api/json/v1/1';

  constructor(private http: HttpClient) { }

  /**
   * Fetches a single random recipe. The API for random is rate-limited,
   * so we call it multiple times for the hero section using forkJoin.
   */
  private getOneRandomRecipe(): Observable<Recipe> {
    return this.http.get<RecipeResponse>(`${this.baseUrl}/random.php`).pipe(
      map(response => response.meals[0])
    );
  }

  /**
   * Fetches a specified number of random recipes for the hero/featured sections.
   */
  getMultipleRandomRecipes(count: number): Observable<Recipe[]> {
    const randomRecipeObservables: Observable<Recipe>[] = Array.from(
      { length: count },
      () => this.getOneRandomRecipe()
    );
    return forkJoin(randomRecipeObservables).pipe(
      catchError(error => {
        console.error('Error fetching multiple random recipes:', error);
        return of([]);
      })
    );
  }

  // Get recipe by ID
  getRecipeById(id: string): Observable<Recipe | null> {
    return this.http.get<RecipeResponse>(`${this.baseUrl}/lookup.php?i=${id}`)
      .pipe(
        map(response => (response.meals ? response.meals[0] : null)),
        catchError(error => {
          console.error(`Error fetching recipe by id ${id}:`, error);
          return of(null);
        })
      );
  }

  // Search recipes by name
  searchRecipes(query: string): Observable<Recipe[]> {
    return this.http.get<RecipeResponse>(`${this.baseUrl}/search.php?s=${query}`)
      .pipe(
        map(response => response.meals || []),
        catchError(error => {
          console.error(`Error searching for "${query}":`, error);
          return of([]);
        })
      );
  }

  // Get recipes by category
  getRecipesByCategory(category: string): Observable<Recipe[]> {
    return this.http.get<RecipeResponse>(`${this.baseUrl}/filter.php?c=${category}`)
      .pipe(
        map(response => response.meals || []),
        catchError(error => {
          console.error(`Error fetching recipes for category ${category}:`, error);
          return of([]);
        })
      );
  }

  // Get all categories
  getCategories(): Observable<Category[]> {
    return this.http.get<CategoryResponse>(`${this.baseUrl}/categories.php`)
      .pipe(
        map(response => response.categories || []),
        catchError(error => {
          console.error('Error fetching categories:', error);
          return of([]);
        })
      );
  }
}
