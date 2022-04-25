"use: strict";

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

export default Task;
