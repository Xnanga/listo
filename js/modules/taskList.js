"use: strict";

// Imports
import Task from "./task.js";

class TaskList {
  id = (Date.now() + "").slice(-10);
  childTasks = [];

  constructor(textContent) {
    const task = new Task();
    this.textContent = "New Task List";
  }
}

export default TaskList;
