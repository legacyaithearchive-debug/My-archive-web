console.log("script.js is loaded and running");

// Google Analytics
window.dataLayer = window.dataLayer || [];
function gtag() {
    dataLayer.push(arguments);
}
gtag('js', new Date());
gtag('config', 'G-MS0YD9EVD3');

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyC6kNJOxcKKSSImQrK3Pdvz2MBWyjV6Klw", // Replace with your actual API key
    authDomain: "legacy-ai-e73bf.firebaseapp.com",
    projectId: "legacy-ai-e73bf",
    storageBucket: "legacy-ai-e73bf.firebasestorage.app",
    messagingSenderId: "1061886372313",
    appId: "1:1061886372313:web:5de6dfdfae562f90a451c8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
console.log("Firebase initialized successfully");
const authService = firebase.auth();
const firestore = firebase.firestore();
const storageService = firebase.storage();
let mediaRecorder = null;
let audioChunks = [];
let audioBlob = null;
let recordingTimerInterval = null;
let recordingStartTime = 0;
let currentLang = 'en';

// Toast Notification
function showToast(message, type = 'info') {
    const toastContainer = document.querySelector('.toast-container');
    const toast = document.createElement('div');
    toast.classList.add('toast', 'align-items-center', 'text-white', 'border-0');
    toast.classList.add(type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-info');
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    toastContainer.appendChild(toast);
    const bootstrapToast = new bootstrap.Toast(toast, { delay: 3000 });
    bootstrapToast.show();
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

// Translations
const translations = {
    en: {
        // ... (keep existing translations)
    }
};

function applyTranslations() {
    document.querySelectorAll('[data-key]').forEach(element => {
        const key = element.getAttribute('data-key');
        if (translations[currentLang] && translations[currentLang][key]) {
            element.textContent = translations[currentLang][key];
        }
    });
    document.querySelectorAll('[data-placeholder-key]').forEach(element => {
        const key = element.getAttribute('data-placeholder-key');
        if (translations[currentLang] && translations[currentLang][key]) {
            element.placeholder = translations[currentLang][key];
        }
    });
}

document.querySelectorAll('.dropdown-item[data-lang]').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        currentLang = this.getAttribute('data-lang');
        applyTranslations();
    });
});

applyTranslations();

// Auth State Listener
authService.onAuthStateChanged(user => {
    console.log("Auth state changed:", user ? user.uid : "No user");
    if (user && window.location.hash === '#client-portal') {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('dashboard-content').style.display = 'block';
        document.getElementById('userName').textContent = user.email;
        updatePlanStatus(user.uid);
    } else {
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('dashboard-content').style.display = 'none';
    }
});

// Page Navigation
document.querySelectorAll('a[data-page]').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.remove('active');
        });
        const targetPage = this.getAttribute('data-page');
        document.getElementById(targetPage).classList.add('active');
        window.location.hash = targetPage;
    });
});

// Login
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    console.log("Login form submitted");
    const email = document.getElementById('clientEmail').value;
    const password = document.getElementById('clientPassword').value;
    const loginError = document.getElementById('loginError');
    try {
        await authService.signInWithEmailAndPassword(email, password);
        showToast('Logged in successfully!', 'success');
        loginError.style.display = 'none';
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('dashboard-content').style.display = 'block';
        document.getElementById('userName').textContent = authService.currentUser.email;
        updatePlanStatus(authService.currentUser.uid);
    } catch (error) {
        loginError.textContent = `Login failed: ${error.message}`;
        loginError.style.display = 'block';
        showToast(`Login failed: ${error.message}`, 'error');
        console.error('Login error:', error);
    }
});

// Logout
document.getElementById('logoutButton').addEventListener('click', async function(e) {
    e.preventDefault();
    console.log("Logout button clicked");
    try {
        await authService.signOut();
        showToast('Logged out successfully!', 'info');
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('dashboard-content').style.display = 'none';
    } catch (error) {
        showToast(`Logout failed: ${error.message}`, 'error');
        console.error('Logout error:', error);
    }
});

// Forgot Password
document.querySelector('[data-key="forgot_password"]').addEventListener('click', async function(e) {
    e.preventDefault();
    console.log("Forgot password clicked");
    const email = document.getElementById('clientEmail').value;
    if (email) {
        try {
            await authService.sendPasswordResetEmail(email);
            showToast(translations[currentLang].password_reset_sent, 'info');
        } catch (error) {
            showToast(`Password reset failed: ${error.message}`, 'error');
            console.error('Password reset error:', error);
        }
    } else {
        showToast(translations[currentLang].email_required, 'error');
    }
});

// Signup
document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    console.log("Signup form submitted");
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    try {
        await authService.createUserWithEmailAndPassword(email, password);
        showToast(translations[currentLang].signup_success, 'success');
        const modal = bootstrap.Modal.getInstance(document.getElementById('signupModal'));
        if (modal) modal.hide();
        document.getElementById('signupError').style.display = 'none';
    } catch (error) {
        document.getElementById('signupError').textContent = `${translations[currentLang].signup_failed} ${error.message}`;
        document.getElementById('signupError').style.display = 'block';
        console.error('Signup error:', error);
    }
});

// Update Plan Status
async function updatePlanStatus(userId) {
    console.log("Updating plan status for user:", userId);
    const planStatusElement = document.getElementById('plan-status');
    try {
        const userDoc = await firestore.collection('users').doc(userId).get();
        if (userDoc.exists && userDoc.data().plan) {
            const planName = userDoc.data().plan;
            planStatusElement.textContent = translations[currentLang].current_plan.replace('{{planName}}', planName);
            planStatusElement.style.display = 'block';
        } else {
            planStatusElement.style.display = 'none';
        }
    } catch (error) {
        console.error("Error fetching plan status:", error);
        planStatusElement.style.display = 'none';
    }
}

// File Upload
async function uploadFile(file, type, emotionTagsInputId, progressBarId, progressContainerId) {
    console.log("Uploading file:", file.name);
    if (!authService.currentUser) {
        showToast(translations[currentLang].login_required, 'error');
        return;
    }
    if (file.size > 100 * 1024 * 1024) {
        showToast('File is too large. Maximum size is 100MB.', 'error');
        return;
    }
    const storageRef = storageService.ref();
    const fileRef = storageRef.child(`${type}s/${authService.currentUser.uid}/${file.name}`);
    const uploadTask = fileRef.put(file);
    const progressBar = document.getElementById(progressBarId);
    const progressContainer = document.getElementById(progressContainerId);
    progressContainer.style.display = 'block';
    uploadTask.on('state_changed',
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            progressBar.style.width = progress + '%';
            progressBar.textContent = Math.round(progress) + '%';
        },
        (error) => {
            showToast(`${translations[currentLang].upload_failed} ${error.message}`, 'error');
            console.error("Upload failed:", error);
            progressContainer.style.display = 'none';
        },
        () => {
            uploadTask.snapshot.ref.getDownloadURL().then(async (downloadURL) => {
                showToast(`${type} uploaded successfully!`, 'success');
                progressContainer.style.display = 'none';
                const emotionTags = emotionTagsInputId ? document.getElementById(emotionTagsInputId).value : '';
                await firestore.collection('users').doc(authService.currentUser.uid).collection(type).add({
                    fileName: file.name,
                    fileType: file.type,
                    downloadURL: downloadURL,
                    emotionTags: emotionTags,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                if (emotionTagsInputId) document.getElementById(emotionTagsInputId).value = '';
            });
        }
    );
}

document.getElementById('uploadPhotoButton').addEventListener('click', function() {
    console.log("Upload photo button clicked");
    const fileInput = document.getElementById('uploadPhotoInput');
    if (fileInput.files.length > 0) {
        Array.from(fileInput.files).forEach(file => {
            uploadFile(file, 'photo', 'photoEmotionInput', 'photoProgressBar', 'photoProgressContainer');
        });
        fileInput.value = '';
    } else {
        showToast('Please select a photo to upload.', 'info');
    }
});

document.getElementById('uploadVideoButton').addEventListener('click', function() {
    console.log("Upload video button clicked");
    const fileInput = document.getElementById('uploadVideoInput');
    if (fileInput.files.length > 0) {
        Array.from(fileInput.files).forEach(file => {
            uploadFile(file, 'video', 'videoEmotionInput', 'videoProgressBar', 'videoProgressContainer');
        });
        fileInput.value = '';
    } else {
        showToast('Please select a video to upload.', 'info');
    }
});

// Voice Recording
document.getElementById('recordVoiceButton').addEventListener('click', async function() {
    console.log("Record voice button clicked");
    if (!authService.currentUser) {
        showToast(translations[currentLang].login_required, 'error');
        return;
    }
    if (!window.MediaRecorder) {
        showToast('Your browser does not support voice recording.', 'error');
        return;
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        let timerSeconds = 0;
        const recordingTimer = document.getElementById('recordingTimer');
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        mediaRecorder.onstop = async () => {
            audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audioPreview = document.getElementById('audioPreview');
            audioPreview.src = audioUrl;
            audioPreview.style.display = 'block';
            const fileName = `voice_note_${new Date().getTime()}.webm`;
            await uploadFile(new File([audioBlob], fileName, { type: 'audio/webm' }), 'voice', 'voiceEmotionInput', 'voiceProgressBar', 'voiceProgressContainer');
            clearInterval(recordingTimerInterval);
            recordingTimer.style.display = 'none';
            document.getElementById('recordVoiceButton').style.display = 'block';
            document.getElementById('stopRecordingButton').style.display = 'none';
        };
        mediaRecorder.start();
        recordingStartTime = Date.now();
        recordingTimer.textContent = '00:00';
        recordingTimer.style.display = 'block';
        document.getElementById('recordVoiceButton').style.display = 'none';
        document.getElementById('stopRecordingButton').style.display = 'block';
        recordingTimerInterval = setInterval(() => {
            timerSeconds = Math.floor((Date.now() - recordingStartTime) / 1000);
            const minutes = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
            const seconds = String(timerSeconds % 60).padStart(2, '0');
            recordingTimer.textContent = `${minutes}:${seconds}`;
        }, 1000);
    } catch (error) {
        showToast(`${translations[currentLang].microphone_error} ${error.message}`, 'error');
        console.error("Microphone access error:", error);
    }
});

document.getElementById('stopRecordingButton').addEventListener('click', function() {
    console.log("Stop recording button clicked");
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        mediaRecorder = null;
        audioChunks = [];
    }
});

// Challenge Submissions
document.querySelectorAll('[data-challenge-id]').forEach(button => {
    button.addEventListener('click', async function() {
        console.log("Challenge button clicked:", this.dataset.challengeId);
        if (!authService.currentUser) {
            showToast(translations[currentLang].login_required, 'error');
            return;
        }
        const challengeId = this.dataset.challengeId;
        let responseData = {};
        switch (challengeId) {
            case 'funny-question':
                responseData.answer = document.getElementById('funnyQuestionResponse').value;
                if (!responseData.answer) {
                    showToast('Please enter an answer for the funny question challenge.', 'info');
                    return;
                }
                break;
            case 'dance-off':
                const videoFile = document.getElementById('danceOffVideoInput').files[0];
                if (!videoFile) {
                    showToast('Please upload a video for the dance-off challenge.', 'info');
                    return;
                }
                await uploadFile(videoFile, 'challenge_video', '', 'videoProgressBar', 'videoProgressContainer');
                responseData.videoUploaded = true;
                break;
            case 'childhood-memory':
                responseData.story = document.getElementById('childhoodMemoryResponse').value;
                if (!responseData.story) {
                    showToast('Please enter your story for the childhood memory challenge.', 'info');
                    return;
                }
                break;
        }
        try {
            await firestore.collection('users').doc(authService.currentUser.uid).collection('challenges').add({
                challengeId: challengeId,
                responseData: responseData,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            showToast('Challenge response submitted!', 'success');
            if (challengeId === 'funny-question') document.getElementById('funnyQuestionResponse').value = '';
            if (challengeId === 'dance-off') document.getElementById('danceOffVideoInput').value = '';
            if (challengeId === 'childhood-memory') document.getElementById('childhoodMemoryResponse').value = '';
        } catch (error) {
            showToast(`Challenge submission failed: ${error.message}`, 'error');
            console.error('Challenge submission error:', error);
        }
    });
});
