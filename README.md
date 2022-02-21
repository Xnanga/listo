
# Listo

Inspired by the likes of [Trello](https://trello.com/), Listo is **a kan-ban style productivity tab aimed at the solo worker**. Keep track of as many projects as you like, create cards to keep yourself accountable for day-to-day tasks, and set clear and consistent deadlines.

Core features include:

- Create and name tasklists for projects, timelines, and more.
- Create cards for your tasks and add them to your lists.
- Cards allow you to set priority levels, due dates, and statuses (such as Blocked or Completed).
- The taskbar gives you a visual respresentation of your due tasks along with key info.
- Autosave ensures you never lose your work unless you clear your browser's cache.

## Demo

Visit a live version of the Listo Webapp.

![Listo Demo Gif](https://github.com/Xnanga/listo/blob/master/listo-demo.gif)

## Run Locally

Listo has very few dependencies, so you can clone the repository and use:

    npm install

Then use the following command to spin up a local development server:

    npm start

## Code Highlights

Listo was a good opportunity to take an object-oriented approach in JavaScript to solve a real-world problem. ES6 classes were used keep App, User Interface, Tasklist, and Task functionality seperate and organised.

I make heavy use of the _this_ keyword which taught me a lot about its function in an OOP context as well as the pitfalls for code readability in using it.

    class Task {
      id = (Date.now() + "").slice(-10);
      dueDate;
      dueDateMilliseconds;
      parentTaskList;
      priority = "none";
      status = "due";
      statusText;
    
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

## Many Reusable Class Methods

Heavy use of DOM manipulation meant creating pure functions which could perform the same action in multiple places.

A good example below shows two of these functions.

- The **_moveElementToCursor** method was perfect for opening floating menus at different positions on the board.
- The **_toggleStyleClass** method was ideal for switching classes on elements which had to communicate their status change frequently.


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

### Autosave with LocalStorage

Every time a typical CRUD operation is carried out (such as creating or deleting a task), a method on the App object is called to store all tasklists and tasks into LocalStorage.

    _setLocalStorage() { 
    localStorage.setItem("taskLists", 
    JSON.stringify(this.allTaskLists)); 
    localStorage.setItem("tasks", JSON.stringify(this.allTasks)); 
    }

Then, in another session, when Listo is reloaded, the method below reads LocalStorage and populates the board.

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
        ui._updateTaskTimeline(this.allDueTasks);
    }

## Potential Improvements

Listo is far from perfect and could be made much more useful with some additional features. Some of these which were considered are covered below.

**Drag and Drop Tasks**

This was on the list of features to include during the initial planning phase. I had attempted to implement this natively at one point but it turned out to be much more complex than I had anticipated for someone at my skill level at the time.

If I was to create a Listo 2.0, this would be the #1 new feature.

**Save Boards at an Account Level**

Adding some backend code and a database would allow for users to make an account and save their tasklists. While LocalStorage is useful for saving work in the short-term, users will lose their work after they clear their cache.

**Navigational Improvements**

While moving around the board is not fairly straightforward, two additions would make this even better:

1. Fixing the horizontal scrollbar to the bottom of the viewport.
2. Snapping the viewport to one tasklist at a time on mobile.

In V2.0 these minor improvements would certainly be made.

## Feedback

If you have any feedback on Listo, please feel free to get in touch with me at Jpeutherer1@hotmail.co.uk.
