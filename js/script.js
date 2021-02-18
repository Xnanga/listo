"use: strict";

// Layout elements
const navBar = document.querySelector(".nav-bar");
const utilityBar = document.querySelector(".utility-bar");
const taskBoard = document.querySelector(".task-board");

// DOM Elements
const newTaskListBtn = document.querySelector(".new-task-list");

// Classes

class App {
  allTaskLists = [];
  allTasks = [];

  constructor() {
    newTaskListBtn.addEventListener("click", this.newTaskList);
    this._attachEventListeners();
  }

  newTaskList() {
    const newTaskList = new TaskList();
    ui._displayNewTaskList(newTaskList);
    app._attachEventListeners(newTaskList);
  }

  newTask(e) {
    const clickedElement = e;
    if (clickedElement.target.className !== "new-task") return;

    const newTask = new Task();

    // Toggle text input
    // Process text input once clicked away
    // Add it to task text content
    // Display new add task button under

    ui._displayNewTask(clickedElement.target);
    app._attachEventListeners(newTask);
  }

  _attachEventListeners(component) {
    const allTaskLists = document.querySelectorAll(".task-list");

    allTaskLists.forEach((list) =>
      list.addEventListener("click", this.newTask)
    );
  }
}

class UI {
  constructor() {}

  _displayNewTaskList() {
    const html = `
    <div class="task-list">
    <div class="task-list__topbar">
      <h2 class="task-list__topbar__heading">Sgaia Foods</h2>
      <button class="task-list__topbar__btn">EDIT</button>
    </div>
    <div class="new-task">
      <span class="task-text">Add a new task</span>
    </div>
  </div>
    `;

    newTaskListBtn.insertAdjacentHTML("beforebegin", html);
  }

  _displayNewTask(el) {
    const html = `
    <div class="new-task">
    <span class="new-task__text">Add a new task</span>
    <textarea
      class="new-task__text-area hidden"
      name="TaskTextInput"
      id="TaskTextInput-1"
    ></textarea>
    </div>
    `;

    el.closest(".task-list").insertAdjacentHTML("beforeend", html);
  }
}

class TaskList {
  id = (Date.now() + "").slice(-10);

  constructor(textContent) {
    this.textContent = textContent;

    app.allTaskLists.push(this);
  }
}

class Task extends TaskList {
  id = (Date.now() + "").slice(-10);

  constructor(textContent) {
    super(textContent);

    app.allTasks.push(this);
  }
}

const app = new App();
const ui = new UI();
