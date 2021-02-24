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
  parentTaskList;

  constructor(textContent, id) {
    this.textContent = textContent;
  }
}

class TaskList {
  id = (Date.now() + "").slice(-10);
  childTasks = [];

  constructor(textContent) {
    const task = new Task();
    this.textContent = "New Task List";
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

  _toggleTaskListTextInput(taskList) {
    const newTaskListText = taskList.querySelector(
      ".task-list__topbar__heading"
    );
    const newTaskListTextInput = taskList.querySelector(
      ".task-list__text-area"
    );

    newTaskListText.classList.toggle("hidden");
    newTaskListTextInput.classList.toggle("hidden");

    if (!newTaskListTextInput.classList.contains("hidden")) {
      newTaskListTextInput.focus();
    }
  }

  _displayNewTaskList(taskList) {
    const html = `
    <div data-edited="false" data-id="${taskList.id}" class="task-list">
    <div class="task-list__topbar">
      <h2 class="task-list__topbar__heading">${
        taskList.textContent || "New Task List"
      }</h2>
      <div class="task-list__text-area hidden" contenteditable="true"></div>
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
    const taskHTML = taskBoard.querySelector(`.new-task[data-id="${task.id}"]`);

    taskHTML.querySelector(".new-task__text").textContent = task.textContent;
    taskHTML.querySelector(".new-task__text-area").value = task.textContent;
  }

  _populateTaskListContent(taskList) {
    const taskListHTML = taskBoard.querySelector(
      `.task-list[data-id="${taskList.id}"]`
    );

    if (!taskList.textContent) {
      taskList.textContent = "New Task List";
    }

    taskListHTML.querySelector(".task-list__topbar__heading").textContent =
      taskList.textContent;
    taskListHTML.querySelector(".task-list__text-area").value =
      taskList.textContent;
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

  taskListEditingEnabled = true;
  taskListIsBeingEdited = false;
  taskListIsFinishedEditing = true;

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

    this._setActiveTaskList(newTaskList);

    this.newTaskFromList(this.activeTaskListHTML);

    ui._horizontalScroll();

    this._setLocalStorage();
  }

  newTaskFromList(currentTaskList) {
    const newTask = new Task();
    const parentTaskListObj = this._getNodeObj(currentTaskList);
    newTask.parentTaskList = parentTaskListObj.id;
    this.allTasks.push(newTask);
    const newestTask = ui._displayNewTask(currentTaskList);

    this.activeTaskObj = newTask;
    this.activeTaskHTML = newestTask;

    this._setLocalStorage();
  }

  newTask(e) {
    const target = e.target;
    const parentTaskList = target.closest(".task-list");
    const parentTaskListObj = this._getNodeObj(parentTaskList);

    if (target.className !== "new-task") return;
    if (target.dataset.edited === "true") {
      return this.editTaskTextContent(target);
    }

    this._toggleTaskEditing();

    const newTask = new Task();
    newTask.parentTaskList = parentTaskListObj.id;
    this.allTasks.push(newTask);
    this.activeTaskObj = newTask;
    this.activeTaskHTML = e.target;

    this._manageTaskId(target);
    this._manageTaskEdited(target);

    ui._toggleTaskTextInput(target);
    ui._displayNewTask(target);

    this._updateChildTaskList(parentTaskListObj);

    this._setLocalStorage();
  }

  _setActiveTask() {
    // Some Code
  }

  _setActiveTaskList(data) {
    let taskListObject;
    let taskListHTML;

    if (data.id) {
      taskListObject = data;
      taskListHTML = taskBoard.querySelector(
        `.task-list[data-id="${taskListObject.id}"]`
      );

      this.activeTaskListObj = taskListObject;
      this.activeTaskListHTML = taskListHTML;

      return taskListHTML;
    }

    if (!data.id) {
      taskListHTML = data.closest(".task-list");

      taskListObject = this.allTaskLists.find(
        (taskList) => taskList.id === taskListHTML.dataset.id
      );

      this.activeTaskListObj = taskListObject;
      this.activeTaskListHTML = taskListHTML;

      return taskListObject;
    }
  }

  editTaskTextContent(task) {
    const currentTask = this.allTasks.find(
      (storedTask) => storedTask.id === task.dataset.id
    );
    this._processTaskTextInput();

    this._setLocalStorage();
  }

  _updateChildTaskList(taskList) {
    const taskListHTML = taskBoard.querySelector(
      `.task-list[data-id="${taskList.id}"]`
    );
    const allChildTasks = taskListHTML.querySelectorAll(".new-task");
    const allChildTasksIds = [];

    allChildTasks.forEach((task) => allChildTasksIds.push(task.dataset.id));

    taskList.childTasks = allChildTasksIds;
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
      if (this.taskListIsBeingEdited) {
        this._handleTaskListEdit(e.target);
      }
    }

    if (e.target.classList.contains("task-list__topbar__heading")) {
      this._setActiveTaskList(e.target);
      this._handleTaskListEdit(e.target);
    }

    if (!this.taskEditingEnabled) return;
    this._handleNewTaskCreation(e);
  }

  _keyPressHandler(e) {
    if (e.key !== "Enter") return;

    if (this.taskIsBeingEdited) {
      this._handleTaskEdit();
    }

    if (this.taskListIsBeingEdited) {
      this._handleTaskListEdit();
    }

    if (!this.taskEditingEnabled) return;
    this._handleNewTaskCreation(e);
  }

  _processTaskTextInput(target) {
    const taskText = this.activeTaskHTML.querySelector(".new-task__text-area")
      .textContent;

    if (!taskText) return this._undoTaskCreation(this.activeTaskHTML);

    this.activeTaskObj.textContent = taskText;

    ui._toggleTaskTextInput(this.activeTaskHTML);
    ui._populateTextContent(this.activeTaskObj);
  }

  _processTaskListTextInput(target) {
    const taskListText = this.activeTaskListHTML.querySelector(
      ".task-list__text-area"
    ).textContent;

    this.activeTaskListObj.textContent = taskListText;

    ui._toggleTaskListTextInput(this.activeTaskListHTML);
    ui._populateTaskListContent(this.activeTaskListObj);
  }

  _toggleTaskEditing() {
    this.taskEditingEnabled = !this.taskEditingEnabled;
    this.taskIsBeingEdited = !this.taskIsBeingEdited;
    this.taskIsFinishedEditing = !this.taskIsFinishedEditing;
  }

  _toggleTaskListEditing() {
    this.taskListEditingEnabled = !this.taskListEditingEnabled;
    this.taskListIsBeingEdited = !this.taskListIsBeingEdited;
    this.taskListIsFinishedEditing = !this.taskListIsFinishedEditing;
  }

  _getNodeObj(node) {
    if (node.classList.contains("task")) {
      const obj = this.allTasks.find((task) => task.id === node.dataset.id);

      return obj;
    }

    if (node.classList.contains("task-list")) {
      const obj = this.allTaskLists.find(
        (taskList) => taskList.id === node.dataset.id
      );

      return obj;
    }
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

  _handleTaskListEdit() {
    this._toggleTaskListEditing();
    this._processTaskListTextInput();

    this._setLocalStorage();
  }

  _handleNewTaskCreation(e) {
    if (e.target.classList.contains("new-task")) this.newTask(e);
    if (e.target.classList.contains("new-task-list")) this.newTaskList(e);
  }

  _renderAllTaskLists() {
    this.allTaskLists.forEach((taskList) => ui._displayNewTaskList(taskList));
  }

  _renderAllTasks() {
    this.allTasks.forEach((task) => ui._displayNewTask(task));
  }

  _setLocalStorage() {
    localStorage.setItem("taskLists", JSON.stringify(this.allTaskLists));
    localStorage.setItem("tasks", JSON.stringify(this.allTasks));
  }

  _getLocalStorage() {
    const taskListData = JSON.parse(localStorage.getItem("taskLists"));
    const taskData = JSON.parse(localStorage.getItem("tasks"));

    if (!taskListData) return;

    this.allTaskLists = taskListData;
    this.allTasks = taskData;

    // Add logic for iterating through all taskLists and rendering each in order
    this._renderAllTaskLists();

    // Add logic for iterating through all tasks and rendering each in their respective tasklists
    // this._renderAllTasks();
  }
}

const app = new App();
const ui = new UI();
app._getLocalStorage();

document.addEventListener("keypress", function (e) {
  if (e.code === "KeyL") {
    localStorage.clear();
    console.log("LS Cleared");
  }
});
