class Project{
    constructor(id, name, creted_at){
        this.id = id;
        this.name = name;
        this.creted_at = creted_at;
        this.tasks = [];
    }

    getAllProjects(){
        const projects = localStorage.getItem('projects');
        if(projects){
            return JSON.parse(projects);
        } else {
            return [];
        }
    }
}

class Task{
    constructor(id, title, description, date, creted_at, complated = false){
        this.id = id;
        this.title = title;
        this.description = description;
        this.date = date;
        this.creted_at = creted_at;
        this.complated = complated;
    }
}

const html = document.querySelector('html');
const body = document.body;
const project_item_lists = document.querySelector('[project-item-lists]');
const project_title_wrapper = document.querySelector('[project-title-wrapper]');
const task_item_list = document.querySelector('[task-item-list]');
// All modal declarations
const project_modal = document.querySelector('[project-modal]');
const project_modal_title = document.querySelector('[project-modal-title]');
const task_modal_title = document.querySelector('[task-modal-title]');
const task_modal = document.querySelector('[task-modal]');

const aside = document.querySelector('[aside-active]');
const aside_overlay = document.querySelector('[aside-overlay]');
const allModal = document.querySelectorAll("dialog");
// All form declarations
const form_search_task = document.querySelector('[form-search-task]');
const form_new_project = document.querySelector('[form-new-project]');
const form_new_task = document.querySelector('[form-new-task]');

// All buttons declarations
const new_project_button = document.querySelector('[button-new-prject]');
const button_change_theme = document.querySelector('[button-change-theme]');
const button_new_task = document.querySelector('[button-new-task]');
const button_open_aside = document.querySelector('[button-open-aside]');
const button_edit_project = document.querySelector('[button-edit-project]');
const button_close_modal = document.querySelectorAll('[button-close-modal]');
const button_project_form_submit = document.querySelector('[button-project-form-submit]');
const button_task_form_submit = document.querySelector('[button-task-form-submit]');
// All input declarations
const input_search_task = document.querySelector('[input-search-task]');
const input_new_project = document.querySelector('[input-new-project]');
const input_new_task_title = document.querySelector('[input-new-task-title]');
const input_new_task_description = document.querySelector('[input-new-task-description]');
const input_new_task_date = document.querySelector('[input-new-task-date]');


document.addEventListener('DOMContentLoaded', ()=> {getTheme()})
button_change_theme.addEventListener('click', toggleTheme);
new_project_button.addEventListener('click',()=>{openModal(project_modal)});

input_search_task.addEventListener('input',(e)=>{
    e.preventDefault();
    ManagerService.handleSearchTask(e);
});

form_search_task.addEventListener('submit',(e)=>{
    e.preventDefault();
    ManagerService.handleSearchTask(e);
});

form_new_project.addEventListener('submit',(e)=>{
    e.preventDefault();
    ManagerService.handleProjectFormSubmit(e);
});

form_new_task.addEventListener('submit',(e)=>{
    e.preventDefault();
    ManagerService.handleTaskFormSubmit(e);
});

button_open_aside.addEventListener('click',()=>{
    toggleOpenAside()
});

aside_overlay.addEventListener('click',()=>{
    toggleOpenAside()
});

button_new_task.addEventListener('click',()=>{openModal(task_modal)});

button_close_modal.forEach(button=>{
    button.addEventListener('click',()=>{
        closeAllModal();
    });
});

class ProjectManager{
    constructor(){
        this.projects = projrctService.getAllProjects();
        this.currentProjectId = '';
        this.editMode = false;
        this.editTaskId = '';
        this.editProjectId = '';
        this.loadProjects();
    }

    handleProjectFormSubmit(e){
        if(input_new_project.value.trim() != ''){
            const name = input_new_project.value;
            if(!this.editMode){
                this.addProject(name);
                closeAllModal();
            }else{
                this.editProject(name);
                closeAllModal();
            }
        }
    }

    handleTaskFormSubmit(e){
        const title = input_new_task_title.value;
        const description = input_new_task_description.value;
        const date = input_new_task_date.value;

        if(this.currentProjectId !== ''){
            if(title.trim() !== ''){
                if(!this.editMode){
                    this.addTaskToProject(`${this.currentProjectId}`, title, description, date);
                }else{
                    this.editTask(this.currentProjectId, this.editTaskId, title, description, date);
                }
                closeAllModal();
            }
        }
    }

    handleSearchTask(e){
        let value = input_search_task.value.toLowerCase().trim();
        let project = this.getProjectById(this.currentProjectId);
        if(value != ''){
            if(project){
                let tasks = project.tasks.filter(task => task.title.toLowerCase().trim().includes(value) || task.description.toLowerCase().trim().includes(value));
                if(tasks.length > 0){
                    this.renderTasks(this.currentProjectId, tasks);
                }else{
                    this.handleRenderTasks(project, []);
                }
            }
        }else{
            this.renderTasks(this.currentProjectId, project.tasks);
        }
    }
    
    addProject(name){
        const date = new Date().toLocaleString(); 
        const project = new Project(`${Date.now()}`, name, date);
        this.projects.unshift(project);
        this.renderProjects();
        this.selectProject(project.id);
        this.saveProjects();
    }

    addTaskToProject(projectId, title, description, date){
        const project = this.getProjectById(projectId);
        if(project){
            const task = new Task(`${Date.now()}`, title, description, date, new Date().toLocaleString());
            project.tasks.unshift(task);
            this.saveProjects();
            this.loadProjects();
            this.renderTasks(projectId, []);
        }
    }

    getProjectById(projectId){
        return this.projects.find(project=> project.id == projectId);
    }

    loadProjects(){
        if(this.projects.length > 0){
            let tempProj = this.currentProjectId;
            if(tempProj == ''){
                this.currentProjectId = this.projects[0].id;
                this.renderProjects();
                this.selectProject(this.currentProjectId);
                this.renderTasks(this.currentProjectId, []);
            }else{
                this.currentProjectId = tempProj;
                this.renderProjects();
                this.selectProject(tempProj);
                this.renderTasks(tempProj, []);
            }
        }else{
            project_item_lists.innerHTML =  `
                <div class="empty-item">
                    <p>Project not found!</p>
                </div>
            `;
            button_new_task.style.display = 'none';
            project_title_wrapper.innerHTML = '';
            task_item_list.innerHTML = `
                <div class="empty-item">
                    <p>Before you creating a task, you need to create a new project, and then you can create a task.</p>
                </div>
            `;
        }
    }

    renderProjects(){
        project_item_lists.innerHTML = '';
        this.projects.forEach((project, index)=> {
            let project_nav_item = createDynamicElement('li', 'project-nav-item', '[project-item-lists]', true);
            project_nav_item.innerHTML = `
                <h4 class="project-title">${project.name}</h4>
                <span class="task-count">${project.tasks.length == 0 ? `Created: ${project.creted_at}` : `${project.tasks.length} tasks`}</span>
            `;
            if(index == 0){
                project_nav_item.setAttribute('active', 'true');
            }
            project_nav_item.addEventListener('click', ()=>{
                this.selectProject(project.id);
                this.selectProjectItem(project_nav_item)
            });
        });
        button_new_task.style.display = 'flex';
    }

    selectProjectItem(currentItem){
        document.querySelectorAll('.project-nav-item').forEach(item=>{
            item.setAttribute('active', 'false');
        });
        currentItem.setAttribute('active', 'true');
    }

    selectProject(id){
        this.currentProjectId = id;
        this.renderTasks(id, []);
    }

    renderTasks(projectId, tasks){
        const project = this.getProjectById(projectId);
        task_item_list.innerHTML = '';
        if(project){
            project_title_wrapper.innerHTML = `
                <div class="left-side">
                    <h3 class="project-title">${project.name} <span>${project.tasks.length == 0 ? '' : `${project.tasks.length} Tasks`}</span></h3>
                    <p class="task-count">Created: ${project.creted_at}</p>
                </div>
                <div class="right-side">
                    <button onClick="editProject(${project.id})">Edit</button>
                    <button onClick="ManagerService.deleteProject(${project.id})">Delete</button>
                </div>
            `;
            if(tasks.length > 0){
                this.handleRenderTasks(project, tasks);
            }else{
                this.handleRenderTasks(project, project.tasks);
            }
        }
    }

    handleRenderTasks(project, tasks) {
        tasks.forEach(task=>{
        let task_item = createDynamicElement('article', 'task-item', '[task-item-list]', true);
        task_item.setAttribute('task-complated', `${task.complated}`);
        task_item.setAttribute('task-item', `${task.id}`);
        task_item.innerHTML = `
                <label for="expend-item-${task.id}" class="task-body">
                    <input type="checkbox" class="expend-checkbox" id="expend-item-${task.id}">
                    <h3 class="task-title">${task.title}</h3>
                    <p class="task-description">${task.description}</p>
                </label>
                <div class="task-footer">
                    <div class="task-info">
                        <i class="far fa-dot-circle"></i>
                        <p class="task-meta-description">Status: <span>${task.complated ? "complated" : "pendding"}</span></p>
                    </div>
                    <div class="task-info">
                        <i class="far fa-calendar-alt"></i>
                        <p class="task-meta-description">Created: ${task.creted_at}</p>
                    </div>
                    <div class="task-info">
                        <i class="far fa-clock"></i>
                        <p class="task-meta-description">Due: ${task.date}</p>
                    </div>
                    <div class="buttons-wrapper">
                        <button class="button-toggle-complate" onClick="ManagerService.toggleComplateTask(${project.id}, ${task.id})">
                            <i class="fa fa-${task.complated ? "hourglass-start" : "check"}"></i>
                            <span>${task.complated ? "Mark as pendding" : "Mark as complated"}</span>
                        </button>
                        <button class="button-edit-task" onClick="editTask(${project.id}, ${task.id})">
                            <i class="fa fa-edit"></i>
                            <span>Edit</span>
                        </button>
                        <button class="button-delete-task" onClick="ManagerService.deleteTask(${project.id}, ${task.id})">
                            <i class="fa fa-trash"></i>
                            <span>Delete</span>
                        </button>
                    </div>
                </div>

            `;
        })
        if(tasks.length == 0){
            task_item_list.innerHTML = `
            <div class="empty-item">
                <p>Tasks not found!</p>
            </div>
            `;
        }
    }

    deleteProject(projectId){
        this.projects = this.projects.filter(project => project.id != projectId);
        this.saveProjects();
        this.loadProjects();
        this.renderProjects();
        this.renderTasks(this.currentProjectId, []);
    }

    editTask(projectId, taskId, title, description, date){
        let project = this.getProjectById(projectId);
        if(project){
        let task = project.tasks.find(task => task.id == taskId);
            if(task){
                task.title = title;
                task.description = description;
                task.date = date;
                this.currentProjectId = projectId;
                this.saveProjects();
                this.renderTasks(this.currentProjectId, []);
            }
        }
    }

    toggleComplateTask(projectId, taskId){
        let project = this.getProjectById(projectId);
        if(project){
        let task = project.tasks.find(task => task.id == taskId);
            if(task){
                task.complated = !task.complated;
                this.currentProjectId = projectId;
                this.saveProjects();
                this.renderTasks(projectId, []);
            }
        }
    }

    deleteTask(projectId, taskId){
        let project = this.getProjectById(projectId);
        if(project){
            let index = project.tasks.findIndex(task => task.id == taskId);
            project.tasks.splice(index, 1);
            this.saveProjects();
            this.loadProjects();
            this.renderTasks(this.currentProjectId, []);
        }
    }

    editProject(name){
        let project = this.projects.find(proj => proj.id == this.editProjectId);
        this.projects = this.projects.filter(project => project.id != this.editProjectId);
        if(project){
            project.name = name;
            this.projects.unshift(project);
            this.saveProjects();
            this.currentProjectId = this.editProjectId;
            this.loadProjects();
            this.renderProjects();
            this.renderTasks(this.currentProjectId, []);
        }
    }

    saveProjects(){
        localStorage.setItem('projects', JSON.stringify(this.projects));
    }
}

function editProject(projectId){
    let project = ManagerService.getProjectById(projectId)
    ManagerService.editMode = true;
    ManagerService.editProjectId = projectId;
    input_new_project.value = project.name;
    project_modal_title.innerHTML = `Edit project name`;
    button_project_form_submit.innerHTML = `Confirm`;
    openModal(project_modal);
}

function editTask(projectId, taskId){
    let project = ManagerService.getProjectById(projectId);
    let task = project.tasks.find(task=> task.id == taskId);
    ManagerService.editMode = true;
    ManagerService.editTaskId = taskId;
    input_new_task_title.value = task.title;
    input_new_task_description.value = task.description;
    input_new_task_date.value = task.date;
    task_modal_title.innerHTML = `Edit Task`;
    button_task_form_submit.innerHTML = `Confirm`;
    openModal(task_modal);
}

function toggleTheme() {
    let darkTheme = getLocalStorage('dark-theme') || 'false';
    if(darkTheme == "false"){
        setTheme("false")
    }else{
        setTheme("true")
    }
}

function setTheme(status) {
    if(status == "false"){
        html.setAttribute('dark-theme', 'true');
        button_change_theme.innerHTML = `<i class="fa fa-sun"></i>`;
        setLocalStorage('dark-theme', "true");
    }else{
        html.setAttribute('dark-theme', 'false');
        button_change_theme.innerHTML = `<i class="fa fa-moon"></i>`;
        setLocalStorage('dark-theme', "false");
    }
}

function getTheme() {
    let darkTheme = getLocalStorage('dark-theme') || 'false';
    if(darkTheme != "false"){
        setTheme("false")
    }else{
        setTheme("true")
    }
}

function setLocalStorage(key, value) {
    localStorage.setItem(`${key}`, `${value}`);
}

function getLocalStorage(key) {
    return localStorage.getItem(`${key}`);
}

function toggleOpenAside(){
    let status = aside.getAttribute('aside-active');
    if(status == "true"){
        aside.setAttribute('aside-active', "false");
        button_open_aside.innerHTML = `<i class="fa fa-bars"></i>`;
    }else{
        aside.setAttribute('aside-active', "true");
        button_open_aside.innerHTML = `<i class="fa fa-times"></i>`;
    }
}

function openModal(modal){
    modal.showModal();
    allModal.forEach(modal=>{
        modal.addEventListener('click', (e)=>{
            let modalDimantions = modal.getBoundingClientRect();
            if(
                e.clientX < modalDimantions.left ||
                e.clientX > modalDimantions.right ||
                e.clientY < modalDimantions.top ||
                e.clientY > modalDimantions.bottom
            ){
                cleseModal(modal);
                closeAllModal();
            }
        })
    });
}

function cleseModal(modal){
    modal.close();
}

function closeAllModal(){
    cleseModal(project_modal);
    cleseModal(task_modal);
    form_new_project.reset()
    form_new_task.reset();
    task_modal_title.innerHTML = `Create new task`;
    project_modal_title.innerHTML = `Create new project`;
    button_project_form_submit.innerHTML = `Create now`;
    button_task_form_submit.innerHTML = `Create now`;
    ManagerService.editMode = false;
}

function createDynamicElement(elem, name, parent, append){
    if(elem != "" && parent != ""){
        const createElem = document.createElement(`${elem}`);
        createElem.setAttribute(`${name}`, ``);
        createElem.classList.add(`${name}`);
        if(append){
            document.querySelector(`${parent}`).appendChild(createElem);
        }
        return createElem;
    }
}

let projrctService = new Project();
let taskService = new Task();
let ManagerService = new ProjectManager();