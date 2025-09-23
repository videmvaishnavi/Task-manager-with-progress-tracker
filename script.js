let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let chartInstance;

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addTask() {
  const input = document.getElementById("taskInput");
  const text = input.value.trim();
  if (text) {
    tasks.push({ text, completed: false });
    input.value = "";
    saveTasks();
    renderTasks();
  }
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";
  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = task.completed ? "completed" : "";
    li.innerHTML = `
      <span onclick="toggleTask(${index})">${task.text}</span>
      <button onclick="deleteTask(${index})">Delete</button>
    `;
    list.appendChild(li);
  });
  updateProgress();
  updateChart();
}

function updateProgress() {
  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  document.getElementById("progressFill").style.width = percent + "%";
  document.getElementById("progressText").textContent = `${percent}% Completed`;
}

function updateChart() {
  const completed = tasks.filter(t => t.completed).length;
  const pending = tasks.length - completed;
  const ctx = document.getElementById("taskChart").getContext("2d");

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Completed', 'Pending'],
      datasets: [{
        data: [completed, pending],
        backgroundColor: ['gold', '#fdf6e3'],
        borderColor: ['#000', '#000'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      onClick: () => showChartDetails(completed, pending)
    }
  });
}

function showChartDetails(completed, pending) {
  const total = completed + pending;
  const completedPercent = total ? ((completed / total) * 100).toFixed(1) : 0;
  const pendingPercent = total ? ((pending / total) * 100).toFixed(1) : 0;
  const details = `
    ✅ Completed Tasks: ${completed} (${completedPercent}%)
    ⏳ Pending Tasks: ${pending} (${pendingPercent}%)
  `;
  const chartDetails = document.getElementById("chartDetails");
  chartDetails.innerHTML = details;
  chartDetails.classList.remove("hidden");
}

renderTasks();
