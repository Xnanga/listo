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

  taskEditingEnabled = true;
  taskIsBeingEdited = false;
  taskIsFinishedEditing = true;

  activeTaskObj;
  activeTaskHTML;

  constructor() {
    this._attachEventListeners();
  }

  newTaskList() {
    const newTaskList = new TaskList();
    ui._displayNewTaskList(newTaskList);
  }

  newTask(e) {
    const target = e.target;

    if (target.className !== "new-task") return;
    if (target.dataset.edited === "true")
      return this.editTaskTextContent(target);

    this._toggleTaskEditing();

    const newTask = new Task();
    this.activeTaskObj = newTask;
    this.activeTaskHTML = e.target;

    // Change data edited to true
    this._manageTaskId(e.target);

    // Toggle text input
    ui._toggleTaskTextInput(target);

    // Display new task
    ui._displayNewTask(target);
  }

  editTaskTextContent(task) {
    const currentTask = this.allTasks.find(
      (storedTask) => storedTask.id === task.dataset.id
    );
    this._processTaskTextInput();
  }

  _attachEventListeners() {
    taskBoard.addEventListener("click", this._clickHandler.bind(this));
    taskBoard.addEventListener("keypress", this._keyPressHandler.bind(this));
  }

  _clickHandler(e) {
    if (e.target.classList.contains("task-board")) {
      if (this.taskIsBeingEdited) {
        this._handleTaskEdit();
      }
    }

    if (!this.taskEditingEnabled) return;
    this._handleNewTaskCreation(e);
  }

  _keyPressHandler(e) {
    if (e.key !== "Enter") return;

    if (this.taskIsBeingEdited) {
      this._handleTaskEdit();
    }

    if (!this.taskEditingEnabled) return;
    this._handleNewTaskCreation(e);
  }

  _processTaskTextInput(target) {
    const taskText = this.activeTaskHTML.querySelector(".new-task__text-area")
      .textContent;

    if (!taskText) return this._undoTaskCreation(this.activeTaskHTML);

    this.activeTaskObj.textContent = taskText;
    this.activeTaskObj.node = this.activeTaskHTML;

    ui._toggleTaskTextInput(this.activeTaskHTML);
    ui._populateTextContent(this.activeTaskObj);
  }

  _toggleTaskEditing() {
    this.taskEditingEnabled = !this.taskEditingEnabled;
    this.taskIsBeingEdited = !this.taskIsBeingEdited;
    this.taskIsFinishedEditing = !this.taskIsFinishedEditing;
  }

  _manageTaskId(task) {
    task.dataset.edited = "true";
  }

  _undoTaskCreation(target) {
    const removedTaskId = target.getAttribute("data-id");
    const removedTaskHTML = document.querySelector(
      `[data-id="${removedTaskId}"]`
    );

    removedTaskHTML.outerHTML = "";
    this.allTasks.pop();
  }

  _handleTaskEdit() {
    this._toggleTaskEditing();
    this._processTaskTextInput();
  }

  _handleNewTaskCreation(e) {
    if (e.target.classList.contains("new-task")) this.newTask(e);
    if (e.target.classList.contains("new-task-list")) this.newTaskList(e);
  }
}

class UI {
  constructor() {}

  _toggleTaskTextInput(task) {
    task.querySelector(".new-task__text").classList.toggle("hidden");
    task.querySelector(".new-task__text-area").classList.toggle("hidden");
  }

  _displayNewTaskList() {
    const html = `
    <div class="task-list">
    <div class="task-list__topbar">
      <h2 class="task-list__topbar__heading">New Task List</h2>
      <button class="task-list__topbar__btn">EDIT</button>
    </div>
    <div data-edited="false" class="new-task">
    <span class="new-task__text">Add a new task</span>
    <div class="new-task__text-area hidden" contenteditable="true"></div>
  </div>
    </div>
  </div>
    `;

    newTaskListBtn.insertAdjacentHTML("beforebegin", html);
  }

  _displayNewTask(el) {
    const html = `
    <div data-edited="false" data-id="${app.activeTaskObj.id}" class="new-task">
    <span class="new-task__text">Add a new task</span>
    <div class="new-task__text-area hidden" contenteditable="true"></div>
  </div>
    `;

    el.closest(".task-list").insertAdjacentHTML("beforeend", html);
  }

  _populateTextContent(task) {
    task.node.querySelector(".new-task__text").textContent = task.textContent;
    task.node.querySelector(".new-task__text-area").value = task.textContent;
  }
}

class TaskList {
  id = (Date.now() + "").slice(-10);
  node;

  constructor(textContent) {
    this.textContent = textContent;

    app.allTaskLists.push(this);
  }
}

class Task {
  id = (Date.now() + "").slice(-10);
  node;

  constructor(textContent) {
    this.textContent = textContent;

    app.allTasks.push(this);
  }
}

const app = new App();
const ui = new UI();
const taskList = new TaskList();
const task = new Task();
