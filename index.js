// ACCOUNT
let account1 = {
  owner: "Andrii Myronenko",
  history: [],
  pin: 1111,
};

// ELEMENTS
//getting element
const getElement = function (domElement) {
  return document.querySelector(domElement);
};

// login
const inputLoginUsername = getElement(".input-login--user");
const inputLoginPin = getElement(".input-login--pin");
const inputLoginArea = document.querySelectorAll(".input-login");
// labels
const labelWelcome = getElement(".primary-heading");
const labelDate = getElement(".date");
const labelBalance = getElement(".balance-value");
const labelSumIn = getElement(".summary--value--in");
const labelSumOut = getElement(".summary--value--out");
const labelTimer = getElement(".timer");
const labelCategoryIncome = getElement(".transaction-category--income");
const labelCategoryOutcome = getElement(".transaction-category--outcome");
// app
const containerApp = getElement(".app");
// history
const containerHistory = getElement(".history");
// buttons
const btnLogin = getElement(".login--btn");
const btnIncome = getElement(".form--btn--income");
const btnOutcome = getElement(".form--btn--outcome");
const btnClose = getElement(".form--btn--close");
const btnSort = getElement(".btn--sort");
// forms
const incomeCategory = getElement(".form--income--category");
const outcomeCategory = getElement(".form--output--category");
const inputIncomeAmount = getElement(".form--income--amount");
const inputOutcomeAmount = getElement(".form--outcome--amount");
const inputCloseUsername = getElement(".form--input--user");
const inputClosePin = getElement(".form--input--pin");

// CREATE USERNAME
const createUserName = function (user) {
  const username = user.owner
    .toLowerCase()
    .split(" ")
    .map((word) => word[0])
    .join("");
  user.username = username;
};
createUserName(account1);

let timer;
// START LOGOUT TIMER
function startLogoutTimer() {
  let time = 300;
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = "Trackr app";
      containerApp.classList.remove("app--open");
    }
    time--;
  };
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
}

// LOGIN
btnLogin.addEventListener("click", function (e) {
  e.preventDefault();
  // GET USER DATA FROM LOCAL STORAGE
  if (localStorage.getItem("user") !== null) getLocalStorage();
  // CHECK IF LOGIN TRUE
  if (
    account1.username === inputLoginUsername.value &&
    account1.pin === Number(inputLoginPin.value)
  ) {
    // Display UI and message
    inputLoginArea.forEach((element) =>
      element.classList.remove("input-login--incorrect")
    );
    labelWelcome.textContent = `${account1.owner}, welcome back!`;
    containerApp.classList.add("app--open");
    // DATES
    const now = new Date();
    const options = {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long",
    };
    labelDate.textContent = Intl.DateTimeFormat("en-UK", options).format(now);
    // TIMER
    if (timer) clearInterval(timer);
    timer = startLogoutTimer();
    // CLEAR INPUT FIELDS
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();
    // DISPLAY HISTORY
    displayHistory(account1);
    // DISPLAY BALANCE
    currBalance();
    // DISPLAY SUMMARY
    calcSummaryInOut();
  } else {
    inputLoginArea.forEach((element) =>
      element.classList.toggle("input-login--incorrect")
    );
    inputLoginUsername.value = inputLoginPin.value = "";
  }
});

// DISPLAY HISTORY
function displayHistory(object, sort = false) {
  // SORTING ARRAY
  const sortedArrayOfObjects = sort
    ? object.history.slice().sort((a, b) => a.amount - b.amount)
    : object.history;
  // CREATE NEW HTML
  containerHistory.innerHTML = "";
  sortedArrayOfObjects.forEach(function (item) {
    const type = item.amount > 0 ? "income" : "outcome";
    const date = new Date(item.date);
    const displayDate = formatHistoryDate(date);
    const html = `
      <div class="transaction-row">
        <div class="transaction-type transaction-type--${type}">${type.toUpperCase()}</div>
        <div class="transaction-date">${displayDate}</div>
        <div class="transaction-category transaction-category--${type}">${
      item.category
    }</div>
        <div class="transaction-value">${
          item.amount % 1 === 0 ? Math.trunc(item.amount) : item.amount
        }$</div>
      </div>`;
    // APPEND NEW HTML
    containerHistory.insertAdjacentHTML("afterbegin", html);
  });
}

// ADD INCOME
btnIncome.addEventListener("click", function (e) {
  e.preventDefault();
  // CREATING NEW TRANSACTION IN OBJECT
  if (inputIncomeAmount.value > 0 && inputIncomeAmount.value <= 99999) {
    let newTransaction = {};
    newTransaction.category = incomeCategory.value;
    newTransaction.amount = Number(
      parseFloat(inputIncomeAmount.value).toFixed(2)
    );
    newTransaction.date = new Date().toISOString();
    account1.history.push(newTransaction);
    displayHistory(account1);
    // REFRESHING INPUT AREA
    incomeCategory.value = "Uncategorized";
    inputIncomeAmount.value = "";
    // RECALCULATING VALUES
    currBalance();
    calcSummaryInOut();
    setLocalStorage();
    const lastTransaction = document.querySelectorAll(".transaction-row");
    highlight(lastTransaction);
    // RESET THE TIMER
    clearInterval(timer);
    timer = startLogoutTimer();
  }
});

// ADD OUTCOME
btnOutcome.addEventListener("click", function (e) {
  e.preventDefault();
  // CREATING NEW TRANSACTION IN OBJECT
  if (inputOutcomeAmount.value > 0 && inputOutcomeAmount.value <= 99999) {
    let newTransaction = {};
    newTransaction.category = outcomeCategory.value;
    newTransaction.amount = -Math.abs(
      Number(parseFloat(inputOutcomeAmount.value).toFixed(2))
    );
    newTransaction.date = new Date().toISOString();
    account1.history.push(newTransaction);
    displayHistory(account1);
    // REFRESHING INPUT AREA
    outcomeCategory.value = "Uncategorized";
    inputOutcomeAmount.value = "";
    // RECALCULATING VALUES
    currBalance();
    calcSummaryInOut();
    setLocalStorage();
    const lastTransaction = document.querySelectorAll(".transaction-row");
    highlight(lastTransaction);
    // RESET THE TIMER
    clearInterval(timer);
    timer = startLogoutTimer();
  }
});

// CLOSE ACCOUNT
btnClose.addEventListener("click", function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === account1.username &&
    Number(inputClosePin.value) === account1.pin
  ) {
    containerApp.classList.remove("app--open");
    labelWelcome.textContent = "Trackr app";
  }
  setLocalStorage();
  console.log(localStorage);
});

// HIGHLIGHT FIRST CHILD Of HISTORY
function highlight(nodeList) {
  nodeList[0].classList.add("transaction-row--new");
  setTimeout(() => {
    nodeList[0].classList.remove("transaction-row--new");
  }, 2000);
}

// CALCULATING DATE OF TRANSACTION
function formatHistoryDate(date) {
  const calcDaysPast = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  const daysPassed = calcDaysPast(new Date(), date);
  if (daysPassed === 0) return "Today";
  if (daysPassed === 1) return "Yesterday";
  if (daysPassed <= 7) return `${daysPassed} days ago`;
}

// GETTING AMOUNTS FROM OBJECT
function getAmount(object) {
  return object.history.map((item) => item.amount);
}

// CURRENT BALANCE
function currBalance() {
  let tempArray = getAmount(account1);
  let balance = tempArray.reduce((a, b) => a + b, 0);
  labelBalance.textContent =
    balance % 1 === 0 ? balance + "$" : balance.toFixed(2) + "$";
}

// CALCULATION OF IN AND OUT SUMMARY
function calcSummaryInOut() {
  let tempArray = getAmount(account1);
  let sum = tempArray.filter((x) => x > 0).reduce((a, b) => a + b, 0);
  let out = tempArray.filter((x) => x < 0).reduce((a, b) => a + b, 0);
  labelSumIn.textContent = sum % 1 === 0 ? sum + "$" : sum.toFixed(2) + "$";
  labelSumOut.textContent = out % 1 === 0 ? out + "$" : out.toFixed(2) + "$";
}

// SORT BTN EVENT
let sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayHistory(account1, !sorted);
  sorted = !sorted;
});

// SAVING DATA IN LOCAL STORAGE
function getLocalStorage() {
  account1 = JSON.parse(localStorage.getItem("user"));
}

function setLocalStorage() {
  localStorage.setItem("user", JSON.stringify(account1));
}
