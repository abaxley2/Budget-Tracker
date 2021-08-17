// declare variables
let db;
let budget;

// Create a new db request for a "budget" database and define port if taken
const request = indexedDB.open("budgetDB", budget || 21);

// requests
request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("budgetDB", { autoIncrement: true });
};

request.onerror = function (e) {
  console.log(`Well, Shit! ${e.target.errorCode}`);
};

request.onsuccess = function (e) {
  db = e.target.result;
  if (navigator.onLine) {
    checkDatabase();
  }
};

// check database
const saveRecord = (record) => {
  const transaction = db.transaction(["budgetDB"], "readwrite");
  const store = transaction.objectStore("budgetDB");
  store.add(record);
};

function checkDatabase() {
  const transaction = db.transaction(["budgetDB"], "readwrite");
  const store = transaction.objectStore("budgetDB");
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          const transaction = db.transaction(["budgetDB"], "readwrite");
          const store = transaction.objectStore("budgetDB");
          store.clear();
        });
    }
  };
}

// listening for online status
window.addEventListener("online", checkDatabase);
