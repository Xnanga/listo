"use: strict";

// Layout elements
const navBar = document.querySelector(".nav-bar");
const utilityBar = document.querySelector(".utility-bar");
const taskBoard = document.querySelector(".task-board");
const focusOverlay = document.querySelector(".focus-overlay");

// DOM Elements
const newTaskListBtn = document.querySelector(".new-task-list-btn");
const priorityMenu = document.querySelector(".priority-menu");

const taskMenu = document.querySelector(".task-menu--default");
const taskMenuCompletedState = document.querySelector(".task-menu--completed");
const taskMenuBlockedState = document.querySelector(".task-menu--blocked");

const taskListMenu = document.querySelector(".tasklist-menu");

// Classes
class Task {
  id = (Date.now() + "").slice(-10);
  dueDate;
  parentTaskList;
  priority = "none";
  status = "due";
  statusText = "No Due Date Set";

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
  taskListMenuOpen = false;
  focusOverlayVisible = false;

  constructor() {}

  // Switches visibility of task text and input on click
  _toggleTaskTextInput(task) {
    const newTaskText = task.querySelector(".task-card__text");
    const newTaskTextInput = task.querySelector(".task-card__text-area");

    newTaskText.classList.toggle("hidden");
    newTaskTextInput.classList.toggle("hidden");

    if (!newTaskTextInput.classList.contains("hidden")) {
      newTaskTextInput.focus();
    }
  }

  // Switches visibility of taskList text and input on click
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

  // Creates a new taskList element
  _displayNewTaskList(taskList) {
    //prettier-ignore
    const html = `
    <div data-edited="false" data-id="${taskList.id}" class="task-list">
    <div class="task-list__topbar">
      <h2 class="task-list__topbar__heading">${taskList.textContent || "New Task List"}</h2>
      <div class="task-list__text-area hidden" contenteditable="true">${taskList.textContent || "New Task List"}</div>
      <div class="ellipsis-btn__container tasklist-ellipsis">
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

  // Creates a new empty task with no text
  _displayEmptyTask(taskList) {
    const taskListContainer = taskList.querySelector(
      ".task-list__task-container"
    );
    const html = `
    <div data-edited="false" class="task-card">
      <span class="task-card__text"></span>
      <div class="task-card__text-area hidden" contenteditable="true"></div>
      <div class="task-card__priority-bar"></div>
      <div class="ellipsis-btn__container task-ellipsis">
        <div class="ellipsis-btn__dot"></div>
        <div class="ellipsis-btn__dot"></div>
        <div class="ellipsis-btn__dot"></div>
      </div>
      <div class="task-card__status">No Due Date Set</div>
    </div>
    `;

    return taskListContainer.insertAdjacentHTML("beforeend", html);
  }

  // Displays a task which contains text and other values
  _displayNewTask(el, task) {
    let html;

    // Create populated task if localStorage data provided
    if (task) {
      //prettier-ignore
      html = `
      <div data-edited="${task.textContent === "Add New Task" ? "false" : "true"}" data-id="${task.id}" class="task-card task-card--${task.status}">
        <span class="task-card__text">${task.textContent}</span>
        <div class="task-card__text-area hidden" contenteditable="true">${task.textContent}</div>
        <div class="task-card__priority-bar task-card__priority-bar--${task.priority}"></div>
        <div class="ellipsis-btn__container task-ellipsis">
          <div class="ellipsis-btn__dot"></div>
          <div class="ellipsis-btn__dot"></div>
          <div class="ellipsis-btn__dot"></div>
        </div>
        <div class="task-card__status">${task.statusText}</div>
      </div>
      `;

      // Insert the task into the closest taskList
      el.querySelector(".task-list__task-container").insertAdjacentHTML(
        "beforeend",
        html
      );

      // If no localStorage data, create empty task
    } else {
      //prettier-ignore
      html = `
      <div data-edited="false" class="task-card">
        <span class="task-card__text">Add New Task</span>
        <div class="task-card__text-area hidden" contenteditable="true">${task.textContent}</div>
        <div class="task-card__priority-bar task-card__priority-bar--${task.priority}"></div>
        <div class="ellipsis-btn__container task-ellipsis">
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

    // Update allTasks nodelist and return latest task created
    const allTasks = el.querySelectorAll(".task-card");
    return allTasks[allTasks.length - 1];
  }

  // Change task classes based on current status
  switchTaskStatus(newStatus) {
    const activeTask = app.activeTaskHTML;

    activeTask.classList = "";

    if (newStatus === "due") {
      this._toggleStyleClass(activeTask, "task-card", "add");
    }

    if (newStatus === "completed") {
      this._toggleStyleClass(activeTask, "task-card", "add");
      this._toggleStyleClass(activeTask, "task-card--completed", "add");
    }

    if (newStatus === "blocked") {
      this._toggleStyleClass(activeTask, "task-card", "add");
      this._toggleStyleClass(activeTask, "task-card--blocked", "add");
    }

    if (newStatus === "delete") {
      activeTask = "";
    }
  }

  // Add new text into an existing task
  _populateTextContent(task) {
    const taskHTML = taskBoard.querySelector(
      `.task-card[data-id="${task.id}"]`
    );

    taskHTML.querySelector(".task-card__text").textContent = task.textContent;
    taskHTML.querySelector(".task-card__text-area").value = task.textContent;
  }

  // Add new text into an existing taskList
  _populateTaskListContent(taskList) {
    const taskListHTML = taskBoard.querySelector(
      `.task-list[data-id="${taskList.id}"]`
    );

    if (!taskList.textContent) taskList.textContent = "New Task List";

    taskListHTML.querySelector(".task-list__topbar__heading").textContent =
      taskList.textContent;
    taskListHTML.querySelector(".task-list__text-area").value =
      taskList.textContent;
  }

  _displayPriorityMenu(e) {
    this.priorityMenuOpen = true;
    this._moveElementToCursor(e, priorityMenu);
    this._toggleStyleClass(priorityMenu, "hidden", "remove");
  }

  _removePriorityMenu() {
    this.priorityMenuOpen = false;
    this._toggleStyleClass(priorityMenu, "hidden", "add");
  }

  _displayTaskMenu(e) {
    const targetTask = e.target.closest(".task-card");
    this.taskMenuOpen = true;

    if (targetTask.classList.contains("task-card--completed")) {
      this._moveElementToCursor(e, taskMenuCompletedState);
      this._toggleStyleClass(taskMenuCompletedState, "hidden", "remove");
      return;
    }

    if (targetTask.classList.contains("task-card--blocked")) {
      this._moveElementToCursor(e, taskMenuBlockedState);
      this._toggleStyleClass(taskMenuBlockedState, "hidden", "remove");
      return;
    }

    this._moveElementToCursor(e, taskMenu);
    this._toggleStyleClass(taskMenu, "hidden", "remove");
  }

  _removeTaskMenu() {
    this.taskMenuOpen = false;
    this._toggleStyleClass(taskMenu, "hidden", "add");
    this._toggleStyleClass(taskMenuBlockedState, "hidden", "add");
    this._toggleStyleClass(taskMenuCompletedState, "hidden", "add");
  }

  _displayTaskListMenu(e) {
    const targetTaskList = e.target.closest(".task-list");
    this.taskListMenuOpen = true;
    this._moveElementToCursor(e, taskListMenu);
    this._toggleStyleClass(taskListMenu, "hidden", "remove");
  }

  _removeTaskListMenu() {
    this.taskListMenuOpen = false;
    this._toggleStyleClass(taskListMenu, "hidden", "add");
  }

  // Displays a dark overlay except for focused task
  _displayFocusOverlay(el) {
    this.focusOverlayVisible = true;
    this._toggleStyleClass(focusOverlay, "hidden", "remove");
    if (el) el.style.zIndex = "20";
  }

  // Removes the dark overlay
  _removeFocusOverlay(el) {
    this.focusOverlayVisible = false;
    this._toggleStyleClass(focusOverlay, "hidden", "add");
    if (el) {
      el.style.zIndex = "5";
    }
  }

  _toggleStyleClass(el, cssClass, action) {
    if (action === "add") {
      el.classList.add(`${cssClass}`);
      return el;
    } else if (action === "remove") {
      el.classList.remove(`${cssClass}`);
      return el;
    }
  }

  // Switches the colour of a task priority strip
  _changeTaskPriorityStrip(priority) {
    const priorityStrip = app.activeTaskHTML.querySelector(
      ".task-card__priority-bar"
    );

    priorityStrip.className = "";
    // priorityStrip.classList.add("task-card__priority-bar");
    this._toggleStyleClass(priorityStrip, "task-card__priority-bar", "add");

    switch (priority) {
      case "high":
        app.activeTaskObj.priority = "high";
        //prettier-ignore
        this._toggleStyleClass(priorityStrip, "task-card__priority-bar--high", "add");
        break;
      case "medium":
        app.activeTaskObj.priority = "medium";
        //prettier-ignore
        this._toggleStyleClass(priorityStrip, "task-card__priority-bar--medium", "add");
        break;
      case "low":
        app.activeTaskObj.priority = "low";
        //prettier-ignore
        this._toggleStyleClass(priorityStrip, "task-card__priority-bar--low", "add");
    }

    this._removePriorityMenu();
    app._setLocalStorage();
  }

  // Moves the scrollbar right when new task created
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

  _removeTask(task) {
    task.outerHTML = "";
  }

  _removeTaskList(taskList) {
    taskList.outerHTML = "";
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

  // Creates a new taskList object and handles state
  newTaskList() {
    const newTaskList = new TaskList();
    this.allTaskLists.push(newTaskList);
    const newestTaskList = ui._displayNewTaskList(newTaskList);

    this._setActiveTaskList(newTaskList);

    ui._horizontalScroll();

    this._setLocalStorage();
  }

  // Creates a new task object and handles state
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

  // Sets a task as active in state
  _setActiveTask(target) {
    let taskObject;
    let taskHTML;
  }

  // Sets a taskList as active in state
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

  // Gets edited task and sends for text processing
  editTaskTextContent(task) {
    const currentTask = this.allTasks.find(
      (storedTask) => storedTask.id === task.dataset.id
    );
    console.log(task);
    console.log(currentTask);
    this._processTaskTextInput(task);
    this._setLocalStorage();
  }

  // Updates a taskList object's child task array
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

  // Handles clicks globally
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
    if (e.target.classList.contains("task-delete-btn")) {
      this.deleteTask();
    }

    // When Task Due Date Button Clicked in Priority Menu
    if (e.target.classList.contains("task-menu__container--date")) {
      console.log("Date Clicked");
    }

    // When Tasklist Delete Button Clicked in Priority Menu
    if (e.target.classList.contains("tasklist-delete-btn")) {
      this.deleteTaskList();
    }
  }

  // Handles clicks inside the taskBoard
  _clickHandler(e) {
    // Change this later so any click outside the active task is counted
    // Change this later so any click outside the active taskList text area is counted
    if (
      e.target.classList.contains("task-board") ||
      e.target.classList.contains("task-list")
    ) {
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
      if (ui.focusOverlayVisible) return;

      // Task ellipsis button clicked
      if (e.target.classList.contains("task-ellipsis")) {
        if (e.target.closest(".task-card")) {
          ui._displayTaskMenu(e);

          this.activeTaskHTML = e.target.closest(".task-card");
          this.activeTaskObj = this.allTasks.find(
            (task) => task.id === this.activeTaskHTML.dataset.id
          );
        }
      }

      // Tasklist ellipsis button clicked
      if (e.target.classList.contains("tasklist-ellipsis")) {
        if (e.target.closest(".task-list")) {
          ui._displayTaskListMenu(e);

          this.activeTaskListHTML = e.target.closest(".task-list");
          this.activeTaskListObj = this.allTaskLists.find(
            (taskList) => taskList.id === this.activeTaskListHTML.dataset.id
          );
        }
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
      !e.target.classList.contains("task-ellipsis") &&
      ui.taskMenuOpen
    ) {
      ui._removeTaskMenu();
    }

    if (
      !e.target.classList.contains("tasklist-menu") &&
      !e.target.classList.contains("tasklist-ellipsis") &&
      ui.taskListMenuOpen
    ) {
      console.log("Task List Menu Removed");
      ui._removeTaskListMenu();
    }

    // if (!this.taskEditingEnabled) return;
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

  // Update text content in edited task
  _processTaskTextInput(target) {
    const taskText = this.activeTaskHTML.querySelector(".task-card__text-area")
      .textContent;

    this.activeTaskObj.textContent = taskText;
    console.log(this.activeTaskObj);

    ui._toggleTaskTextInput(this.activeTaskHTML);
    ui._populateTextContent(this.activeTaskObj);
  }

  // Update text content in edited taskList
  _processTaskListTextInput(target) {
    const taskListText = this.activeTaskListHTML.querySelector(
      ".task-list__text-area"
    ).textContent;

    this.activeTaskListObj.textContent = taskListText;

    ui._toggleTaskListTextInput(this.activeTaskListHTML);
    ui._populateTaskListContent(this.activeTaskListObj);
  }

  // Toggle state for task editing
  _toggleTaskEditing() {
    this.taskEditingEnabled = !this.taskEditingEnabled;
    this.taskIsBeingEdited = !this.taskIsBeingEdited;
    this.taskIsFinishedEditing = !this.taskIsFinishedEditing;
  }

  // Toggle state for taskList editing
  _toggleTaskListEditing() {
    this.taskListEditingEnabled = !this.taskListEditingEnabled;
    this.taskListIsBeingEdited = !this.taskListIsBeingEdited;
    this.taskListIsFinishedEditing = !this.taskListIsFinishedEditing;
  }

  // Gets the associated object from a task or taskList node
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

  // Adds an id value to the task element from its object
  _manageTaskId(task) {
    task.dataset.id = this.activeTaskObj.id;
  }

  // Set a task element as being edited
  _manageTaskEdited(task) {
    task.dataset.edited = "true";
    // task.classList.add("new-task--populated");
    ui._toggleStyleClass(task, "new-task--populated", "add");
  }

  // Remove task element HTML and state
  _undoTaskCreation(target) {
    const removedTaskId = target.getAttribute("data-id");
    const removedTaskHTML = document.querySelector(
      `[data-id="${removedTaskId}"]`
    );

    removedTaskHTML.outerHTML = "";
    this.allTasks.pop();
  }

  // Higher order function for handling new task text edits
  _handleTaskEdit(target) {
    console.log(target);
    this._toggleTaskEditing();
    this._processTaskTextInput();
    console.log(target);

    this._setLocalStorage();
  }

  // Higher order function for handling existing task text edits
  _handleExistingTaskEdit(target) {
    this.activeTaskHTML = target;
    this.activeTaskObj = this._getNodeObj(target);

    this._toggleTaskEditing();
    this._processTaskTextInput();

    this._setLocalStorage();
  }

  // Higher order function for handling new taskList text edits
  _handleTaskListEdit() {
    this._toggleTaskListEditing();
    this._processTaskListTextInput();

    this._setLocalStorage();
  }

  // Create new task or taskList based on clicked element
  _handleNewTaskCreation(e) {
    if (e.target.classList.contains("new-task-btn")) this.newTask(e);
    if (e.target.classList.contains("new-task-list-btn")) this.newTaskList(e);
  }

  // Call UI object based on priority strip class
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

  // Set task as complete
  completeTask() {
    this._setLocalStorage();
    ui._removeTaskMenu();

    if (this.activeTaskObj.status === "completed") {
      this.activeTaskObj.status = "due";
      ui.switchTaskStatus("due");
      console.log("Task Set to Due");
      return;
    }

    if (this.activeTaskObj.status !== "completed") {
      this.activeTaskObj.status = "completed";
      ui.switchTaskStatus("completed");
      console.log("Task Set to completed");
      return;
    }
  }

  // Toggle task blocked
  setBlockedTask() {
    if (this.activeTaskObj.status === "blocked") {
      this.activeTaskObj.status = "due";
      ui.switchTaskStatus("due");
      console.log("Task Set to Due");

      this._setLocalStorage();
      ui._removeTaskMenu();
      return;
    }

    if (this.activeTaskObj.status !== "blocked") {
      this.activeTaskObj.status = "blocked";
      ui.switchTaskStatus("blocked");
      console.log("Task Set to Blocked");

      this._setLocalStorage();
      ui._removeTaskMenu();
      return;
    }
  }

  // Delete task
  deleteTask() {
    this.allTasks.splice(this.allTasks.indexOf(this.activeTaskObj), 1);
    ui._removeTask(this.activeTaskHTML);
    ui._removeTaskMenu();
    this._setLocalStorage();
  }

  // Delete all tasks in list
  deleteAllTasksInList(taskList) {
    const childTaskArr = taskList.childTasks;

    childTaskArr.forEach((taskId) => {
      const taskToDelete = this.allTasks.find((task) => task.id === taskId);
      this.allTasks.splice(this.allTasks.indexOf(taskToDelete), 1);
    });

    this._setLocalStorage();
  }

  // Set task due date
  setDueDateForTask() {
    // Some Code
    this._setLocalStorage();
    ui._removeTaskMenu();
  }

  // Delete tasklist
  deleteTaskList() {
    this.deleteAllTasksInList(this.activeTaskListObj);
    this.allTaskLists.splice(
      this.allTaskLists.indexOf(this.activeTaskListObj),
      1
    );
    ui._removeTaskList(this.activeTaskListHTML);
    ui._removeTaskListMenu();
    this._setLocalStorage();
  }

  // Add all taskLists in state to the UI
  _renderAllTaskLists() {
    this.allTaskLists.forEach((taskList) => ui._displayNewTaskList(taskList));
  }

  // Add all tasks in state to the UI
  _renderAllTasks() {
    for (let i = 0; i < this.allTasks.length; i++) {
      const currentTask = this.allTasks[i];
      const parentTasklist = taskBoard.querySelector(
        `.task-list[data-id="${currentTask.parentTaskList}"]`
      );
      ui._displayNewTask(parentTasklist, currentTask);
    }
  }

  // Add all taskList and task data to local storage
  _setLocalStorage() {
    localStorage.setItem("taskLists", JSON.stringify(this.allTaskLists));
    localStorage.setItem("tasks", JSON.stringify(this.allTasks));
  }

  // Retrieve all data from local storage
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

// Temporary way to clear local storage
document.addEventListener("keypress", function (e) {
  if (e.code === "KeyL") {
    localStorage.clear();
    console.log("LS Cleared");
  }
});
