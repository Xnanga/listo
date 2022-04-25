"use: strict";

// Layout elements
const taskBoard = document.querySelector(".task-board");
const focusOverlay = document.querySelector(".focus-overlay");

// DOM Elements
const newTaskListBtn = document.querySelector(".new-task-list-btn");
const priorityMenu = document.querySelector(".priority-menu");
const taskMenu = document.querySelector(".task-menu--default");
const taskMenuCompletedState = document.querySelector(".task-menu--completed");
const taskMenuBlockedState = document.querySelector(".task-menu--blocked");
const taskListMenu = document.querySelector(".tasklist-menu");
const taskTimelineBar = document.querySelector(".task-timeline__bar");
const allInfoOverlays = [...document.querySelectorAll(".info-overlay")];
const allCloseOverlayBtns = [
  ...document.querySelectorAll(".close-overlay-icon"),
];

class UI {
  priorityMenuOpen = false;
  taskMenuOpen = false;
  taskListMenuOpen = false;
  focusOverlayVisible = false;

  constructor(appObj) {
    this.app = appObj;
    allCloseOverlayBtns.forEach((btn) =>
      btn.addEventListener("click", this.removeInfoOverlay)
    );
  }

  // Switches visibility of task text and input on click
  _toggleTaskTextInput(task) {
    const newTaskText = task.querySelector(".task-card__text");
    const newTaskTextInput = task.querySelector(".task-card__text-area");

    newTaskText.classList.toggle("hidden");
    newTaskTextInput.classList.toggle("hidden");

    if (!newTaskTextInput.classList.contains("hidden")) {
      newTaskTextInput.focus();
      this._displayFocusOverlay(task);
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
      <div class="task-card__status"></div>
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
        <div class="task-card__status task-card__status--bolded">${task.statusText ? task.statusText : ""}</div>
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
        <div class="task-card__status"></div>
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
    const activeTask = this.app.activeTaskHTML;

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

    this.app._manageDueTasks();
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

  // Displays a dark overlay except for focused task or list
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

  displayInfoOverlay(overlay) {
    const overlayToDisplay = allInfoOverlays.find(
      (listedOverlay) => listedOverlay === overlay
    );
    overlayToDisplay.classList.remove("hidden");
    return overlayToDisplay;
  }

  removeInfoOverlay() {
    allInfoOverlays.forEach((overlay) => overlay.classList.add("hidden"));
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
    const priorityStrip = this.app.activeTaskHTML.querySelector(
      ".task-card__priority-bar"
    );

    priorityStrip.className = "";
    this._toggleStyleClass(priorityStrip, "task-card__priority-bar", "add");

    switch (priority) {
      case "high":
        this.app.activeTaskObj.priority = "high";
        //prettier-ignore
        this._toggleStyleClass(priorityStrip, "task-card__priority-bar--high", "add");
        break;
      case "medium":
        this.app.activeTaskObj.priority = "medium";
        //prettier-ignore
        this._toggleStyleClass(priorityStrip, "task-card__priority-bar--medium", "add");
        break;
      case "low":
        this.app.activeTaskObj.priority = "low";
        //prettier-ignore
        this._toggleStyleClass(priorityStrip, "task-card__priority-bar--low", "add");
    }

    this._removePriorityMenu();
    this.app._setLocalStorage();
  }

  _updateTaskStatusText(text, statusLocation) {
    statusLocation.textContent = text;
  }

  _updateTaskTimeline(allDueTasks) {
    taskTimelineBar.innerHTML = "";

    allDueTasks.forEach((dueTask) => {
      const timelineItemHTML = `<div class="task-timeline__item ${
        dueTask.status === "blocked" ? "task-timeline__item--blocked" : ""
      }">
      <span class="task-timeline__item-text">
        ${dueTask.statusText.slice(8)} | ${
        this.app.allTaskLists.find(
          (taskList) => taskList.id === dueTask.parentTaskList
        ).textContent
      }
      </span>
    </div>`;

      taskTimelineBar.insertAdjacentHTML("beforeend", timelineItemHTML);
    });
  }

  // Moves the scrollbar right when new task created
  _horizontalScroll() {
    taskBoard.scroll({
      left: 10000,
      behavior: "smooth",
    });
  }

  _moveElementToCursor(eventObj, el) {
    const mouseY = eventObj.pageY;
    const mouseX = eventObj.pageX;

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

export default UI;
