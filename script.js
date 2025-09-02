nano index.html﻿// Google Analytics
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-MS0YD9EVD3');
https://legacy-ai-e73bf.firebasestorage.app
// Firebase Configuration
const firebaseConfig = {
    apiKey: "AlzaSyC6kNJOxcKKSSImQrK3Pdvz2MBWyjV6Klw"
    authDomain: "legacy-ai-e73bf.firebaseapp.com"
    projectId: "legacy-ai-e73bf"
    storageBucket: "legacy-ai-e73bf.firebasestorage.app",
    messagingSenderId: "1061886372313",
    appId: "1:1061886372313:web:5de6dfdfae562f90a451c8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const authService = firebase.auth();
const firestore = firebase.firestore();
const storageService = firebase.storage();
let mediaRecorder = null;
let audioChunks = [];
let audioBlob = null;
let recordingTimerInterval = null;
let recordingStartTime = 0;
let currentLang = 'en'; // Default language

// Function to display toast notifications
function showToast(message, type = 'info') {
    const toastContainer = document.querySelector('.toast-container');
    const toast = document.createElement('div');
    toast.classList.add('toast', 'align-items-center', 'text-white', 'border-0');
    if (type === 'success') {
        toast.classList.add('bg-success');
    } else if (type === 'error') {
        toast.classList.add('bg-danger');
    } else {
        toast.classList.add('bg-info');
    }
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
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

const translations = {
    en: {
        home_title: "Capture Life’s Joyful Moments with Legacy AI",
        home_lead: "Relive the past, celebrate the present, and shape the future with AI-curated happiness. Create Together, Reminisce Forever: Build vibrant digital scrapbooks and happy timelines for generations.",
        get_started_free: "Get Started Free",
        download_joyful_guide: "Download Joyful Memory Guide",
        how_it_works_title: "How Legacy AI Spreads Joy",
        capture_moments_step: "1. Capture Happy Moments",
        capture_moments_desc: "Upload photos, videos, and voice notes of birthdays, trips, and everyday joys.",
        create_adventures_step: "2. Create Family Adventures",
        create_adventures_desc: "AI crafts interactive stories and games starring your loved ones.",
        build_timeline_step: "3. Build a Happy Timeline",
        build_timeline_desc: "Organize milestones into a vibrant digital scrapbook for all to cherish.",
        moments_title: "Moments That Matter",
        moments_intro: "Relive the joy of birthdays, family trips, inside jokes, and everyday moments. Upload your happiest memories to create a digital scrapbook that sparks smiles.",
        upload_photos_title: "Photos of Joy",
        upload_photos_desc: "Share snapshots of laughter and love.",
        record_voice_title: "Voice Notes",
        record_voice_desc: "Capture jokes, songs, or heartfelt messages.",
        share_videos_title: "Happy Videos",
        share_videos_desc: "Upload clips of celebrations and adventures.",
        emotion_tag_placeholder: "Tag emotions or themes (e.g., #joyful, #adventure)",
        upload_now: "Upload Now",
        record_now: "Record Now",
        stop_recording: "Stop Recording",
        upload_failed: "Upload failed:",
        upload_success: "Voice note uploaded successfully! MP3 conversion in progress.",
        mp3_conversion_failed: "Voice note uploaded, but MP3 conversion failed. Playing WebM.",
        microphone_error: "Microphone access denied or unavailable: ",
        challenges_title: "Interactive Family Challenges",
        challenges_intro: "Bring your family closer with fun prompts that create joyful memories. Complete challenges and build a positive archive together!",
        funny_question_title: "Funny Question Challenge",
        funny_question_desc: "Ask your grandparents one hilarious question today and record their answer!",
        dance_off_title: "Family Dance-Off",
        dance_off_desc: "Record a 60-second family dance-off and share the fun!",
        childhood_memory_title: "Childhood Memory Story",
        childhood_memory_desc: "Share a 60-second story of your happiest childhood moment.",
        start_challenge: "Submit Response",
        pricing_title: "Choose Your Joyful Plan",
        pricing_intro: "Start free or unlock premium features to create unforgettable family memories.",
        free_tier_title: "Basic Legacy",
        free_tier_desc: "Limited text & photo archive, AI memory highlights, 5 AI interactions/month.",
        essential_tier_title: "Essential Legacy",
        essential_tier_desc: "Expanded storage, custom AI persona, multi-language support, mood-based search.",
        family_tier_title: "Family Legacy Plus",
        family_tier_desc: "Shared archives, collaborative scrapbooks, unlimited AI interactions, family games.",
        lifetime_tier_title: "Lifetime Legacy Vault",
        lifetime_tier_desc: "Unlimited storage, AI legacy book, priority support, scheduled messages, and **exclusive VIP family support with personalized AI memory curations.**",
        buy_now: "Buy Now",
        one_time_title: "Premium Enhancements",
        one_time_desc: "Add unique features to your joyful legacy.",
        storybook_purchase: "AI Storybook ($99)",
        time_capsule_purchase: "Time Capsule ($49)",
        video_message_purchase: "Legacy Video ($79)",
        business_creator_title: "For Businesses & Creators",
        business_creator_desc: "Preserve brand stories or create unique AI personas.",
        business_plan: "Business Plan: $499/year",
        creator_plan: "Creator Plan: $99 setup + $25/mo",
        community_plan: "Community Vault: $149/year",
        contact_sales: "Contact Sales",
        login_title: "Joyful Portal Login",
        email_label: "Email",
        email_input_placeholder: "Email",
        password_label: "Password",
        password_input_placeholder: "Password",
        login_button: "Login",
        forgot_password: "Forgot Password?",
        email_required: "Please enter your email address.",
        password_reset_sent: "Password reset email sent! Check your inbox.",
        login_required: "Please log in to record a...",
        current_plan: "You're on {{planName}} 💛"
    },
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

document.querySelectorAll('a[data-page]').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.remove('active');
        });
        const targetPage = this.getAttribute('data-page');
        document.getElementById(targetPage).classList.add('active');

        if (targetPage === 'client-portal') {
            authService.onAuthStateChanged(user => {
                if (user) {
                    document.getElementById('login-form').style.display = 'none';
                    document.getElementById('dashboard-content').style.display = 'block';
                    document.getElementById('userName').textContent = user.email;
                    updatePlanStatus(user.uid);
                } else {
                    document.getElementById('login-form').style.display = 'block';
                    document.getElementById('dashboard-content').style.display = 'none';
                }
            });
        }
    });
});

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('clientEmail').value;
    const password = document.getElementById('clientPassword').value;
    try {
        await authService.signInWithEmailAndPassword(email, password);
        showToast('Logged in successfully!', 'success');
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('dashboard-content').style.display = 'block';
        document.getElementById('userName').textContent = authService.currentUser.email;
        updatePlanStatus(authService.currentUser.uid);
    } catch (error) {
        showToast(`Login failed: ${error.message}`, 'error');
        console.error('Login error:', error);
    }
});

document.getElementById('logoutButton').addEventListener('click', async function(e) {
    e.preventDefault();
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

document.querySelector('[data-key="forgot_password"]').addEventListener('click', async function(e) {
    e.preventDefault();
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

async function updatePlanStatus(userId) {
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

async function uploadFile(file, type, emotionTagsInputId, progressBarId, progressContainerId) {
    if (!authService.currentUser) {
        showToast(translations[currentLang].login_required, 'error');
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
                const emotionTags = document.getElementById(emotionTagsInputId).value;
                await firestore.collection('users').doc(authService.currentUser.uid).collection(type).add({
                    fileName: file.name,
                    fileType: file.type,
                    downloadURL: downloadURL,
                    emotionTags: emotionTags,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                document.getElementById(emotionTagsInputId).value = '';
            });
        }
    );
}

document.getElementById('uploadPhotoButton').addEventListener('click', function() {
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

document.getElementById('recordVoiceButton').addEventListener('click', async function() {
    if (!authService.currentUser) {
        showToast(translations[currentLang].login_required, 'error');
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
            await uploadFile(audioBlob, 'voice', 'voiceEmotionInput', 'voiceProgressBar', 'voiceProgressContainer');

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
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
});

document.querySelectorAll('[data-challenge-id]').forEach(button => {
    button.addEventListener('click', async function() {
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

document.getElementById('generateStoryButton').addEventListener('click', async function() {
    if (!authService.currentUser) {
        showToast(translations[currentLang].login_required, 'error');
        return;
    }
    const characters = document.getElementById('storyCharacters').value;
    const theme = document.getElementById('storyTheme').value;
    if (!characters || !theme) {
        showToast('Please enter characters and select a theme.', 'info');
        return;
    }

    showToast('Generating your story...', 'info');
    const storyOutput = document.getElementById('storyOutput');
    storyOutput.textContent = `Once upon a time, in a land far away, ${characters} embarked on a grand ${theme} adventure... (This is a placeholder story generated by AI.)`;
    storyOutput.style.display = 'block';
    document.getElementById('storyActions').style.display = 'flex';
    showToast('Story generated!', 'success');
});

document.getElementById('saveStoryButton').addEventListener('click', async function() {
    if (!authService.currentUser) return;
    const storyContent = document.getElementById('storyOutput').textContent;
    try {
        await firestore.collection('users').doc(authService.currentUser.uid).collection('stories').add({
            content: storyContent,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        showToast('Story saved!', 'success');
    } catch (error) {
        showToast(`Failed to save story: ${error.message}`, 'error');
        console.error('Error saving story:', error);
    }
});

document.getElementById('shareStoryButton').addEventListener('click', function() {
    if (!authService.currentUser) return;
    const storyContent = document.getElementById('storyOutput').textContent;
    navigator.clipboard.writeText(storyContent).then(() => {
        showToast('Story copied to clipboard!', 'info');
    }).catch(err => {
        showToast('Failed to copy story.', 'error');
        console.error('Could not copy text: ', err);
    });
});

document.getElementById('regenerateStoryButton').addEventListener('click', function() {
    document.getElementById('generateStoryButton').click();
});

function createPayPalOrder(amount, planName, actions) {
    return actions.order.create({
        purchase_units: [{
            amount: {
                currency_code: 'USD',
                value: amount
            },
            description: `${planName} Legacy AI Plan`
        }]
    });
}

function onPayPalApprove(data, actions) {
    return actions.order.capture().then(function(details) {
        showToast(`Transaction completed by ${details.payer.name.given_name}!`, 'success');
        console.log('PayPal transaction details:', details);
    });
}

function onPayPalError(err) {
    showToast(`Payment failed: ${err.message || err}`, 'error');
    console.error('PayPal error:', err);
}

function initPayPalButtons(containerId, amount, planName) {
    paypal.Buttons({
        style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'paypal'
        },
        createOrder: (data, actions) => createPayPalOrder(amount, planName, actions),
        onApprove: (data, actions) => onPayPalApprove(data, actions),
        onError: (err) => onPayPalError(err)
    }).render(`#${containerId}`);
}

function initCardFields(containerId, submitButtonId, amount, planName) {
    paypal.CardFields({
        createOrder: (data, actions) => createPayPalOrder(amount, planName, actions),
        onApprove: (data, actions) => onPayPalApprove(data, actions),
        onError: (err) => onPayPalError(err)
    }).render(`#${containerId}`).then(cardFields => {
        document.getElementById(submitButtonId).addEventListener('click', () => {
            cardFields.submit().catch(err => {
                showToast(`Card payment failed: ${err.message || err}`, 'error');
                console.error('Card payment error:', err);
            });
        });
    }).catch(err => {
        showToast('Failed to initialize card fields.', 'error');
        console.error('Card fields initialization error:', err);
    });
}

let paymentsClient = null;

function getGooglePaymentsClient() {
    if (paymentsClient === null) {
        paymentsClient = new google.payments.api.PaymentsClient({
            environment: 'TEST'
        });
    }
    return paymentsClient;
}

function onGooglePayLoaded() {
    const paymentsClient = getGooglePaymentsClient();
    paymentsClient.isReadyToPay({
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [{
            type: 'CARD',
            parameters: {
                allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                allowedCardNetworks: ['AMEX', 'DISCOVER', 'MASTERCARD', 'VISA']
            },
            tokenizationSpecification: {
                type: 'PAYMENT_GATEWAY',
                parameters: {
                    gateway: 'paypal',
                    gatewayMerchantId: 'Y47V9MQKYP6WY',
                }
            }
        }]
    }).then(function(response) {
        if (response.result) {
            const buttonEssential = paymentsClient.createButton({
                onClick: () => { initiatePayPalFromGooglePay('15.00', 'Essential'); },
                buttonColor: 'black',
                buttonType: 'buy'
            });
            document.getElementById('googlepay-button-container-essential').appendChild(buttonEssential);

            const buttonFamily = paymentsClient.createButton({
                onClick: () => { initiatePayPalFromGooglePay('39.00', 'Family Plus'); },
                buttonColor: 'black',
                buttonType: 'buy'
            });
            document.getElementById('googlepay-button-container-family').appendChild(buttonFamily);
        } else {
            console.warn('Google Pay is not ready to pay.');
        }
    }).catch(function(err) {
        console.error('Google Pay readiness error:', err);
    });
}

function initiatePayPalFromGooglePay(amount, planName) {
    showToast(`Initiating PayPal payment for ${planName} via Google Pay...`, 'info');
    paypal.Buttons({
        createOrder: (data, actions) => createPayPalOrder(amount, planName, actions),
        onApprove: (data, actions) => onPayPalApprove(data, actions),
        onError: (err) => onPayPalError(err)
    }).render('body').click();
}

function onApplePayLoaded() {
    if (window.ApplePaySession) {
        const applePayEssentialButton = document.getElementById('applepay-button-essential');
        const applePayFamilyButton = document.getElementById('applepay-button-family');

        if (ApplePaySession.canMakePayments()) {
            applePayEssentialButton.style.display = 'block';
            applePayFamilyButton.style.display = 'block';

            applePayEssentialButton.addEventListener('click', () => {
                initiatePayPalFromApplePay('15.00', 'Essential');
            });
            applePayFamilyButton.addEventListener('click', () => {
                initiatePayPalFromApplePay('39.00', 'Family Plus');
            });
        } else {
            console.warn('Apple Pay is not available on this device/browser.');
        }
    } else {
        console.warn('Apple Pay JS API not available.');
    }
}

function initiatePayPalFromApplePay(amount, planName) {
    showToast(`Initiating PayPal payment for ${planName} via Apple Pay...`, 'info');
    paypal.Buttons({
        createOrder: (data, actions) => createPayPalOrder(amount, planName, actions),
        onApprove: (data, actions) => onPayPalApprove(data, actions),
        onError: (err) => onPayPalError(err)
    }).render('body').click();
}

document.addEventListener('DOMContentLoaded', () => {
    initPayPalButtons('paypal-essential', '15.00', 'Essential');
    initPayPalButtons('paypal-family', '39.00', 'Family Plus');
    initCardFields('card-fields-essential', 'card-submit-essential', '15.00', 'Essential');
    initCardFields('card-fields-family', 'card-submit-family', '39.00', 'Family Plus');
    document.getElementById('current-year').textContent = new Date().getFullYear();
});
// Firebase Authentication Signup
document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const errorDiv = document.getElementById('signupError');

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed up successfully
            showToast('Sign up successful! Welcome to Legacy AI.');
            document.getElementById('signupModal').modal('hide');
            document.getElementById('signupForm').reset();
            errorDiv.style.display = 'none';
        })
        .catch((error) => {
            errorDiv.textContent = error.message;
            errorDiv.style.display = 'block';
        });
});

