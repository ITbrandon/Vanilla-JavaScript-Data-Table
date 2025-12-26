(function() {
  'use strict';

  // ============================================
  // Configuration
  // ============================================
  
  const COLUMNS = [
    { key: 'id', label: 'ID', sortable: true, visible: true },
    { key: 'name', label: 'Name', sortable: true, visible: true },
    { key: 'email', label: 'Email', sortable: true, visible: true },
    { key: 'department', label: 'Department', sortable: true, visible: true },
    { key: 'salary', label: 'Salary', sortable: true, visible: true },
    { key: 'startDate', label: 'Start Date', sortable: true, visible: true },
    { key: 'status', label: 'Status', sortable: true, visible: true }
  ];

  let SEARCHABLE_FIELDS = ['name', 'email', 'department'];
  let DEFAULT_PAGE_SIZE = 10;
  let DEBOUNCE_DELAY = 200;

  // ============================================
  // State
  // ============================================

  let state = {
    originalData: [],
    filteredData: [],
    columns: COLUMNS.map(function(col) { return Object.assign({}, col); }),
    sortKey: null,
    sortDirection: null, // 'asc' | 'desc' | null
    searchTerm: '',
    currentPage: 1,
    pageSize: DEFAULT_PAGE_SIZE
  };

  // ============================================
  // DOM References
  // ============================================

  let elements = {};

  function cacheElements() {
    elements.searchInput = document.getElementById('searchInput');
    elements.recordCount = document.getElementById('recordCount');
    elements.tableHead = document.getElementById('tableHead');
    elements.tableBody = document.getElementById('tableBody');
    elements.emptyState = document.getElementById('emptyState');
    elements.columnToggleButton = document.getElementById('columnToggleButton');
    elements.columnDropdown = document.getElementById('columnDropdown');
    elements.pageSize = document.getElementById('pageSize');
    elements.paginationRange = document.getElementById('paginationRange');
    elements.firstPage = document.getElementById('firstPage');
    elements.prevPage = document.getElementById('prevPage');
    elements.nextPage = document.getElementById('nextPage');
    elements.lastPage = document.getElementById('lastPage');
  }

  // ============================================
  // Utility Functions
  // ============================================

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    let div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  function formatCurrency(value) {
    return '$' + Number(value).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  function formatDate(dateStr) {
    let date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function debounce(fn, delay) {
    let timeoutId = null;
    return function() {
      let context = this;
      let args = arguments;
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(function() {
        fn.apply(context, args);
      }, delay);
    };
  }

  function normalizeString(str) {
    return String(str).toLowerCase().trim();
  }

  // ============================================
  // Sample Data Generator
  // ============================================

  function generateSampleData(count) {
    let firstNames = ['James', 'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'William', 'Sophia', 'Oliver', 'Isabella', 'Elijah', 'Mia', 'Lucas', 'Charlotte', 'Mason', 'Amelia', 'Ethan', 'Harper', 'Alexander', 'Evelyn'];
    let lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
    let departments = ['Engineering', 'Marketing', 'Sales', 'Human Resources', 'Finance', 'Operations', 'Design', 'Product', 'Legal', 'Customer Success'];
    let statuses = ['active', 'inactive', 'pending'];

    let data = [];
    for (let i = 0; i < count; i++) {
      let firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      let lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      let department = departments[Math.floor(Math.random() * departments.length)];
      let status = statuses[Math.floor(Math.random() * statuses.length)];
      
      let startYear = 2018 + Math.floor(Math.random() * 6);
      let startMonth = Math.floor(Math.random() * 12);
      let startDay = 1 + Math.floor(Math.random() * 28);
      let startDate = new Date(startYear, startMonth, startDay);

      data.push({
        id: i + 1,
        name: firstName + ' ' + lastName,
        email: firstName.toLowerCase() + '.' + lastName.toLowerCase() + '@company.com',
        department: department,
        salary: 45000 + Math.floor(Math.random() * 105000),
        startDate: startDate.toISOString().split('T')[0],
        status: status
      });
    }
    return data;
  }

  // ============================================
  // Sorting Functions
  // ============================================

  function compareValues(a, b, key) {
    let valA = a[key];
    let valB = b[key];

    // Handle null/undefined
    if (valA == null && valB == null) return 0;
    if (valA == null) return 1;
    if (valB == null) return -1;

    // Numbers
    if (typeof valA === 'number' && typeof valB === 'number') {
      return valA - valB;
    }

    // Dates (ISO format)
    if (key === 'startDate') {
      return new Date(valA).getTime() - new Date(valB).getTime();
    }

    // Strings
    return String(valA).localeCompare(String(valB));
  }

  function sortData(data, key, direction) {
    if (!key || !direction) return data.slice();
    
    let sorted = data.slice();
    sorted.sort(function(a, b) {
      let result = compareValues(a, b, key);
      return direction === 'desc' ? -result : result;
    });
    return sorted;
  }

  function getNextSortDirection(current) {
    if (current === null) return 'asc';
    if (current === 'asc') return 'desc';
    return null;
  }

  // ============================================
  // Filtering Functions
  // ============================================

  function filterBySearch(data, term, fields) {
    if (!term) return data;
    
    let normalizedTerm = normalizeString(term);
    return data.filter(function(row) {
      return fields.some(function(field) {
        let value = row[field];
        if (value == null) return false;
        return normalizeString(value).indexOf(normalizedTerm) !== -1;
      });
    });
  }

  // ============================================
  // Pagination Functions
  // ============================================

  function calculateTotalPages(totalItems, pageSize) {
    return Math.max(1, Math.ceil(totalItems / pageSize));
  }

  function clampPage(page, totalPages) {
    return Math.max(1, Math.min(page, totalPages));
  }

  function getPageData(data, page, pageSize) {
    let start = (page - 1) * pageSize;
    let end = start + pageSize;
    return data.slice(start, end);
  }

  function getDisplayRange(page, pageSize, totalItems) {
    if (totalItems === 0) return { start: 0, end: 0 };
    let start = (page - 1) * pageSize + 1;
    let end = Math.min(page * pageSize, totalItems);
    return { start: start, end: end };
  }

  // ============================================
  // State Management
  // ============================================

  function processData() {
    // Apply search filter
    let filtered = filterBySearch(state.originalData, state.searchTerm, SEARCHABLE_FIELDS);
    
    // Apply sorting
    filtered = sortData(filtered, state.sortKey, state.sortDirection);
    
    state.filteredData = filtered;
    
    // Clamp current page
    let totalPages = calculateTotalPages(filtered.length, state.pageSize);
    state.currentPage = clampPage(state.currentPage, totalPages);
  }

  function setSearchTerm(term) {
    state.searchTerm = term;
    state.currentPage = 1;
    processData();
    render();
  }

  function toggleSort(key) {
    if (state.sortKey === key) {
      state.sortDirection = getNextSortDirection(state.sortDirection);
      if (state.sortDirection === null) {
        state.sortKey = null;
      }
    } else {
      state.sortKey = key;
      state.sortDirection = 'asc';
    }
    processData();
    render();
  }

  function setColumnVisibility(key, visible) {
    state.columns = state.columns.map(function(col) {
      if (col.key === key) {
        return Object.assign({}, col, { visible: visible });
      }
      return col;
    });
    render();
  }

  function setPage(page) {
    let totalPages = calculateTotalPages(state.filteredData.length, state.pageSize);
    state.currentPage = clampPage(page, totalPages);
    render();
  }

  function setPageSize(size) {
    state.pageSize = size;
    state.currentPage = 1;
    processData();
    render();
  }

  // ============================================
  // Rendering Functions
  // ============================================

  function renderTableHead() {
    let visibleColumns = state.columns.filter(function(col) { return col.visible; });
    
    let headerRow = document.createElement('tr');
    
    visibleColumns.forEach(function(column) {
      let th = document.createElement('th');
      th.setAttribute('scope', 'col');
      
      if (column.sortable) {
        th.classList.add('sortable');
        th.setAttribute('tabindex', '0');
        th.setAttribute('role', 'columnheader');
        th.setAttribute('aria-sort', 
          state.sortKey === column.key 
            ? (state.sortDirection === 'asc' ? 'ascending' : 'descending')
            : 'none'
        );
        
        if (state.sortKey === column.key) {
          th.classList.add('sorted');
        }
        
        th.addEventListener('click', function() {
          toggleSort(column.key);
        });
        
        th.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleSort(column.key);
          }
        });
      }
      
      let content = document.createElement('span');
      content.className = 'th-content';
      content.textContent = column.label;
      
      if (column.sortable) {
        let sortIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        sortIcon.setAttribute('class', 'sort-icon');
        sortIcon.setAttribute('width', '14');
        sortIcon.setAttribute('height', '14');
        sortIcon.setAttribute('viewBox', '0 0 24 24');
        sortIcon.setAttribute('fill', 'none');
        sortIcon.setAttribute('stroke', 'currentColor');
        sortIcon.setAttribute('stroke-width', '2');
        
        let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        if (state.sortKey === column.key && state.sortDirection === 'desc') {
          path.setAttribute('d', 'm7 15 5 5 5-5M7 9l5-5 5 5');
        } else if (state.sortKey === column.key && state.sortDirection === 'asc') {
          path.setAttribute('d', 'm7 9 5-5 5 5M7 15l5 5 5 5');
        } else {
          path.setAttribute('d', 'm7 15 5 5 5-5M7 9l5-5 5 5');
        }
        sortIcon.appendChild(path);
        content.appendChild(sortIcon);
      }
      
      th.appendChild(content);
      headerRow.appendChild(th);
    });
    
    elements.tableHead.innerHTML = '';
    elements.tableHead.appendChild(headerRow);
  }

  function renderTableBody() {
    let visibleColumns = state.columns.filter(function(col) { return col.visible; });
    let pageData = getPageData(state.filteredData, state.currentPage, state.pageSize);
    
    if (pageData.length === 0) {
      elements.tableBody.innerHTML = '';
      elements.emptyState.hidden = false;
      return;
    }
    
    elements.emptyState.hidden = true;
    
    let fragment = document.createDocumentFragment();
    
    pageData.forEach(function(row) {
      let tr = document.createElement('tr');
      
      visibleColumns.forEach(function(column) {
        let td = document.createElement('td');
        let value = row[column.key];
        
        switch (column.key) {
          case 'id':
            td.className = 'cell-id';
            td.textContent = '#' + value;
            break;
          case 'name':
            td.className = 'cell-name';
            td.textContent = escapeHtml(value);
            break;
          case 'email':
            td.className = 'cell-email';
            td.textContent = escapeHtml(value);
            break;
          case 'salary':
            td.className = 'cell-currency';
            td.textContent = formatCurrency(value);
            break;
          case 'startDate':
            td.className = 'cell-date';
            td.textContent = formatDate(value);
            break;
          case 'status':
            td.className = 'cell-status';
            let dot = document.createElement('span');
            dot.className = 'status-dot ' + value;
            td.appendChild(dot);
            td.appendChild(document.createTextNode(value.charAt(0).toUpperCase() + value.slice(1)));
            break;
          default:
            td.textContent = escapeHtml(value);
        }
        
        tr.appendChild(td);
      });
      
      fragment.appendChild(tr);
    });
    
    elements.tableBody.innerHTML = '';
    elements.tableBody.appendChild(fragment);
  }

  function renderColumnDropdown() {
    elements.columnDropdown.innerHTML = '';
    
    state.columns.forEach(function(column, index) {
      let item = document.createElement('label');
      item.className = 'dropdown-item';
      item.setAttribute('role', 'menuitemcheckbox');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-checked', column.visible ? 'true' : 'false');
      
      let checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = column.visible;
      checkbox.setAttribute('tabindex', '-1');
      
      checkbox.addEventListener('change', function() {
        setColumnVisibility(column.key, checkbox.checked);
      });
      
      item.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          checkbox.checked = !checkbox.checked;
          setColumnVisibility(column.key, checkbox.checked);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          let nextItem = item.nextElementSibling;
          if (nextItem) nextItem.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          let prevItem = item.previousElementSibling;
          if (prevItem) prevItem.focus();
        } else if (e.key === 'Escape') {
          closeColumnDropdown();
          elements.columnToggleButton.focus();
        }
      });
      
      item.appendChild(checkbox);
      item.appendChild(document.createTextNode(column.label));
      elements.columnDropdown.appendChild(item);
    });
  }

  function renderPagination() {
    let totalPages = calculateTotalPages(state.filteredData.length, state.pageSize);
    let range = getDisplayRange(state.currentPage, state.pageSize, state.filteredData.length);
    
    elements.paginationRange.textContent = range.start + '-' + range.end + ' of ' + state.filteredData.length;
    
    elements.firstPage.disabled = state.currentPage <= 1;
    elements.prevPage.disabled = state.currentPage <= 1;
    elements.nextPage.disabled = state.currentPage >= totalPages;
    elements.lastPage.disabled = state.currentPage >= totalPages;
  }

  function render() {
    elements.recordCount.textContent = state.originalData.length + ' records';
    renderTableHead();
    renderTableBody();
    renderColumnDropdown();
    renderPagination();
  }

  // ============================================
  // Column Dropdown
  // ============================================

  function toggleColumnDropdown() {
    let isOpen = !elements.columnDropdown.hidden;
    if (isOpen) {
      closeColumnDropdown();
    } else {
      openColumnDropdown();
    }
  }

  function openColumnDropdown() {
    elements.columnDropdown.hidden = false;
    elements.columnToggleButton.setAttribute('aria-expanded', 'true');
    
    let firstItem = elements.columnDropdown.querySelector('.dropdown-item');
    if (firstItem) firstItem.focus();
  }

  function closeColumnDropdown() {
    elements.columnDropdown.hidden = true;
    elements.columnToggleButton.setAttribute('aria-expanded', 'false');
  }

  // ============================================
  // Event Listeners
  // ============================================

  function setupEventListeners() {
    // Search
    let debouncedSearch = debounce(function(term) {
      setSearchTerm(term);
    }, DEBOUNCE_DELAY);
    
    elements.searchInput.addEventListener('input', function(e) {
      debouncedSearch(e.target.value);
    });
    
    elements.searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        e.target.value = '';
        setSearchTerm('');
      }
    });
    
    // Column toggle
    elements.columnToggleButton.addEventListener('click', toggleColumnDropdown);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!elements.columnDropdown.hidden && 
          !elements.columnDropdown.contains(e.target) && 
          !elements.columnToggleButton.contains(e.target)) {
        closeColumnDropdown();
      }
    });
    
    // Page size
    elements.pageSize.addEventListener('change', function(e) {
      setPageSize(parseInt(e.target.value, 10));
    });
    
    // Pagination buttons
    elements.firstPage.addEventListener('click', function() { setPage(1); });
    elements.prevPage.addEventListener('click', function() { setPage(state.currentPage - 1); });
    elements.nextPage.addEventListener('click', function() { setPage(state.currentPage + 1); });
    elements.lastPage.addEventListener('click', function() {
      let totalPages = calculateTotalPages(state.filteredData.length, state.pageSize);
      setPage(totalPages);
    });
  }

  // ============================================
  // Initialization
  // ============================================

  function init() {
    cacheElements();
    
    // Generate sample data
    state.originalData = generateSampleData(100);
    processData();
    
    setupEventListeners();
    render();
  }

  // Start the application
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
