"use: strict";

// Layout elements
const navBar = document.querySelector(".nav-bar");
const utilityBar = document.querySelector(".utility-bar");
const taskBoard = document.querySelector(".task-board");
const focusOverlay = document.querySelector(".focus-overlay");

// DOM Elements
const newTaskListBtn = document.querySelector(".new-task-list-btn");
const priorityMenu = document.querySelector(".priority-menu");
const taskMenu = document.querySelector(".task-menu");

// Classes
class Task {
  id = (Date.now() + "").slice(-10);
  parentTaskList;
  priority = "none";
  status = "due";
  statusText = "No Due Date Set";
  dueDate;

  constructor(textContent, id) {
    this.textContent = "Add New Task";
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
  priorityMenuOpen = false;
  taskMenuOpen = false;
  focusOverlayVisible = false;

  constructor() {}

  _toggleTaskTextInput(task) {
    const newTaskText = task.querySelector(".task-card__text");
    const newTaskTextInput = task.querySelector(".task-card__text-area");

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
    //prettier-ignore
    const html = `
    <div data-edited="false" data-id="${taskList.id}" class="task-list">
    <div class="task-list__topbar">
      <h2 class="task-list__topbar__heading">${taskList.textContent || "New Task List"}</h2>
      <div class="task-list__text-area hidden" contenteditable="true">${taskList.textContent || "New Task List"}</div>
      <div class="ellipsis-btn__container">
        <div class="ellipsis-btn__dot"></div>
        <div class="ellipsis-btn__dot"></div>
        <div class="ellipsis-btn__dot"></div>
      </div>
    </div>
      <div class="task-list__task-container"></div>
      <button class="new-task-btn">Add New Task</button>
    </div>
    `;

    newTaskListBtn.insertAdjacentHTML("beforebegin", html);

    const allLists = document.querySelectorAll(".task-list");
    const newestList = allLists[allLists.length - 1];
    return newestList;
  }

  _displayEmptyTask(taskList) {
    const taskListContainer = taskList.querySelector(
      ".task-list__task-container"
    );
    const html = `
    <div data-edited="false" class="task-card">
      <span class="task-card__text"></span>
      <div class="task-card__text-area hidden" contenteditable="true"></div>
      <div class="task-card__priority-bar"></div>
      <div class="ellipsis-btn__container">
        <div class="ellipsis-btn__dot"></div>
        <div class="ellipsis-btn__dot"></div>
        <div class="ellipsis-btn__dot"></div>
      </div>
      <div class="task-card__status">No Due Date Set</div>
    </div>
    `;

    return taskListContainer.insertAdjacentHTML("beforeend", html);
  }

  _displayNewTask(el, task) {
    let html;

    if (task) {
      //prettier-ignore
      html = `
      <div data-edited="${task.textContent === "Add New Task" ? "false" : "true"}" data-id="${task.id}" class="task-card task-card--${task.status}">
        <span class="task-card__text">${task.textContent}</span>
        <div class="task-card__text-area hidden" contenteditable="true">${task.textContent}</div>
        <div class="task-card__priority-bar task-card__priority-bar--${task.priority}"></div>
        <div class="ellipsis-btn__container">
          <div class="ellipsis-btn__dot"></div>
          <div class="ellipsis-btn__dot"></div>
          <div class="ellipsis-btn__dot"></div>
        </div>
        <div class="task-card__status">${task.statusText}</div>
      </div>
      `;

      el.querySelector(".task-list__task-container").insertAdjacentHTML(
        "beforeend",
        html
      );
    } else {
      //prettier-ignore
      html = `
      <div data-edited="false" class="task-card">
        <span class="task-card__text">Add New Task</span>
        <div class="task-card__text-area hidden" contenteditable="true">${task.textContent}</div>
        <div class="task-card__priority-bar task-card__priority-bar--${task.priority}"></div>
        <div class="ellipsis-btn__container">
          <div class="ellipsis-btn__dot"></div>
          <div class="ellipsis-btn__dot"></div>
          <div class="ellipsis-btn__dot"></div>
        </div>
        <div class="task-card__status">${task.statusText}</div>
      </div>
      `;

      if (el.closest(".task-list__task-container")) {
        el.closest(".task-list__task-container").insertAdjacentHTML(
          "beforeend",
          html
        );
      } else if (el.querySelector(".task-list__task-container")) {
        el.querySelector(".task-list__task-container").insertAdjacentHTML(
          "beforeend",
          html
        );
      }
    }

    const allTasks = el.querySelectorAll(".task-card");
    return allTasks[allTasks.length - 1];
  }

  switchTaskStatus(newStatus) {
    const activeTask = app.activeTaskHTML;
    console.log(activeTask);

    activeTask.classList = "";

    if (newStatus === "completed") {
      activeTask.classList.add("task-card");
      activeTask.classList.add("task-card--completed");
    }

    if (newStatus === "blocked") {
      activeTask.classList.add("task-card");
      activeTask.classList.add("task-card--blocked");
    }

    if (newStatus === "delete") {
      activeTask = "";
    }
  }

  _populateTextContent(task) {
    const taskHTML = taskBoard.querySelector(
      `.task-card[data-id="${task.id}"]`
    );

    taskHTML.querySelector(".task-card__text").textContent = task.textContent;
    taskHTML.querySelector(".task-card__text-area").value = task.textContent;
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

  _displayPriorityMenu(e) {
    this.priorityMenuOpen = true;
    this._moveElementToCursor(e, priorityMenu);
    priorityMenu.classList.remove("hidden");
  }

  _removePriorityMenu() {
    this.priorityMenuOpen = false;
    priorityMenu.classList.add("hidden");
  }

  _displayTaskMenu(e) {
    this.taskMenuOpen = true;
    this._moveElementToCursor(e, taskMenu);
    taskMenu.classList.remove("hidden");
  }

  _removeTaskMenu() {
    this.taskMenuOpen = false;
    taskMenu.classList.add("hidden");
  }

  _displayFocusOverlay(el) {
    this.focusOverlayVisible = true;
    focusOverlay.classList.remove("hidden");
    if (el) el.style.zIndex = "20";
  }

  _removeFocusOverlay(el) {
    this.focusOverlayVisible = false;
    focusOverlay.classList.add("hidden");
    if (el) {
      el.style.zIndex = "5";
    }
  }

  _changeTaskPriorityStrip(priority) {
    const priorityStrip = app.activeTaskHTML.querySelector(
      ".task-card__priority-bar"
    );

    priorityStrip.className = "";
    priorityStrip.classList.add("task-card__priority-bar");

    switch (priority) {
      case "high":
        app.activeTaskObj.priority = "high";
        priorityStrip.classList.add("task-card__priority-bar--high");
        break;
      case "medium":
        app.activeTaskObj.priority = "medium";
        priorityStrip.classList.add("task-card__priority-bar--medium");
        break;
      case "low":
        app.activeTaskObj.priority = "low";
        priorityStrip.classList.add("task-card__priority-bar--low");
    }

    this._removePriorityMenu();
    app._setLocalStorage();
  }

  _horizontalScroll() {
    taskBoard.scroll({
      left: 10000,
      behavior: "smooth",
    });
  }

  _moveElementToCursor(eventObj, el) {
    const mouseY = eventObj.clientY;
    const mouseX = eventObj.clientX;

    el.style.position = "absolute";
    el.style.top = `${mouseY}px`;
    el.style.left = `${mouseX}px`;
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

    ui._horizontalScroll();

    this._setLocalStorage();
  }

  newTask(e) {
    let newTaskElement;
    const target = e.target;
    const parentTaskList = target.closest(".task-list");
    const parentTaskListObj = this._getNodeObj(parentTaskList);

    if (target.className !== "new-task-btn") return;

    // Enable Task Editing
    this._toggleTaskEditing();

    // Create & Define New Task Object
    const newTask = new Task();
    newTask.parentTaskList = parentTaskListObj.id;
    this.allTasks.push(newTask);
    this.activeTaskObj = newTask;

    // Create Empty Task in List
    ui._displayEmptyTask(parentTaskList);

    // Define Current Task as Var & Active Task
    const allCurrentTasks = target.previousElementSibling.querySelectorAll(
      ".task-card"
    );
    newTaskElement = allCurrentTasks[allCurrentTasks.length - 1];
    this.activeTaskHTML = newTaskElement;

    // Add ID to New Task
    this._manageTaskId(newTaskElement);

    // Focus New Task for Input
    ui._toggleTaskTextInput(newTaskElement);

    // Add Edited Attribute to New Task
    this._manageTaskEdited(newTaskElement);

    // Update Parent Tasklist Child List
    this._updateChildTaskList(parentTaskListObj);

    // Update localStorage
    this._setLocalStorage();
  }

  _setActiveTask(target) {
    let taskObject;
    let taskHTML;
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
    this._processTaskTextInput(task);

    this._setLocalStorage();
  }

  _updateChildTaskList(taskList) {
    const taskListHTML = taskBoard.querySelector(
      `.task-list[data-id="${taskList.id}"]`
    );
    const allChildTasks = taskListHTML.querySelectorAll(".task-card");
    const allChildTasksIds = [];

    allChildTasks.forEach((task) => allChildTasksIds.push(task.dataset.id));

    taskList.childTasks = allChildTasksIds;
  }

  _attachEventListeners() {
    taskBoard.addEventListener("click", this._clickHandler.bind(this));
    taskBoard.addEventListener("keypress", this._keyPressHandler.bind(this));
    document.addEventListener("click", this._documentClickHandler.bind(this));
  }

  _documentClickHandler(e) {
    console.log(e.target);

    // When Priority Menu Item Clicked
    if (e.target.classList.contains("priority-menu__item")) {
      this._handleTaskPriorityChange(e);
    }

    // When Dark Focus Overlay Clicked
    if (e.target.classList.contains("focus-overlay")) {
      const focusedTask = this.activeTaskHTML;
      ui._removeFocusOverlay(focusedTask);
    }

    // When Task Complete Button Clicked in Priority Menu
    if (e.target.classList.contains("task-menu__container--complete")) {
      console.log("Complete Clicked");
      this.completeTask();
    }

    // When Task Blocked Button Clicked in Priority Menu
    if (e.target.classList.contains("task-menu__container--blocked")) {
      console.log("Blocked Clicked");
      this.setBlockedTask();
    }

    // When Task Delete Button Clicked in Priority Menu
    if (e.target.classList.contains("task-menu__container--delete")) {
      console.log("Delete Clicked");
    }

    // When Task Due Date Button Clicked in Priority Menu
    if (e.target.classList.contains("task-menu__container--date")) {
      console.log("Date Clicked");
    }
  }

  _clickHandler(e) {
    console.log(e.target);

    if (e.target.classList.contains("task-board")) {
      if (this.taskIsBeingEdited) {
        this._handleTaskEdit(e.target);
      }
      if (this.taskListIsBeingEdited) {
        this._handleTaskListEdit(e.target);
      }
    }

    if (e.target.classList.contains("task-card")) {
      this.activeTaskHTML = e.target;
      this.activeTaskObj = this._getNodeObj(this.activeTaskHTML);

      this._handleExistingTaskEdit(e.target);
      ui._displayFocusOverlay(e.target);
    }

    if (e.target.classList.contains("task-card__text-area")) {
      this.activeTaskHTML = e.target.closest(".task-card");
      this.activeTaskObj = this._getNodeObj(this.activeTaskHTML);

      ui._displayFocusOverlay(this.activeTaskHTML);
    }

    if (e.target.classList.contains("task-list__topbar__heading")) {
      if (this.taskListIsBeingEdited) return;

      this._setActiveTaskList(e.target);
      this._handleTaskListEdit(e.target);
    }

    if (e.target.classList.contains("task-card__priority-bar")) {
      ui._displayPriorityMenu(e);

      this.activeTaskHTML = e.target.closest(".task-card");
      this.activeTaskObj = this.allTasks.find(
        (task) => task.id === this.activeTaskHTML.dataset.id
      );
    }

    if (e.target.classList.contains("ellipsis-btn__container")) {
      // Needs Seperated Between Task and Tasklist ellipsis-btn

      if (ui.focusOverlayVisible) return;

      if (e.target.closest(".task-card")) {
        ui._displayTaskMenu(e);

        this.activeTaskHTML = e.target.closest(".task-card");
        this.activeTaskObj = this.allTasks.find(
          (task) => task.id === this.activeTaskHTML.dataset.id
        );
      }

      if (e.target.closest(".task-list")) {
        console.log("Task List Ellipsis Click");
      }
    }

    if (
      !e.target.classList.contains("priority-menu__item") &&
      !e.target.classList.contains("task-card__priority-bar") &&
      ui.priorityMenuOpen
    ) {
      ui._removePriorityMenu();
    }

    if (
      !e.target.classList.contains("task-menu") &&
      !e.target.classList.contains("ellipsis-btn__container") &&
      ui.taskMenuOpen
    ) {
      ui._removeTaskMenu();
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
    const taskText = this.activeTaskHTML.querySelector(".task-card__text-area")
      .textContent;

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
    if (node.classList.contains("task-card")) {
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

  _handleTaskEdit(target) {
    this._toggleTaskEditing();
    this._processTaskTextInput();

    this._setLocalStorage();
  }

  _handleExistingTaskEdit(target) {
    this.activeTaskHTML = target;
    this.activeTaskObj = this._getNodeObj(target);

    this._toggleTaskEditing();
    this._processTaskTextInput();

    this._setLocalStorage();
  }

  _handleTaskListEdit() {
    this._toggleTaskListEditing();
    this._processTaskListTextInput();

    this._setLocalStorage();
  }

  _handleNewTaskCreation(e) {
    if (e.target.classList.contains("new-task-btn")) this.newTask(e);
    if (e.target.classList.contains("new-task-list-btn")) this.newTaskList(e);
  }

  _handleTaskPriorityChange(e) {
    if (e.target.classList.contains("priority-menu__item--high")) {
      ui._changeTaskPriorityStrip("high");
    }

    if (e.target.classList.contains("priority-menu__item--medium")) {
      ui._changeTaskPriorityStrip("medium");
    }

    if (e.target.classList.contains("priority-menu__item--low")) {
      ui._changeTaskPriorityStrip("low");
    }
  }

  completeTask() {
    this.activeTaskObj.status = "completed";
    ui.switchTaskStatus("completed");
    this._setLocalStorage();
  }

  setBlockedTask() {
    this.activeTaskObj.status = "blocked";
    ui.switchTaskStatus("blocked");
    this._setLocalStorage();
  }

  deleteTask() {
    // Some Code
  }

  setDueDateForTask() {
    // Some Code
  }

  _renderAllTaskLists() {
    this.allTaskLists.forEach((taskList) => ui._displayNewTaskList(taskList));
  }

  _renderAllTasks() {
    for (let i = 0; i < this.allTasks.length; i++) {
      const currentTask = this.allTasks[i];
      const parentTasklist = taskBoard.querySelector(
        `.task-list[data-id="${currentTask.parentTaskList}"]`
      );

      ui._displayNewTask(parentTasklist, currentTask);
    }
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
    this._renderAllTasks();
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
