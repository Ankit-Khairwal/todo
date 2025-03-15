class Task {
  constructor(title, description, priority) {
    this.id = Date.now();
    this.title = title;
    this.description = description;
    this.priority = priority;
    this.completed = false;
    this.createdAt = new Date();
  }
}

class TaskManager {
  constructor() {
    this.tasks = [];
    this.loadFromLocalStorage();
    this.setupEventListeners();
    this.startClock();
    this.startExpiryCheck();
  }

  loadFromLocalStorage() {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      this.tasks = JSON.parse(savedTasks).map((task) => {
        task.createdAt = new Date(task.createdAt);
        return task;
      });
      this.renderTasks();
    }
  }

  saveToLocalStorage() {
    localStorage.setItem("tasks", JSON.stringify(this.tasks));
  }

  addTask(title, description, priority) {
    const task = new Task(title, description, priority);
    this.tasks.push(task);
    this.saveToLocalStorage();
    this.renderTasks();
  }

  deleteTask(taskId) {
    this.tasks = this.tasks.filter((task) => task.id !== taskId);
    this.saveToLocalStorage();
    this.renderTasks();
  }

  toggleTaskCompletion(taskId) {
    const task = this.tasks.find((task) => task.id === taskId);
    if (task) {
      task.completed = !task.completed;
      this.saveToLocalStorage();
      this.renderTasks();
    }
  }

  filterTasks(priority = "all") {
    return this.tasks.filter((task) =>
      priority === "all" ? true : task.priority === priority
    );
  }

  sortTasks(tasks, sortBy = "title") {
    return [...tasks].sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "priority") {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return 0;
    });
  }

  checkExpiredTasks() {
    const now = new Date();
    const fiveMinutes = 5 * 60 * 1000;

    this.tasks = this.tasks.filter((task) => {
      const age = now - new Date(task.createdAt);
      return age < fiveMinutes;
    });

    this.saveToLocalStorage();
    this.renderTasks();
  }
  renderTasks() {
    const taskList = document.getElementById("taskList");
    const filterPriority = document.getElementById("filterPriority").value;
    const sortBy = document.getElementById("sortBy").value;

    let filteredTasks = this.filterTasks(filterPriority);
    let sortedTasks = this.sortTasks(filteredTasks, sortBy);

    taskList.innerHTML = "";

    sortedTasks.forEach((task) => {
      const taskElement = document.createElement("div");
      taskElement.className = `task-item ${
        task.completed ? "task-completed" : ""
      }`;

      taskElement.innerHTML = `
                <div class="task-header">
                    <div class="checkbox-wrapper">
                        <input type="checkbox" ${
                          task.completed ? "checked" : ""
                        }>
                        <span class="task-title">${task.title}</span>
                    </div>
                    <span class="task-priority priority-${task.priority}">${
        task.priority
      }</span>
                </div>
                ${
                  task.description
                    ? `<div class="task-description">${task.description}</div>`
                    : ""
                }
                <div class="task-time">Created: ${task.createdAt.toLocaleTimeString()}</div>
            `;

      const checkbox = taskElement.querySelector('input[type="checkbox"]');
      checkbox.addEventListener("change", () =>
        this.toggleTaskCompletion(task.id)
      );

      taskList.appendChild(taskElement);
    });
  }

  startClock() {
    const updateClock = () => {
      const clockElement = document.getElementById("clock");
      clockElement.textContent = new Date().toLocaleTimeString();
    };

    updateClock();
    setInterval(updateClock, 1000);
  }

  startExpiryCheck() {
    setInterval(() => this.checkExpiredTasks(), 30000);
  }

  setupEventListeners() {
    const taskForm = document.getElementById("taskForm");
    const filterPriority = document.getElementById("filterPriority");
    const sortBy = document.getElementById("sortBy");

    taskForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("taskTitle").value;
      const description = document.getElementById("taskDescription").value;
      const priority = document.getElementById("taskPriority").value;

      if (title && priority) {
        this.addTask(title, description, priority);
        taskForm.reset();
      }
    });

    filterPriority.addEventListener("change", () => this.renderTasks());
    sortBy.addEventListener("change", () => this.renderTasks());
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new TaskManager();
});
