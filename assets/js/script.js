class TaskManager {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem('slate_tasks')) || [];
    this.priority = 'normal';

    // grab all the elements i need
    this.list = document.getElementById('taskList');
    this.input = document.getElementById('taskInput');
    this.emptyBox = document.getElementById('emptyState');
    this.rewardBox = document.getElementById('rewardBox');
    this.fillBar = document.getElementById('progressFill');
    this.pctText = document.getElementById('progressText');
    this.numTotal = document.getElementById('statTotal');
    this.numDone = document.getElementById('statDone');
    this.numLeft = document.getElementById('statLeft');

    this.bindEvents();
    this.render();
  }

  bindEvents() {
    document.getElementById('addBtn').onclick = () => this.add();

    this.input.addEventListener('keydown', e => {
      if (e.key === 'Enter') this.add();
    });

    document.querySelectorAll('.priority-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        this.priority = btn.dataset.priority;
      });
    });

    document.getElementById('clearDoneBtn').onclick = () => {
      if (!this.tasks.some(t => t.done)) return;
      if (!confirm('Remove completed tasks?')) return;
      this.tasks = this.tasks.filter(t => !t.done);
      this.save();
      this.render();
    };

    document.getElementById('clearAllBtn').onclick = () => {
      if (!this.tasks.length) return;
      if (!confirm('Clear everything?')) return;
      this.tasks = [];
      this.save();
      this.render();
    };
  }

  save() {
    localStorage.setItem('slate_tasks', JSON.stringify(this.tasks));
  }

  add() {
    const text = this.input.value.trim();
    if (!text) {
      this.input.focus();
      return;
    }

    this.tasks.unshift({
      id: Date.now(),
      text: text,
      done: false,
      priority: this.priority,
      added: Date.now()
    });

    this.input.value = '';
    this.priority = 'normal';

    // put priority back to normal
    document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('is-active'));
    document.querySelector('[data-priority="normal"]').classList.add('is-active');

    this.save();
    this.render();
    this.input.focus();
  }

  toggle(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) task.done = !task.done;
    this.save();
    this.render();
  }

  remove(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.save();
    this.render();
  }

  render() {
    const doneCount = this.tasks.filter(t => t.done).length;
    const total = this.tasks.length;
    const pct = total > 0 ? Math.floor((doneCount / total) * 100) : 0;

    this.numTotal.textContent = total;
    this.numDone.textContent = doneCount;
    this.numLeft.textContent = total - doneCount;
    this.fillBar.style.width = pct + '%';
    this.pctText.textContent = pct + '%';

    this.list.innerHTML = '';

    this.tasks.forEach(task => {
      const li = document.createElement('li');
      li.className = task.done ? 'task-item is-done' : 'task-item';

      let tag = '';
      if (task.priority === 'urgent') {
        tag = `<span class="priority-tag priority-tag--urgent">urgent</span>`;
      } else if (task.priority === 'chill') {
        tag = `<span class="priority-tag priority-tag--chill">chill</span>`;
      }

      li.innerHTML = `
        <input type="checkbox" class="task-check" ${task.done ? 'checked' : ''}>
        <div class="task-body">
          <span class="task-text">${this.escape(task.text)}</span>
          <div class="task-meta">
            ${tag}
            <span class="task-time">${this.timeAgo(task.added)}</span>
          </div>
        </div>
        <button class="task-delete" title="Delete"></button>
      `;

      li.querySelector('.task-check').onchange = () => this.toggle(task.id);
      li.querySelector('.task-delete').onclick = () => this.remove(task.id);

      this.list.appendChild(li);
    });

    this.emptyBox.classList.toggle('is-visible', this.tasks.length === 0);
    this.showReward(pct, total);
  }

  showReward(pct, total) {
    const box = this.rewardBox;

    if (!total || pct < 1) {
      box.classList.remove('is-visible');
      box.innerHTML = '';
      return;
    }

    let msg = '';
    let sub = '';

    if (pct === 100) {
      const opts = [
        ['All done.', 'Nothing left. Take a break.'],
        ['Clean slate.', 'Every task checked off.'],
        ['GG.', 'Everything completed.'],
      ];
      const pick = opts[Math.floor(Math.random() * opts.length)];
      msg = pick[0];
      sub = pick[1];
    } else if (pct >= 75) {
      msg = 'Almost there.';
      sub = pct + '% done. Keep going.';
    } else if (pct >= 50) {
      msg = 'Halfway.';
      sub = 'Good progress.';
    } else {
      msg = 'Keep going.';
      sub = pct + '% done so far.';
    }

    box.classList.add('is-visible');
    box.innerHTML = `
      <p class="reward__label">${pct === 100 ? 'completed' : 'progress'}</p>
      <p class="reward__msg">${msg}</p>
      <p class="reward__sub">${sub}</p>
    `;
  }

  escape(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  timeAgo(ts) {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    if (days > 0) return days + 'd ago';
    if (hrs > 0) return hrs + 'h ago';
    if (mins > 0) return mins + 'm ago';
    return 'just now';
  }
}


class ThemeManager {
  constructor() {
    this.html = document.documentElement;
    this.label = document.getElementById('themeLabel');

    const saved = localStorage.getItem('slate_theme') || 'light';
    this.apply(saved);

    document.getElementById('themeToggle').onclick = () => {
      const current = this.html.getAttribute('data-theme');
      this.apply(current === 'dark' ? 'light' : 'dark');
    };
  }

  apply(theme) {
    this.html.setAttribute('data-theme', theme);
    this.label.textContent = theme === 'dark' ? 'Light' : 'Dark';
    localStorage.setItem('slate_theme', theme);
  }
}


function initGreeting() {
  const hour = new Date().getHours();
  const el = document.getElementById('greeting');

  if (hour >= 5 && hour < 12) {
    el.textContent = 'Good morning.';
  } else if (hour >= 12 && hour < 17) {
    el.textContent = 'Good afternoon.';
  } else if (hour >= 17 && hour < 21) {
    el.textContent = 'Good evening.';
  } else if (hour >= 21) {
    el.textContent = 'Working late?';
  } else {
    el.textContent = 'Still up?';
  }

  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  document.getElementById('dateLabel').textContent = days[now.getDay()] + ', ' + months[now.getMonth()] + ' ' + now.getDate() + ' ' + now.getFullYear();
}


initGreeting();
new ThemeManager();
new TaskManager();
