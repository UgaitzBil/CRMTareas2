// ----------------------
// IMPORTAR SUPABASE
// ----------------------
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ----------------------
// IMÁGENES DISPONIBLES
// ----------------------
const availableImages = [
  "/IMG/BBDD.jpg",
  "/IMG/REDES.png",
  "/IMG/WEB.jpg",
  "/IMG/SistemasOperativos.jpg",
  "/IMG/digi.jpg",
  "/IMG/default.png"
];

let projects = [];

// ----------------------
// FUNCIONES API
// ----------------------
async function fetchProjects() {
  const { data, error } = await supabase.from("projects").select("*");
  if (error) return alert("Error al cargar proyectos: " + error.message);
  projects = data;
  renderProjectsList();
}

// ----------------------
// INDEX.HTML FUNCTIONS
// ----------------------
async function addProject() {
  const name = document.getElementById("projectName").value.trim();
  const image = document.getElementById("projectImage").value;

  if (!name) return alert("Ingresa un nombre de proyecto");

  const project = { name, image, tasks: [] };

  const { data, error } = await supabase.from("projects").insert([project]).select();
  if (error) return alert("Error al crear proyecto: " + error.message);

  projects.push(data[0]);
  renderProjectsList();
}

function openEditProjectModal(id) {
  const project = projects.find((p) => p.id === id);
  document.getElementById("editProjectId").value = project.id;
  document.getElementById("editProjectName").value = project.name;

  const select = document.getElementById("editProjectImage");
  loadImageOptions(select, project.image);
  document.getElementById("previewProjectImage").src = project.image;

  select.onchange = (e) => {
    document.getElementById("previewProjectImage").src = e.target.value;
  };

  new bootstrap.Modal(document.getElementById("editProjectModal")).show();
}

async function saveProjectChanges() {
  const id = parseInt(document.getElementById("editProjectId").value);
  const name = document.getElementById("editProjectName").value.trim();
  const image = document.getElementById("editProjectImage").value;

  const { error } = await supabase.from("projects").update({ name, image }).eq("id", id);
  if (error) return alert("Error al actualizar proyecto: " + error.message);

  await fetchProjects();
  bootstrap.Modal.getInstance(document.getElementById("editProjectModal")).hide();
}

async function deleteProject(id) {
  if (!confirm("¿Eliminar este proyecto?")) return;

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return alert("Error al eliminar proyecto: " + error.message);

  await fetchProjects();
}

function renderProjectsList() {
  const list = document.getElementById("projectsList");
  if (!list) return;

  list.innerHTML = "";
  projects.forEach((project) => {
    list.innerHTML += `
      <div class="col-md-4">
          <div class="card p-3 shadow-sm">
              <div style="height:250px; overflow:hidden; border-radius:8px;">
                <img src="${project.image}" class="img-fluid w-100" style="height:100%; object-fit:cover;">
              </div>
              <h4 class="mt-2">${project.name}</h4>
              <div class="d-flex gap-2 mt-2">
                  <button class="btn btn-primary w-100" onclick="openProject(${project.id})">Abrir</button>
                  <button class="btn btn-warning" onclick="openEditProjectModal(${project.id})">Editar</button>
                  <button class="btn btn-danger" onclick="deleteProject(${project.id})">Eliminar</button>
              </div>
          </div>
      </div>
    `;
  });
}

function loadImageOptions(selectElement, currentImage) {
  selectElement.innerHTML = "";
  availableImages.forEach((img) => {
    const option = document.createElement("option");
    option.value = img;
    option.textContent = img.split("/").pop();
    if (img === currentImage) option.selected = true;
    selectElement.appendChild(option);
  });
}

// Abrir proyecto usando query param
function openProject(id) {
  window.location.href = `project.html?projectId=${id}`;
}

// ----------------------
// PROJECT.HTML FUNCTIONS
// ----------------------
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const projectId = parseInt(params.get("projectId"));
  if (projectId) await loadProjectView(projectId);
});

let currentProject = null;

async function loadProjectView(projectId) {
  if (!projects.length) await fetchProjects();

  currentProject = projects.find((p) => p.id === projectId);
  if (!currentProject) {
    alert("Proyecto no encontrado");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("projectTitle").innerText = currentProject.name;
  renderProjectTasks();
}

// ----------------------
// TAREAS
// ----------------------
async function addTaskToProject() {
  const name = document.getElementById("taskName").value.trim();
  const user = document.getElementById("taskUser").value.trim();
  const sprint = document.getElementById("taskSprint").value;
  const startDate = document.getElementById("taskStartDate").value;
  const endDate = document.getElementById("taskEndDate").value;
  const hours = parseFloat(document.getElementById("taskHours").value);

  if (!name || !user || !sprint || !startDate || !endDate || !hours)
    return alert("Completa todos los campos");

  const task = { id: Date.now(), name, user, status: "todo", sprint, startDate, endDate, hours };
  currentProject.tasks.push(task);

  const { error } = await supabase
    .from("projects")
    .update({ tasks: currentProject.tasks })
    .eq("id", currentProject.id);
  if (error) return alert("Error al agregar tarea: " + error.message);

  renderProjectTasks();
}

function openEditTaskModal(taskId) {
  const task = currentProject.tasks.find((t) => t.id === taskId);
  document.getElementById("editTaskId").value = task.id;
  document.getElementById("editTaskName").value = task.name;
  document.getElementById("editTaskUser").value = task.user;
  document.getElementById("editTaskSprint").value = task.sprint;
  document.getElementById("editTaskStartDate").value = task.startDate;
  document.getElementById("editTaskEndDate").value = task.endDate;
  document.getElementById("editTaskHours").value = task.hours;

  new bootstrap.Modal(document.getElementById("editTaskModal")).show();
}

async function saveTaskEdit() {
  const id = parseInt(document.getElementById("editTaskId").value);
  const task = currentProject.tasks.find((t) => t.id === id);

  task.name = document.getElementById("editTaskName").value.trim();
  task.user = document.getElementById("editTaskUser").value.trim();
  task.sprint = document.getElementById("editTaskSprint").value;
  task.startDate = document.getElementById("editTaskStartDate").value;
  task.endDate = document.getElementById("editTaskEndDate").value;
  task.hours = parseFloat(document.getElementById("editTaskHours").value);

  const { error } = await supabase
    .from("projects")
    .update({ tasks: currentProject.tasks })
    .eq("id", currentProject.id);
  if (error) return alert("Error al editar tarea: " + error.message);

  renderProjectTasks();
  bootstrap.Modal.getInstance(document.getElementById("editTaskModal")).hide();
}

async function deleteTask(taskId) {
  if (!confirm("¿Eliminar esta tarea?")) return;

  currentProject.tasks = currentProject.tasks.filter((t) => t.id !== taskId);

  const { error } = await supabase
    .from("projects")
    .update({ tasks: currentProject.tasks })
    .eq("id", currentProject.id);
  if (error) return alert("Error al eliminar tarea: " + error.message);

  renderProjectTasks();
}

function renderProjectTasks() {
  ["todo", "inprogress", "done"].forEach((status) => {
    const column = document.getElementById(status);
    column.innerHTML = "";

    currentProject.tasks
      .filter((t) => t.status === status)
      .forEach((task) => {
        column.innerHTML += `
      <div class="task ${task.status}" draggable="true" id="${task.id}" ondragstart="drag(event)">
        <strong>${task.name}</strong> (${task.user})<br>
        Sprint: ${task.sprint}<br>
        Inicio: ${task.startDate}<br>
        Fin: ${task.endDate}<br>
        Horas: ${task.hours}
        <div class="mt-2 d-flex gap-1">
          <button class="btn btn-sm btn-warning" onclick="openEditTaskModal(${task.id})">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deleteTask(${task.id})">X</button>
        </div>
      </div>
    `;
      });
  });
}

// DRAG & DROP
function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("id", ev.target.id);
}

async function drop(ev, status) {
  ev.preventDefault();
  const id = ev.dataTransfer.getData("id");
  const task = currentProject.tasks.find((t) => t.id == id);
  task.status = status;

  const { error } = await supabase
    .from("projects")
    .update({ tasks: currentProject.tasks })
    .eq("id", currentProject.id);
  if (error) return alert("Error al mover tarea: " + error.message);

  renderProjectTasks();
}
