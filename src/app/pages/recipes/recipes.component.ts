import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { RecipeService, Recipe } from '../../services/recipe.service';
import { CategoryFilterComponent } from '../../components/category-filter/category-filter.component';
import { RecipeListComponent } from '../../components/recipe-list/recipe-list.component';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CategoryFilterComponent, // SearchBarComponent was removed from here
    RecipeListComponent
  ],
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.css']
})
export class RecipesComponent implements OnInit, OnDestroy {
  allRecipes: Recipe[] = [];
  paginatedRecipes: Recipe[] = [];

  loading = true;
  error: string | null = null;
  
  searchTerm = '';
  selectedCategory = 'all';
  sortBy = 'name';

  currentPage = 1;
  itemsPerPage = 12;
  totalRecipes = 0;
  totalPages = 0;

  private routeSub!: Subscription;
  private searchSub = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private recipeService: RecipeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.queryParams.subscribe(params => {
      this.searchTerm = params['search'] || '';
      this.selectedCategory = params['category'] || 'all';
      this.currentPage = +params['page'] || 1;
      this.sortBy = params['sort'] || 'name';
      this.loadRecipes();
    });

    this.searchSub.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.currentPage = 1;
      this.updateUrlParams({ search: query, category: 'all', page: 1 });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  loadRecipes(): void {
    this.loading = true;
    this.error = null;
    
    const recipeObservable = this.searchTerm 
      ? this.recipeService.searchRecipes(this.searchTerm)
      : this.recipeService.getRecipesByCategory(this.selectedCategory === 'all' ? '' : this.selectedCategory);

    const effectiveObservable = this.selectedCategory === 'all' && !this.searchTerm 
        ? this.recipeService.searchRecipes('') 
        : recipeObservable;

    effectiveObservable.pipe(takeUntil(this.destroy$)).subscribe({
      next: (recipes) => {
        this.allRecipes = this.sortRecipes(recipes);
        this.totalRecipes = this.allRecipes.length;
        this.totalPages = Math.ceil(this.totalRecipes / this.itemsPerPage);
        this.updatePaginatedRecipes();
        this.loading = false;
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.onPageChange(1);
        }
      },
      error: (err) => {
        this.error = 'Could not load recipes. Please try again later.';
        console.error(err);
        this.loading = false;
        this.allRecipes = [];
        this.paginatedRecipes = [];
        this.totalRecipes = 0;
      }
    });
  }

  onSearch(query: string): void {
    this.searchSub.next(query);
  }

  onCategorySelected(category: string): void {
    this.currentPage = 1;
    this.updateUrlParams({ search: null, category: category === 'all' ? null : category, page: 1 });
  }

  onSortChange(): void {
    this.allRecipes = this.sortRecipes(this.allRecipes);
    this.updatePaginatedRecipes();
  }
  
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.updateUrlParams({ page });
    }
  }

  clearFilters(): void {
    this.currentPage = 1;
    this.updateUrlParams({ search: null, category: null, page: 1 });
  }

  private sortRecipes(recipes: Recipe[]): Recipe[] {
    return [...recipes].sort((a, b) => {
      switch (this.sortBy) {
        case 'name-desc':
          return b.strMeal.localeCompare(a.strMeal);
        case 'category':
            return (a.strCategory || '').localeCompare(b.strCategory || '');
        case 'area':
            return (a.strArea || '').localeCompare(b.strArea || '');
        case 'name':
        default:
          return a.strMeal.localeCompare(b.strMeal);
      }
    });
  }

  private updatePaginatedRecipes(): void {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      this.paginatedRecipes = this.allRecipes.slice(startIndex, endIndex);
      // Scroll to top when page changes
      window.scrollTo(0, 0);
  }

  private updateUrlParams(params: { search?: string | null, category?: string | null, page?: number, sort?: string }): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: params.search !== undefined ? params.search : this.searchTerm || null,
        category: params.category !== undefined ? params.category : this.selectedCategory === 'all' ? null : this.selectedCategory,
        page: params.page !== undefined ? params.page : this.currentPage,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }
  
  get isFiltered(): boolean {
      return !!this.searchTerm || this.selectedCategory !== 'all';
  }
}
