let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let chartInstance;

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function suggestDeadline(text) {
  const today = new Date();
  if (text.toLowerCase().includes("report")) {
    today.setDate(today.getDate() + 3);
  } else if (text.toLowerCase().includes("meeting")) {
    today.setDate(today.getDate() + 1);
  } else {
    today.setDate(today.getDate() + 7);
  }
  return today.toISOString().split("T")[0];
}

function addTask() {
  const input = document.getElementById("taskInput");
  const deadlineInput = document.getElementById("deadlineInput");
  const priorityInput = document.getElementById("priorityInput");

  const text = input.value.trim();
  const deadline = deadlineInput.value || suggestDeadline(text);
  const priority = priorityInput.value;

  if (text) {
    tasks.push({ text, completed: false, deadline, priority });
    input.value = "";
    deadlineInput.value = "";
    priorityInput.value = "Medium";
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
  const now = new Date().toISOString().split("T")[0];

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = task.completed ? "completed" : "";

    const isOverdue = task.deadline && task.deadline < now && !task.completed;
    if (isOverdue) {
      li.style.border = "2px solid red";
    }

    li.innerHTML = `
      <div>
        <span onclick="toggleTask(${index})">${task.text}</span>
        <small style="color: black; background-color: white; padding: 2px 6px; border-radius: 6px;">
          Due: ${task.deadline || "No deadline"} | Priority: ${task.priority}
        </small>
      </div>
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

  const forecast = percent >= 75
    ? "🚀 You're on track to finish everything soon!"
    : percent >= 50
    ? "⏳ Keep going, you're halfway there!"
    : "📌 Let's pick up the pace!";
  document.getElementById("forecastText").textContent = forecast;
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
