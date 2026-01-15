const BASE_URL = "http://localhost:3000/api";

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = options.headers || {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!headers['Content-Type'] && options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  }

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return null;
}
// ----- Auth -----
export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function register(email, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

// ----- Transactions (Income + Expense) -----
export async function getTransactions(token) {
  const res = await fetch(`${BASE_URL}/transactions`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  return res.json();
}

export async function addTransaction(token, transactionData) {
  const res = await fetch(`${BASE_URL}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(transactionData)
  });
  return res.json();
}

export async function updateTransaction(token, id, update) {
  const res = await fetch(`${BASE_URL}/transactions/${id}`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(update)
  });
  return res.json();
}

export async function deleteTransaction(token, id) {
  const res = await fetch(`${BASE_URL}/transactions/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Error deleting transaction");
  return res.json();
}

// ----- Optional helper for category totals -----
export async function getCategoryTotals(token) {
  const transactions = await getTransactions(token);
  const totals = {};
  transactions.forEach(t => {
    if (!totals[t.category]) totals[t.category] = 0;
    totals[t.category] += Number(t.amount);
  });
  return totals;
}

//--------- Fetching data -------------

/*export async function getExpenses(token) {
  const res =  await fetch(`${BASE_URL}/expenses`, { method: 'GET',
    headers: {"Authorization": `Bearer ${token}`}
   });
  return res.json();
}

export async function getBudgets(token) {
  const res =  await fetch(`${BASE_URL}/budgets`, { method: 'GET',
    headers: {"Authorization": `Bearer ${token}`}
   });
  return res.json();
}*/

export async function getExpenses() {
  return request('/expenses', { method: 'GET' });
}

export async function getCategories() {
  return request('/categories', { method: 'GET' });
}

export async function putCategory(token, categoryData) {
  const res = await fetch(`${BASE_URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(categoryData)
  });
  return res.json();
}

export async function getBudgets() {
  return request('/budgets', { method: 'GET' });
}
