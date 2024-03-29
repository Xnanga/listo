"use: strict";

// Imports
import UI from "./userInterface.js";
import Task from "./task.js";
import TaskList from "./taskList.js";

import datepicker from "../vendor-modules/datepicker.js";

// Layout elements
const taskBoard = document.querySelector(".task-board");

// DOM Elements
const infoNavBtn = document.querySelector(".nav-bar__btn--info");
const settingsNavBtn = document.querySelector(".nav-bar__btn--settings");
const clearNavBtn = document.querySelector(".nav-bar__btn--clear");
const infoOverlay = document.querySelector(".info-overlay--info");
const clearOverlay = document.querySelector(".info-overlay--clear");
const yesClearBtn = document.getElementById("yes-clear-btn");
const noClearBtn = document.getElementById("no-clear-btn");

class App {
  currentDate = new Date();

  allTaskLists = [];
  allTasks = [];
  allDueTasks = new Set();

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
    this.ui = new UI(this);
    this.picker = datepicker(".task-menu__container--date", {
      onSelect: (instance, date) => {
        this.setDueDateForTask(instance, date);
      },
    });
    this._attachEventListeners();
  }

  // Creates a new taskList object and handles state
  newTaskList() {
    const newTaskList = new TaskList();
    this.allTaskLists.push(newTaskList);

    this.ui._displayNewTaskList(newTaskList);

    this._setActiveTaskList(newTaskList);

    this.ui._horizontalScroll();

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
    this.ui._displayEmptyTask(parentTaskList);

    // Define Current Task as Var & Active Task
    const allCurrentTasks =
      target.previousElementSibling.querySelectorAll(".task-card");
    newTaskElement = allCurrentTasks[allCurrentTasks.length - 1];
    this.activeTaskHTML = newTaskElement;

    // Add ID to New Task
    this._manageTaskId(newTaskElement);

    // Focus New Task for Input
    this.ui._toggleTaskTextInput(newTaskElement);

    // Add Edited Attribute to New Task
    this._manageTaskEdited(newTaskElement);

    // Update Parent Tasklist Child List
    this._updateChildTaskList(parentTaskListObj);

    // Update localStorage
    this._setLocalStorage();
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
    document.addEventListener("keypress", this._keyPressHandler.bind(this));
    document.addEventListener("click", this._documentClickHandler.bind(this));
  }

  // Handles clicks globally
  _documentClickHandler(e) {
    // Handle Task Edit & Save Once Overlay is Clicked
    if (e.target.classList.contains("focus-overlay")) {
      if (this.taskIsBeingEdited) {
        this._handleTaskEdit(e.target);
        this._manageDueTasks();
      }
      if (this.taskListIsBeingEdited) {
        this._handleTaskListEdit(e.target);
      }
    }

    // When Priority Menu Item Clicked
    if (e.target.classList.contains("priority-menu__item")) {
      this._handleTaskPriorityChange(e);
    }

    // When Dark Focus Overlay Clicked
    if (e.target.classList.contains("focus-overlay")) {
      const focusedTask = this.activeTaskHTML;
      const focusedTaskList =
        this.activeTaskListHTML?.querySelector(".task-list__topbar");

      if (this.taskEditingEnabled) this.ui._removeFocusOverlay(focusedTask);
      if (this.taskListEditingEnabled)
        this.ui._removeFocusOverlay(focusedTaskList);
    }

    // When Task Complete Button Clicked in Priority Menu
    if (e.target.classList.contains("task-menu__container--complete")) {
      this.completeTask();
    }

    // When Task Blocked Button Clicked in Priority Menu
    if (e.target.classList.contains("task-menu__container--blocked")) {
      this.setBlockedTask();
    }

    // When Task Delete Button Clicked in Priority Menu
    if (e.target.classList.contains("task-delete-btn")) {
      this.deleteTask();
    }

    // When Task Due Date Button Clicked in Priority Menu
    if (e.target.classList.contains("task-menu__container--date")) {
      this.setDueDateForTask(this.picker);
    }

    // When Tasklist Delete Button Clicked in Priority Menu
    if (e.target.classList.contains("tasklist-delete-btn")) {
      this.deleteTaskList();
    }

    // When clear navbar button clicked
    if (e.target === clearNavBtn) {
      this.ui.displayInfoOverlay(clearOverlay);
    }

    if (e.target === yesClearBtn) {
      this.clearLocalStorage();
      location.reload();
    }

    if (e.target === noClearBtn) {
      this.ui.removeInfoOverlay();
    }

    // When info navbar button clicked
    if (e.target === infoNavBtn) {
      this.ui.displayInfoOverlay(infoOverlay);
    }

    // When settings navbar button clicked
    if (e.target === settingsNavBtn) {
      this.preFillLocalStorage();
    }
  }

  // Handles clicks inside the taskBoard
  _clickHandler(e) {
    if (e.target.classList.contains("task-card")) {
      this.activeTaskHTML = e.target;
      this.activeTaskObj = this._getNodeObj(this.activeTaskHTML);

      this._handleExistingTaskEdit(e.target);
      this.ui._displayFocusOverlay(e.target);
    }

    if (e.target.classList.contains("task-card__text-area")) {
      this.activeTaskHTML = e.target.closest(".task-card");
      this.activeTaskObj = this._getNodeObj(this.activeTaskHTML);

      this.ui._displayFocusOverlay(this.activeTaskHTML);
    }

    if (e.target.classList.contains("task-list__topbar__heading")) {
      if (this.taskListIsBeingEdited) return;
      this._setActiveTaskList(e.target);
      this._handleTaskListEdit(e.target);

      this.ui._displayFocusOverlay(
        this.activeTaskListHTML.querySelector(".task-list__topbar")
      );
    }

    if (e.target.classList.contains("task-card__priority-bar")) {
      this.ui._displayPriorityMenu(e);

      this.activeTaskHTML = e.target.closest(".task-card");
      this.activeTaskObj = this.allTasks.find(
        (task) => task.id === this.activeTaskHTML.dataset.id
      );
    }

    if (e.target.classList.contains("ellipsis-btn__container")) {
      if (this.ui.focusOverlayVisible) return;

      // Task ellipsis button clicked
      if (e.target.classList.contains("task-ellipsis")) {
        if (e.target.closest(".task-card")) {
          this.ui._displayTaskMenu(e);

          this.activeTaskHTML = e.target.closest(".task-card");
          this.activeTaskObj = this.allTasks.find(
            (task) => task.id === this.activeTaskHTML.dataset.id
          );
        }
      }

      // Tasklist ellipsis button clicked
      if (e.target.classList.contains("tasklist-ellipsis")) {
        if (e.target.closest(".task-list")) {
          this.ui._displayTaskListMenu(e);

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
      this.ui.priorityMenuOpen
    ) {
      this.ui._removePriorityMenu();
    }

    if (
      !e.target.classList.contains("task-menu") &&
      !e.target.classList.contains("task-ellipsis") &&
      this.ui.taskMenuOpen
    ) {
      this.ui._removeTaskMenu();
    }

    if (
      !e.target.classList.contains("tasklist-menu") &&
      !e.target.classList.contains("tasklist-ellipsis") &&
      this.ui.taskListMenuOpen
    ) {
      this.ui._removeTaskListMenu();
    }

    this._handleNewTaskCreation(e);
  }

  _keyPressHandler(e) {
    const focusedTask = this.activeTaskHTML;
    const focusedTaskList =
      this.activeTaskListHTML?.querySelector(".task-list__topbar");

    if (e.key !== "Enter") return;
    if (this.taskIsBeingEdited) {
      this._handleTaskEdit();
    }
    if (this.taskListIsBeingEdited) {
      this._handleTaskListEdit();
    }
    if (!this.taskEditingEnabled) return;
    this._handleNewTaskCreation(e);

    if (this.taskEditingEnabled) this.ui._removeFocusOverlay(focusedTask);
    if (this.taskListEditingEnabled)
      this.ui._removeFocusOverlay(focusedTaskList);
  }

  // Update text content in edited task
  _processTaskTextInput() {
    const taskText = this.activeTaskHTML.querySelector(
      ".task-card__text-area"
    ).textContent;

    this.activeTaskObj.textContent = taskText;

    this.ui._toggleTaskTextInput(this.activeTaskHTML);
    this.ui._populateTextContent(this.activeTaskObj);
  }

  // Update text content in edited taskList
  _processTaskListTextInput() {
    const taskListText = this.activeTaskListHTML.querySelector(
      ".task-list__text-area"
    ).textContent;

    this.activeTaskListObj.textContent = taskListText;

    this.ui._toggleTaskListTextInput(this.activeTaskListHTML);
    this.ui._populateTaskListContent(this.activeTaskListObj);
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
    this.ui._toggleStyleClass(task, "new-task--populated", "add");
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
  _handleTaskEdit() {
    this._toggleTaskEditing();
    this._processTaskTextInput();
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
      this.ui._changeTaskPriorityStrip("high");
    }

    if (e.target.classList.contains("priority-menu__item--medium")) {
      this.ui._changeTaskPriorityStrip("medium");
    }

    if (e.target.classList.contains("priority-menu__item--low")) {
      this.ui._changeTaskPriorityStrip("low");
    }
  }

  _manageDueTasks() {
    // Add all due tasks to set
    this.allTasks.forEach((task) => {
      if (task.dueDate && task.status !== "completed") {
        this.allDueTasks.add(task);
      }
    });

    // Re-order all due tasks by closest date
    if (this.allDueTasks) {
      let arr = [...this.allDueTasks];

      const sortedArr = arr.sort((a, b) =>
        a.dueDateMilliseconds > b.dueDateMilliseconds ? 1 : -1
      );
      this.allDueTasks = new Set(sortedArr);
    }

    // Call UI to update timeline bar
    this.ui._updateTaskTimeline(this.allDueTasks);
  }

  // Set task as complete
  completeTask() {
    if (this.activeTaskObj.status === "completed") {
      this.activeTaskObj.status = "due";
      this.ui.switchTaskStatus("due");
      this._setLocalStorage();
      this.ui._removeTaskMenu();
      this._manageDueTasks();
      return;
    }

    if (this.activeTaskObj.status !== "completed") {
      this.activeTaskObj.status = "completed";
      this.ui.switchTaskStatus("completed");
      this.removeTaskFromDueList(this.activeTaskObj);
      this._setLocalStorage();
      this.ui._removeTaskMenu();
      this._manageDueTasks();
      return;
    }
  }

  // Toggle task blocked
  setBlockedTask() {
    if (this.activeTaskObj.status === "blocked") {
      this.activeTaskObj.status = "due";
      this.ui.switchTaskStatus("due");
      this._setLocalStorage();
      this.ui._removeTaskMenu();
      this._manageDueTasks();
      return;
    }

    if (this.activeTaskObj.status !== "blocked") {
      this.activeTaskObj.status = "blocked";
      this.ui.switchTaskStatus("blocked");
      this._setLocalStorage();
      this.ui._removeTaskMenu();
      this._manageDueTasks();
      return;
    }
  }

  // Delete task
  deleteTask() {
    this.allTasks.splice(this.allTasks.indexOf(this.activeTaskObj), 1);
    this.removeTaskFromDueList(this.activeTaskObj);
    this.ui._removeTask(this.activeTaskHTML);
    this.ui._removeTaskMenu();
    this._setLocalStorage();
  }

  removeTaskFromDueList(task) {
    this.allDueTasks.delete(task);
    this._manageDueTasks();
  }

  // Delete all tasks in list
  deleteAllTasksInList(taskList) {
    const childTaskArr = taskList.childTasks;

    childTaskArr.forEach((taskId) => {
      const taskToDelete = this.allTasks.find((task) => task.id === taskId);
      this.allTasks.splice(this.allTasks.indexOf(taskToDelete), 1);
      this.removeTaskFromDueList(taskToDelete);
    });

    this._setLocalStorage();
  }

  // Set task due date
  setDueDateForTask(instance, date) {
    // Select Active Task
    const activeTask = this.activeTaskObj;
    const activeTaskHTML = this.activeTaskHTML;

    // Create preferred date format
    const unformattedDate = date;
    const formattedDate = this._formatDate(date);

    // Add date to dueDate property of task object
    this.activeTaskObj.dueDate = unformattedDate;

    // Update UI taskcard
    activeTask.statusText = `Due on: ${formattedDate || "TBC"}`;
    const activeTaskDueDateText =
      activeTaskHTML.querySelector(".task-card__status");
    this.ui._updateTaskStatusText(activeTask.statusText, activeTaskDueDateText);

    // Update UI timeline bar
    this.ui._updateTaskTimeline(this.allDueTasks);

    // Tasks to perform only when a date is available
    if (date) {
      this.ui._removeTaskMenu();
      this.activeTaskObj.dueDateMilliseconds = unformattedDate.getTime();
      this._manageDueTasks();
      this.picker.navigate(this.currentDate);
      this._setLocalStorage();
    }
  }

  // Formats date from datepicker
  _formatDate(date) {
    if (!date) return;
    const daysOfWeekList = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    //prettier-ignore
    const monthsOfYearList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const dayOfWeek = daysOfWeekList[date.getDay()];
    const dayOfMonth = date.getDate();
    const month = monthsOfYearList[date.getMonth()];
    const year = date.getFullYear();

    const formattedDate = `${dayOfWeek}, ${dayOfMonth} ${month}, ${year}`;
    return formattedDate;
  }

  // Delete tasklist
  deleteTaskList() {
    this.deleteAllTasksInList(this.activeTaskListObj);
    this.allTaskLists.splice(
      this.allTaskLists.indexOf(this.activeTaskListObj),
      1
    );
    this.ui._removeTaskList(this.activeTaskListHTML);
    this.ui._removeTaskListMenu();
    this._setLocalStorage();
  }

  // Add all taskLists in state to the UI
  _renderAllTaskLists() {
    this.allTaskLists.forEach((taskList) =>
      this.ui._displayNewTaskList(taskList)
    );
  }

  // Add all tasks in state to the UI
  _renderAllTasks() {
    for (let i = 0; i < this.allTasks.length; i++) {
      const currentTask = this.allTasks[i];
      const parentTasklist = taskBoard.querySelector(
        `.task-list[data-id="${currentTask.parentTaskList}"]`
      );
      this.ui._displayNewTask(parentTasklist, currentTask);
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

    // Render all tasks and lists
    this._renderAllTaskLists();
    this._renderAllTasks();

    // Render task timeline
    this._manageDueTasks();
    this.ui._updateTaskTimeline(this.allDueTasks);
  }

  clearLocalStorage() {
    localStorage.clear();
  }

  async preFillLocalStorage() {
    if (this.allTasks.length > 0 || this.allTaskLists.length > 0) return;

    this.clearLocalStorage();

    await fetch("./data/pre-filled-tasks.json")
      .then((res) => res.text())
      .then((data) => {
        const allData = JSON.parse(data);
        const taskListData = allData.taskLists;
        const taskData = allData.tasks;

        const parsedTaskListData = JSON.parse(taskListData);
        const parsedTaskData = JSON.parse(taskData);

        const arr = [parsedTaskListData, parsedTaskData];
        return arr;
      })
      .then((arr) => {
        this.allTaskLists = arr[0];
        this.allTasks = arr[1];

        this._renderAllTaskLists();
        this._renderAllTasks();
        this._manageDueTasks();
        this.ui._updateTaskTimeline(this.allDueTasks);
      });
  }
}

export default App;
