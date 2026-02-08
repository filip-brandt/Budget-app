// @ts-nocheck
import './styles/style.scss';

let budgetEntries = [];

let categories = {
    income: [],
    expense: []
};

// get html elements ------------------------------------------------------
const balanceAmount = document.getElementById('balanceAmount')
const incomeForm = document.getElementById('incomeForm') 
const incomeAmount = document.getElementById('incomeAmount')
const incomeDescription = document.getElementById('incomeDescription')
const incomeCategory = document.getElementById('incomeCategory')
const incomeList = document.getElementById('incomeList')
const expenseForm = document.getElementById('expenseForm')
const expenseAmount = document.getElementById('expenseAmount')
const expenseDescription = document.getElementById('expenseDescription')
const expenseCategory = document.getElementById('expenseCategory')
const expenseList = document.getElementById('expenseList')

// functions to add categories to dropdown selects -------------------------------------------------------------

// Retrieve categories from JSON file
async function loadCategories() {
    try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/categories.json`);
        console.log('Fetch URL:', response.url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Loaded categories:', data);
        categories = data;
        populateCategorySelects();
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

// Fill dropdown selects with categories
function populateCategorySelects() {
    console.log('Populating categories...', categories);
    console.log('incomeCategory element:', incomeCategory);
    console.log('expenseCategory element:', expenseCategory);
    
    incomeCategory.innerHTML = '<option value="">Choose category</option>';
    expenseCategory.innerHTML = '<option value="">Choose category</option>';

    categories.income.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        incomeCategory.appendChild(option);
    });

    categories.expense.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        expenseCategory.appendChild(option);
    });
}

// functions to store submitted form data as objects in an array, and save to localStorage -------------------------------------------------------------
// Handle income form submission
function handleIncomeSubmit(event) {
    event.preventDefault();
    const newEntry = createIncomeEntry();

    saveIncomeEntry(newEntry);
    resetIncomeForm();
    updateUI();
}

// Create income entry object from form data
function createIncomeEntry() {
    return {
        id: Date.now().toString(),
        type: 'income',
        amount: Number(incomeAmount.value),
        description: incomeDescription.value,
        category: incomeCategory.value
    };
}

// Save income entry to array and localStorage
function saveIncomeEntry(entry) {
    budgetEntries.push(entry);
    saveToLocalStorage();
}

function resetIncomeForm() {
    incomeAmount.value = '';
    incomeDescription.value = '';
    incomeCategory.value = '';
}

// update balance and entry lists in the UI 
function updateUI() {
    renderEntries();
    updateBalance();
}

incomeForm.addEventListener('submit', handleIncomeSubmit);

// Handle expense form submission
function handleExpenseSubmit(event) {
    event.preventDefault();
    const newEntry = createExpenseEntry();

    saveExpenseEntry(newEntry);
    resetExpenseForm();
    updateUI();
}

// Create expense entry object from form data
function createExpenseEntry() {
    return {
        id: Date.now().toString(),
        type: 'expense',
        amount: Number(expenseAmount.value),
        description: expenseDescription.value,
        category: expenseCategory.value
    };
}

// Save expense entry to array and localStorage
function saveExpenseEntry(entry) {
    budgetEntries.push(entry);
    saveToLocalStorage();
}

function resetExpenseForm() {
    expenseAmount.value = '';
    expenseDescription.value = '';
    expenseCategory.value = '';
}

expenseForm.addEventListener('submit', handleExpenseSubmit);    
    
// store budget entries in localStorage as stringified array to persist data across page reloads
function saveToLocalStorage() {
    const stringifiedEntries = JSON.stringify(budgetEntries);
    localStorage.setItem('budgetEntries', stringifiedEntries);
}

// functions to render balance and entry lists --------------------------------------------------------------
// Load budget entries from localStorage on page load
function loadFromLocalStorage() {
    const stored = localStorage.getItem('budgetEntries');

    if (stored === null || stored === '') {
        console.warn('No existing budget entries found in localStorage. Initializing with empty array.');
        budgetEntries = [];
        return;
    }

    budgetEntries = JSON.parse(stored);
    renderEntries();
    updateBalance();
}

// Calculate and update the balance display based on current budget entries
function updateBalance() {
    const totalIncome = budgetEntries.reduce((sum, entry) => {
        if (entry.type === 'income') {
            return sum + entry.amount;
        }
        return sum;
    }, 0);

    const totalExpense = budgetEntries.reduce((sum, entry) => {
        if (entry.type === 'expense') {
            return sum + entry.amount;
        }
        return sum;
    }, 0);

    const balance = totalIncome - totalExpense;
    balanceAmount.textContent = balance;

    if (balance > 0) {
        balanceAmount.classList.add('positive');
        balanceAmount.classList.remove('negative');
    } else if (balance < 0) {
        balanceAmount.classList.add('negative');
        balanceAmount.classList.remove('positive');
    } else {
        balanceAmount.classList.remove('positive', 'negative');
    }
}

// Render income and expense entries in their respective lists
function renderEntries() {
    incomeList.innerHTML = '';
    expenseList.innerHTML = '';

    budgetEntries.forEach(entry => {
        const li = document.createElement('li');
        const typeLabel = entry.type === 'income' ? 'Income' : 'Expense';
        li.innerHTML = `
        <label>${typeLabel}:</label> ${entry.description} - ${entry.amount} (${entry.category})
        <button class="delete-button" data-id="${entry.id}">Delete</button>`;

        if (entry.type === 'income') {
            incomeList.appendChild(li);
        } else if (entry.type === 'expense') {
            expenseList.appendChild(li);
        }
    });

    attachDeleteHandlers();
}

// Attach event listeners to delete buttons for each entry
function attachDeleteHandlers() {
    const deleteButtons = document.querySelectorAll('.delete-button');
    deleteButtons.forEach(button => {
        button.addEventListener('click', handleDeleteEntry);
    });
}

// Handle deletion of an entry when delete button is clicked
function handleDeleteEntry(event) {
    const entryId = event.target.getAttribute('data-id');
    deleteEntry(entryId);
}

function deleteEntry(entryId) {
    budgetEntries = budgetEntries.filter(entry => entry.id !== entryId);
    saveToLocalStorage();
    updateUI();
}

// Initialize page by loading categories and existing entries from localStorage

async function init() {
    await loadCategories();
    loadFromLocalStorage();
}

// calls function to load page data and categories from JSON file 
init();
 