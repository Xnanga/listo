"use: strict";

// Layout elements
const navBar = document.querySelector(".nav-bar");
const utilityBar = document.querySelector(".utility-bar");
const taskBoard = document.querySelector(".task-board");

// DOM Elements
const newTaskListBtn = document.querySelector(".new-task-list");

// Classes

class Task {
  id = (Date.now() + "").slice(-10);
  node;

  constructor(textContent, id) {
    this.textContent = textContent;
  }
}

class TaskList {
  id = (Date.now() + "").slice(-10);
  node;

  constructor(textContent) {
    const task = new Task();
    this.textContent = textContent;
  }
}

class UI {
  constructor() {}

  _toggleTaskTextInput(task) {
    const newTaskText = task.querySelector(".new-task__text");
    const newTaskTextInput = task.querySelector(".new-task__text-area");

    newTaskText.classList.toggle("hidden");
    newTaskTextInput.classList.toggle("hidden");

    if (!newTaskTextInput.classList.contains("hidden")) {
      newTaskTextInput.focus();
    }
  }

  _displayNewTaskList() {
    const html = `
    <div class="task-list">
    <div class="task-list__topbar">
      <h2 class="task-list__topbar__heading">New Task List</h2>
      <button class="task-list__topbar__btn">EDIT</button>
    </div>
    </div>
    `;

    newTaskListBtn.insertAdjacentHTML("beforebegin", html);

    const allLists = document.querySelectorAll(".task-list");
    const newestList = allLists[allLists.length - 1];
    return newestList;
  }

  _displayNewTask(el) {
    const html = `
    <div data-edited="false" class="new-task">
    <span class="new-task__text">Add a new task</span>
    <div class="new-task__text-area hidden" contenteditable="true"></div>
  </div>
    `;

    el.closest(".task-list").insertAdjacentHTML("beforeend", html);
    const allTasks = el.querySelectorAll(".new-task");
    return allTasks[allTasks.length - 1];
  }

  _populateTextContent(task) {
    task.node.querySelector(".new-task__text").textContent = task.textContent;
    task.node.querySelector(".new-task__text-area").value = task.textContent;
  }

  _horizontalScroll() {
    taskBoard.scroll({
      left: 10000,
      behavior: "smooth",
    });
  }
}

class App {
  allTaskLists = [];
  allTasks = [];

  taskEditingEnabled = true;
  taskIsBeingEdited = false;
  taskIsFinishedEditing = true;

  activeTaskObj;
  activeTaskHTML;

  activeTaskListObj;
  activeTaskListHTML;

  constructor() {
    this._attachEventListeners();
  }

  newTaskList() {
    const newTaskList = new TaskList();
    this.allTaskLists.push(newTaskList);
    const newestTaskList = ui._displayNewTaskList(newTaskList);

    this.activeTaskListObj = newTaskList;
    this.activeTaskListHTML = newestTaskList;

    this.newTaskFromList(this.activeTaskListHTML);

    ui._horizontalScroll();
  }

  newTaskFromList(currentTaskList) {
    const newTask = new Task();
    this.allTasks.push(newTask);
    const newestTask = ui._displayNewTask(currentTaskList);

    this.activeTaskObj = newTask;
    this.activeTaskHTML = newestTask;
  }

  newTask(e) {
    const target = e.target;

    if (target.className !== "new-task") return;
    if (target.dataset.edited === "true") {
      return this.editTaskTextContent(target);
    }

    this._toggleTaskEditing();

    const newTask = new Task();
    this.allTasks.push(newTask);
    this.activeTaskObj = newTask;
    this.activeTaskHTML = e.target;

    this._manageTaskId(target);
    this._manageTaskEdited(target);

    ui._toggleTaskTextInput(target);

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
    // Display a black overlay across the screen (Enable pointer events)
    // Only editable task is above black overlay in z-index
    // Trigger finished editing or undo creation when black overlay clicked

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
    task.dataset.id = this.activeTaskObj.id;
  }

  _manageTaskEdited(task) {
    task.dataset.edited = "true";
    task.classList.add("new-task--populated");
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

  _setLocalStorage() {
    localStorage.setItem("taskLists", JSON.stringify(this.allTaskLists));
    localStorage.setItem("tasks", JSON.stringify(this.allTasks));
  }

  _getLocalStorage() {
    const taskListData = JSON.parse(localStorage.getItem("taskLists"));
    const taskData = JSON.parse(localStorage.getItem("tasks"));

    if (!taskListData || !taskData) return;

    this.allTaskLists = taskListData;
    this.allTasks = taskData;

    // Add logic for iterating through all taskLists and rendering each in order

    // Add logic for iterating through all tasks and rendering each in their respective tasklists
  }
}

const app = new App();
const ui = new UI();
