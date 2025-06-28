import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router'; // Import ActivatedRoute
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Input() theme: 'light' | 'dark' = 'light';
  @Output() searchEvent = new EventEmitter<string>();

  searchQuery: string = '';
  private querySubject = new Subject<string>();
  private querySub!: Subscription;
  private routeSub!: Subscription;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Listen to the URL's 'search' parameter to set the initial value
    this.routeSub = this.route.queryParams.subscribe(params => {
      this.searchQuery = params['search'] || '';
    });

    // Debounce user input before emitting the search event
    this.querySub = this.querySubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchEvent.emit(query);
    });
  }

  ngOnDestroy(): void {
    if (this.querySub) this.querySub.unsubscribe();
    if (this.routeSub) this.routeSub.unsubscribe();
  }

  // Called when the user clicks the search button
  onSearch(): void {
    this.searchEvent.emit(this.searchQuery);
  }

  // Called as the user types in the input field
  onQueryChanged(query: string): void {
    this.querySubject.next(query);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.onSearch(); // Immediately emit an empty search event
  }
}