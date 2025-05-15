const form = document.getElementById('transactionForm');
const balanceEl = document.getElementById('balance');
const list = document.getElementById('transactionList');
const dashboard = document.getElementById('dashboard');
const categorySelect = document.getElementById('category');
const filterStartDateInput = document.getElementById('filterStartDate');
const filterEndDateInput = document.getElementById('filterEndDate');
const filterCategorySelect = document.getElementById('filterCategory');
const monthlySummaryList = document.getElementById('monthlySummaryList');

const LOCAL_STORAGE_TRANSACTIONS_KEY = 'budgetbuddy_transactions';
const LOCAL_STORAGE_BALANCE_KEY = 'budgetbuddy_balance';

let balance = parseFloat(localStorage.getItem(LOCAL_STORAGE_BALANCE_KEY)) || 0;
let transactions = JSON.parse(localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS_KEY)) || [];

// Function to update the displayed balance and save to localStorage
function updateBalanceDisplay() {
  balanceEl.textContent = `₹${balance.toFixed(2)}`;
  dashboard.classList.remove('theme-positive', 'theme-negative', 'theme-neutral');
  if (balance > 0) {
    dashboard.classList.add('theme-positive');
  } else if (balance < 0) {
    dashboard.classList.add('theme-negative');
  } else {
    dashboard.classList.add('theme-neutral');
  }
  localStorage.setItem(LOCAL_STORAGE_BALANCE_KEY, balance);
}

// Function to render the transaction list based on current filters
function renderTransactions(filteredTransactions = transactions) {
  list.innerHTML = ''; 
  filteredTransactions.forEach(transaction => {
    const li = document.createElement('li');
    li.classList.add('transaction-item');
    if (transaction.type === 'expense') {
      li.classList.add('expense');
    }
    li.textContent = `${transaction.name} (${transaction.category}) - ₹${transaction.amount.toFixed(2)} (${transaction.date})`;
    list.appendChild(li);
  });
}

// Function to apply date and category filters
function applyFilters() {
  const startDate = filterStartDateInput.value;
  const endDate = filterEndDateInput.value;
  const category = filterCategorySelect.value;

  const filtered = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const startDateObj = startDate ? new Date(startDate) : null;
    const endDateObj = endDate ? new Date(endDate) : null;

    const dateCondition = (!startDateObj || transactionDate >= startDateObj) &&
      (!endDateObj || transactionDate <= endDateObj);
    const categoryCondition = !category || transaction.category === category;

    return dateCondition && categoryCondition;
  });

  renderTransactions(filtered);
}

// Function to generate monthly summary
function generateMonthlySummary() {
  const monthlyData = {};

  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const year = date.getFullYear();
    const month = date.getMonth();

    const key = `${year}-${month + 1}`;

    if (!monthlyData[key]) {
      monthlyData[key] = { income: 0, expense: 0 };
    }

    if (transaction.type === 'income') {
      monthlyData[key].income += transaction.amount;
    } else {
      monthlyData[key].expense += transaction.amount;
    }
  });

  monthlySummaryList.innerHTML = '';
  for (const monthYear in monthlyData) {
    const [year, month] = monthYear.split('-');
    const date = new Date(year, month - 1);
    const formattedMonthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });

    const summary = monthlyData[monthYear];
    const li = document.createElement('li');

    li.innerHTML = `
      <strong>${formattedMonthYear}</strong><br>
      Income: ₹${summary.income.toFixed(2)}<br>
      Expenses: ₹${summary.expense.toFixed(2)}
    `;

    monthlySummaryList.appendChild(li);
  }
}

// Function to export transactions as CSV
function exportTransactions() {
  if (transactions.length === 0) {
    alert("No transactions to export.");
    return;
  }

  const header = "Name,Amount,Date,Category,Type\n";
  const rows = transactions.map(transaction =>
    `${transaction.name},${transaction.amount},${transaction.date},${transaction.category},${transaction.type}`
  ).join("\n");

  const csvData = header + rows;
  const blob = new Blob([csvData], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'transactions.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// Event listener for form submission
form.addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const date = document.getElementById('date').value;
  const type = document.getElementById('type').value;
  const category = categorySelect.value;

  const newTransaction = { name, amount, date, type, category };
  transactions.push(newTransaction);

  if (type === 'expense') 
  {
    balance -= amount;
  } 
  else 
  {
    balance += amount;
  }

  updateBalanceDisplay();
  renderTransactions();
  generateMonthlySummary();
  localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS_KEY, JSON.stringify(transactions)); // Save transactions
  form.reset();
});

// Load data from localStorage on page load
updateBalanceDisplay();
renderTransactions();
generateMonthlySummary();

function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('active');
}