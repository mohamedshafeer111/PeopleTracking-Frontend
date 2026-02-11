import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-processautomation',
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './processautomation.html',
  styleUrl: './processautomation.css'
})
export class Processautomation implements OnInit {




  

  searchQuery = '';
  isSearchOpen = false;

  /** Full list (mock / static / later API data) */
  allItems: any[] = [];

  /** What you show in UI */
  filteredItems: any[] = [];

  ngOnInit() {
    this.allItems = [
      {
        description: 'Door opened',
        timestamp: '2026-01-08 10:30:00'
      },
      {
        description: 'Motion detected',
        timestamp: '2026-01-07 18:45:00'
      }
    ];

    // initially show all
    this.filteredItems = [...this.allItems];
  }

  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen;
  }

  applyUnifiedSearch() {
    const query = this.searchQuery?.trim().toLowerCase() || '';

    if (!query) {
      this.filteredItems = [...this.allItems];
      return;
    }

    this.filteredItems = this.allItems.filter(item => {
      const desc = (item.description || '').toLowerCase();

      const raw = item.timestamp?.replace(' ', 'T');
      const date = new Date(raw);

      const yyyyMMdd = !isNaN(date.getTime())
        ? date.toISOString().split('T')[0]
        : '';

      const ddMMyyyy = !isNaN(date.getTime())
        ? date.toLocaleDateString('en-GB')
        : '';

      return (
        desc.includes(query) ||
        yyyyMMdd.includes(query) ||
        ddMMyyyy.includes(query)
      );
    });
  }
}