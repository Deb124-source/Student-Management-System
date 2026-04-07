// Student Management System - Frontend JavaScript

// Initialize localStorage data
function initializeLocalStorage() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
    if (!localStorage.getItem('materials')) {
        localStorage.setItem('materials', JSON.stringify([]));
    }
    if (!localStorage.getItem('notices')) {
        localStorage.setItem('notices', JSON.stringify([]));
    }
    if (!localStorage.getItem('currentUser')) {
        localStorage.setItem('currentUser', JSON.stringify(null));
    }
}

// Page Navigation
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function showLanding() {
    showPage('landingPage');
}

function showAuth(role) {
    showPage('authPage');
    document.getElementById('loginRole').value = role;
    document.getElementById('signupRole').value = role;
}

function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => btn.classList.remove('active'));
    
    if (tab === 'login') {
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
        tabBtns[0].classList.add('active');
    } else {
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
        tabBtns[1].classList.add('active');
    }
}

// Authentication Functions
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const role = document.getElementById('loginRole').value;
    
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.email === email && u.password === password && u.role === role);
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        showMessage('Login successful!', 'success');
        
        // Clear form
        event.target.reset();
        
        // Redirect to appropriate dashboard
        setTimeout(() => {
            if (role === 'faculty') {
                showFacultyDashboard();
            } else {
                showStudentDashboard();
            }
        }, 1000);
    } else {
        showMessage('Invalid email, password, or role!', 'error');
    }
}

function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const role = document.getElementById('signupRole').value;
    
    // Validate password length
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters long!', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users'));
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
        showMessage('User with this email already exists!', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        role,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    showMessage('Signup successful! Please login.', 'success');
    
    // Clear form and switch to login tab
    event.target.reset();
    switchTab('login');
}

function logout() {
    localStorage.setItem('currentUser', JSON.stringify(null));
    showMessage('Logged out successfully!', 'info');
    setTimeout(() => {
        showLanding();
    }, 1000);
}

// Dashboard Functions
function showFacultyDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'faculty') {
        showMessage('Access denied!', 'error');
        showLanding();
        return;
    }
    
    document.getElementById('facultyName').textContent = currentUser.name;
    showPage('facultyDashboard');
    loadFacultyMaterials();
    loadNotices('faculty');
}

function showStudentDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'student') {
        showMessage('Access denied!', 'error');
        showLanding();
        return;
    }
    
    document.getElementById('studentName').textContent = currentUser.name;
    showPage('studentDashboard');
    loadStudentMaterials();
    loadNotices('student');
}

// Dashboard Section Navigation
function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    const sidebarBtns = document.querySelectorAll('.sidebar-btn');
    
    sections.forEach(section => section.classList.remove('active'));
    sidebarBtns.forEach(btn => btn.classList.remove('active'));
    
    // Show the selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Highlight the active sidebar button
    const activeBtn = Array.from(sidebarBtns).find(btn => 
        btn.textContent.toLowerCase().includes(sectionId.toLowerCase().replace('student', ''))
    );
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

// Material Management
function handleMaterialUpload(event) {
    event.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'faculty') {
        showMessage('Only faculty can upload materials!', 'error');
        return;
    }
    
    const title = document.getElementById('materialTitle').value;
    const subject = document.getElementById('materialSubject').value;
    const fileInput = document.getElementById('materialFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showMessage('Please select a PDF file!', 'error');
        return;
    }
    
    if (file.type !== 'application/pdf') {
        showMessage('Only PDF files are allowed!', 'error');
        return;
    }
    
    // Create file object for storage (in real app, this would be uploaded to server)
    const reader = new FileReader();
    reader.onload = function(e) {
        const materials = JSON.parse(localStorage.getItem('materials'));
        const newMaterial = {
            id: Date.now().toString(),
            title,
            subject,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            fileData: e.target.result, // Base64 encoded file data
            facultyId: currentUser.id,
            facultyName: currentUser.name,
            uploadedAt: new Date().toISOString()
        };
        
        materials.push(newMaterial);
        localStorage.setItem('materials', JSON.stringify(materials));
        
        showMessage('Material uploaded successfully!', 'success');
        event.target.reset();
        loadFacultyMaterials();
    };
    
    reader.readAsDataURL(file);
}

function loadFacultyMaterials() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const materials = JSON.parse(localStorage.getItem('materials'));
    const facultyMaterials = materials.filter(m => m.facultyId === currentUser.id);
    
    const materialsList = document.getElementById('materialsList');
    materialsList.innerHTML = '';
    
    if (facultyMaterials.length === 0) {
        materialsList.innerHTML = '<p>No materials uploaded yet.</p>';
        return;
    }
    
    facultyMaterials.forEach(material => {
        const materialCard = createMaterialCard(material, true);
        materialsList.appendChild(materialCard);
    });
}

function loadStudentMaterials() {
    const materials = JSON.parse(localStorage.getItem('materials'));
    const materialsList = document.getElementById('studentMaterialsList');
    materialsList.innerHTML = '';
    
    if (materials.length === 0) {
        materialsList.innerHTML = '<p>No study materials available.</p>';
        return;
    }
    
    materials.forEach(material => {
        const materialCard = createMaterialCard(material, false);
        materialsList.appendChild(materialCard);
    });
}

function createMaterialCard(material, isFaculty) {
    const card = document.createElement('div');
    card.className = 'material-card';
    
    const uploadDate = new Date(material.uploadedAt).toLocaleDateString();
    const fileSize = (material.fileSize / 1024 / 1024).toFixed(2) + ' MB';
    
    card.innerHTML = `
        <h3>${material.title}</h3>
        <div class="subject">${material.subject}</div>
        <div class="date">Uploaded: ${uploadDate} | Size: ${fileSize}</div>
        ${isFaculty ? `<div class="date">By: ${material.facultyName}</div>` : ''}
        <button class="btn btn-primary download-btn" onclick="downloadMaterial('${material.id}')">
            Download PDF
        </button>
    `;
    
    return card;
}

function downloadMaterial(materialId) {
    const materials = JSON.parse(localStorage.getItem('materials'));
    const material = materials.find(m => m.id === materialId);
    
    if (!material) {
        showMessage('Material not found!', 'error');
        return;
    }
    
    // Create download link
    const link = document.createElement('a');
    link.href = material.fileData;
    link.download = material.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showMessage(`Downloading ${material.fileName}...`, 'success');
}

// Notice Management
function showNoticeForm() {
    const noticeForm = document.getElementById('noticeForm');
    const studentNoticeForm = document.getElementById('studentNoticeForm');
    
    if (noticeForm) {
        noticeForm.classList.remove('hidden');
    }
    if (studentNoticeForm) {
        studentNoticeForm.classList.remove('hidden');
    }
}

function hideNoticeForm() {
    const noticeForm = document.getElementById('noticeForm');
    const studentNoticeForm = document.getElementById('studentNoticeForm');
    
    if (noticeForm) {
        noticeForm.classList.add('hidden');
        noticeForm.querySelector('form').reset();
    }
    if (studentNoticeForm) {
        studentNoticeForm.classList.add('hidden');
        studentNoticeForm.querySelector('form').reset();
    }
}

function handleNoticeUpload(event) {
    event.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showMessage('Please login to upload notices!', 'error');
        return;
    }
    
    // Determine which form is being submitted
    const isStudentForm = event.target.closest('#studentNoticeForm');
    const titleId = isStudentForm ? 'studentNoticeTitle' : 'noticeTitle';
    const descriptionId = isStudentForm ? 'studentNoticeDescription' : 'noticeDescription';
    const fileId = isStudentForm ? 'studentNoticeFile' : 'noticeFile';
    
    const title = document.getElementById(titleId).value;
    const description = document.getElementById(descriptionId).value;
    const fileInput = document.getElementById(fileId);
    const file = fileInput.files[0];
    
    const notices = JSON.parse(localStorage.getItem('notices'));
    const newNotice = {
        id: Date.now().toString(),
        title,
        description,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorRole: currentUser.role,
        uploadedAt: new Date().toISOString()
    };
    
    // Handle file attachment if present
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            newNotice.fileName = file.name;
            newNotice.fileSize = file.size;
            newNotice.fileType = file.type;
            newNotice.fileData = e.target.result;
            
            saveNotice(newNotice, notices);
        };
        reader.readAsDataURL(file);
    } else {
        saveNotice(newNotice, notices);
    }
}

function saveNotice(newNotice, notices) {
    notices.push(newNotice);
    localStorage.setItem('notices', JSON.stringify(notices));
    
    showMessage('Notice uploaded successfully!', 'success');
    hideNoticeForm();
    
    // Reload notices based on current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser.role === 'faculty') {
        loadNotices('faculty');
    } else {
        loadNotices('student');
    }
}

function loadNotices(userRole) {
    const notices = JSON.parse(localStorage.getItem('notices'));
    const noticesListId = userRole === 'faculty' ? 'noticesList' : 'studentNoticesList';
    const noticesList = document.getElementById(noticesListId);
    
    noticesList.innerHTML = '';
    
    if (notices.length === 0) {
        noticesList.innerHTML = '<p>No notices available.</p>';
        return;
    }
    
    // Sort notices by date (newest first)
    const sortedNotices = notices.sort((a, b) => 
        new Date(b.uploadedAt) - new Date(a.uploadedAt)
    );
    
    sortedNotices.forEach(notice => {
        const noticeCard = createNoticeCard(notice);
        noticesList.appendChild(noticeCard);
    });
}

function createNoticeCard(notice) {
    const card = document.createElement('div');
    card.className = 'notice-card';
    
    const uploadDate = new Date(notice.uploadedAt).toLocaleDateString();
    const roleLabel = notice.authorRole.charAt(0).toUpperCase() + notice.authorRole.slice(1);
    
    card.innerHTML = `
        <h3>${notice.title}</h3>
        <div class="description">${notice.description}</div>
        <div class="meta">
            <div>
                <span class="author">${notice.authorName}</span> (${roleLabel})
                <span class="date">• ${uploadDate}</span>
            </div>
        </div>
        ${notice.fileName ? `
            <button class="btn btn-primary download-btn" onclick="downloadNoticeFile('${notice.id}')">
                Download ${notice.fileName}
            </button>
        ` : ''}
    `;
    
    return card;
}

function downloadNoticeFile(noticeId) {
    const notices = JSON.parse(localStorage.getItem('notices'));
    const notice = notices.find(n => n.id === noticeId);
    
    if (!notice || !notice.fileData) {
        showMessage('File not found!', 'error');
        return;
    }
    
    // Create download link
    const link = document.createElement('a');
    link.href = notice.fileData;
    link.download = notice.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showMessage(`Downloading ${notice.fileName}...`, 'success');
}

// Message System
function showMessage(message, type = 'info') {
    const messageContainer = document.getElementById('messageContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    messageDiv.innerHTML = `
        <div class="message-content">${message}</div>
        <button class="message-close" onclick="closeMessage(this)">×</button>
    `;
    
    messageContainer.appendChild(messageDiv);
    
    // Auto-remove message after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

function closeMessage(button) {
    button.parentElement.remove();
}

// Check authentication on page load
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser) {
        if (currentUser.role === 'faculty') {
            showFacultyDashboard();
        } else if (currentUser.role === 'student') {
            showStudentDashboard();
        }
    } else {
        showLanding();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeLocalStorage();
    checkAuth();
});

// Handle browser back/forward navigation
window.addEventListener('popstate', function() {
    checkAuth();
});
