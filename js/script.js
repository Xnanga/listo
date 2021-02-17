const { strict } = require("assert");

use: strict;

// Layout elements

const navBar = document.querySelector(".nav-bar");
const utilityBar = document.querySelector(".utility-bar");
const taskBoard = document.querySelector(".task-board");

// Classes

class App {
  constructor(placeholder) {
    this.placeholder = placeholder;
  }
}

class TaskList {
  constructor(name, id) {
    this.name = name;
    this.#id = id;
  }
}

class Task extends TaskList {
  constructor(name, id) {
    super(name, id);
  }
}
