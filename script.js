class TaskManager {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    this.taskList = document.getElementById("taskList");
    this.progressFill = document.getElementById("progressFill");
    this.progressText = document.getElementById("progressText");
    this.gifContainer = document.getElementById("gifContainer");
    this.input = document.getElementById("taskInput");
    this.addBtn = document.getElementById("addBtn");
    this.init();
  }

  init() {
    this.render();
    this.addBtn.onclick = () => this.addTask();
  }

  save() {
    localStorage.setItem("tasks", JSON.stringify(this.tasks));
  }

  addTask() {
    const text = this.input.value.trim();
    if (text) {
      this.tasks.push({ text, done: false });
      this.input.value = "";
      this.save();
      this.render();
    }
  }

  toggleTask(index) {
    this.tasks[index].done = !this.tasks[index].done;
    this.save();
    this.render();
  }

  deleteTask(index) {
    this.tasks.splice(index, 1);
    this.save();
    this.render();
  }

  getRandomGif() {
    const gifs = [
      "https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif",
      "https://media.giphy.com/media/l0MYKDrKDXz8PdzTW/giphy.gif",
      "https://media.giphy.com/media/26tPoyDhjiJ2g7rEs/giphy.gif"
    ];
    return gifs[Math.floor(Math.random() * gifs.length)];
  }

  render() {
    this.taskList.innerHTML = "";
    this.gifContainer.innerHTML = "";

    this.tasks.forEach((task, i) => {
      const li = document.createElement("li");
      li.className = task.done ? "completed" : "";
      li.innerHTML = `
        <label>
          <input type="checkbox" ${task.done ? "checked" : ""} onclick="app.toggleTask(${i})">
          <span>${task.text}</span>
        </label>
        <button onclick="app.deleteTask(${i})">Delete</button>
      `;
      this.taskList.appendChild(li);
    });

    const completed = this.tasks.filter(t => t.done).length;
    const percent = this.tasks.length ? Math.floor((completed / this.tasks.length) * 100) : 0;

    this.progressFill.style.width = `${percent}%`;
    this.progressText.textContent = `${percent}%`;

    if (percent === 100 && this.tasks.length > 0) {
      this.gifContainer.innerHTML = `
        <h3>🎉 Congrats for doing all your tasks! 🎉</h3>
        <img src="https://media.giphy.com/media/111ebonMs90YLu/giphy.gif" />
      `;
    } else if (completed > 0) {
      this.gifContainer.innerHTML = `<img src="${this.getRandomGif()}" width="200" />`;
    }
  }
}

class ThemeManager {
  constructor(toggleBtn) {
    this.toggleBtn = toggleBtn;
    this.toggleBtn.onclick = () => this.toggleTheme();
    this.load();
  }

  toggleTheme() {
    document.body.classList.toggle("dark");
    const mode = document.body.classList.contains("dark") ? "dark" : "light";
    localStorage.setItem("theme", mode);
    this.toggleBtn.textContent = mode === "dark" ? "LIGHT" : "DARK";
  }

  load() {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      document.body.classList.add("dark");
      this.toggleBtn.textContent = "LIGHT";
    }
  }
}

function showGreeting() {
  const hour = new Date().getHours();
  const greeting = hour < 12
    ? "Good Morning"
    : hour < 18
    ? "Good Afternoon"
    : "Good Evening";
  document.getElementById("greeting").textContent = greeting;
}

const app = new TaskManager();
new ThemeManager(document.getElementById("themeToggle"));
showGreeting();
