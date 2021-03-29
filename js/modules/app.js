"use: strict";

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

export { App };
