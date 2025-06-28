import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeService, Category } from '../../services/recipe.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-category-filter',
  templateUrl: './category-filter.component.html',
  styleUrls: ['./category-filter.component.css']
})
export class CategoryFilterComponent implements OnInit {
  @Output() categorySelected = new EventEmitter<string>();
  @Input() selectedCategory: string = 'all';

  categories: Category[] = [];
  loading = true;

  private categoryIcons: { [key: string]: string } = {
    Beef: '🥩',
    Chicken: '🍗',
    Dessert: '🍰',
    Lamb: '🐑',
    Miscellaneous: '🍽️',
    Pasta: '🍝',
    Pork: '🐷',
    Seafood: '🐟',
    Side: '🥗',
    Starter: '🥖',
    Vegan: '🌱',
    Vegetarian: '🥬',
    Breakfast: '🍳',
    Goat: '🐐',
  };

  constructor(private recipeService: RecipeService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.recipeService.getCategories().subscribe({
      next: (categories) => {
        // We don't need to limit to 12 anymore with the scrolling design
        this.categories = categories; 
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loading = false;
      }
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.categorySelected.emit(category);
  }

  getCategoryIcon(categoryName: string): string {
    return this.categoryIcons[categoryName] || '🍽️';
  }
}