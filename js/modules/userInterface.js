"use: strict";

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

export { UI };
