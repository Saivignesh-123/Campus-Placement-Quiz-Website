document.addEventListener('DOMContentLoaded', () => {
    // ---------- Variables ----------
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    let currentUser = null;
    let currentQuestions = [];
    let currentIndex = 0;
    let score = 0;
    let timer = 30;
    let interval = null;
    let answersGiven = [];

    // ---------- DOM Elements ----------
    const authPage = document.getElementById('authPage');
    const startPage = document.getElementById('startPage');
    const quizPage = document.getElementById('quizPage');
    const resultPage = document.getElementById('resultPage');

    const signupUsername = document.getElementById('signupUsername');
    const signupEmail = document.getElementById('signupEmail');
    const signupPassword = document.getElementById('signupPassword');
    const signupBtn = document.getElementById('signupBtn');

    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const loginBtn = document.getElementById('loginBtn');

    const showLogin = document.getElementById('showLogin');
    const showSignup = document.getElementById('showSignup');

    const displayName = document.getElementById('displayName');

    const questionText = document.getElementById('questionText');
    const optionsContainer = document.getElementById('optionsContainer');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const startTestBtn = document.getElementById('startTestBtn');
    const goToDashboardBtn = document.getElementById('goToDashboardBtn');
    const timerEl = document.getElementById('timer');
    const exitTest = document.getElementById('exitTest');
    const progressFill = document.getElementById('progressFill');
    const restartBtn = document.getElementById('restartBtn');
    const dashboardBtn = document.getElementById('dashboardBtn');

    // ---------- Password Regex ----------
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).+$/;
    document.querySelectorAll('.togglePassword').forEach(eye => {
    eye.addEventListener('click', () => {
        const targetId = eye.getAttribute('data-target');
        const input = document.getElementById(targetId);

        if (input.type === 'password') {
            input.type = 'text';
            eye.classList.add('active');
        } else {
            input.type = 'password';
            eye.classList.remove('active');
        }
    });
});


    // ---------- Check Existing Login ----------
    let storedEmail = localStorage.getItem('currentUserEmail');
    if (storedEmail) {
        currentUser = users.find(u => u.email === storedEmail);
        if (currentUser) {
            authPage.classList.remove('active');
            startPage.classList.add('active');
            displayName.textContent = currentUser.username;
        }
    }

    // ---------- Toggle Signup/Login ----------
    showLogin?.addEventListener('click', () => {
        document.getElementById('signupSection').style.display = 'none';
        document.getElementById('loginSection').style.display = 'block';
    });
    showSignup?.addEventListener('click', () => {
        document.getElementById('signupSection').style.display = 'block';
        document.getElementById('loginSection').style.display = 'none';
    });

    // ---------- Signup ----------
    signupBtn?.addEventListener('click', () => {
        const username = signupUsername.value.trim();
        const email = signupEmail.value.trim();
        const password = signupPassword.value.trim();

        if (!username || !email || !password) return alert('Fill all fields');
        if (!passwordRegex.test(password)) return alert('Password must contain 1 uppercase, 1 lowercase, 1 special char');
        if (users.some(u => u.email === email)) return alert('Email already registered');

        users.push({ username, email, password, scores: [] });
        localStorage.setItem('users', JSON.stringify(users));
        alert('Account created! Login now.');
        signupUsername.value = signupEmail.value = signupPassword.value = '';
        showLogin.click();
    });

    // ---------- Login ----------
    loginBtn?.addEventListener('click', () => {
        const email = loginEmail.value.trim();
        const password = loginPassword.value.trim();
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) return alert('Invalid credentials');

        currentUser = user;
        localStorage.setItem('currentUserEmail', currentUser.email);
        authPage.classList.remove('active');
        startPage.classList.add('active');
        displayName.textContent = currentUser.username;
    });

    // ---------- Questions ----------
    const questions = [
        { question: "He ___ to market yesterday.", options: ["go", "went", "gone", "going"], answer: "went" },
        { question: "Article: ___ university is old.", options: ["A", "An", "The", "No article"], answer: "A" },
        { question: "Find next number: 2, 4, 8, 16, ?", options: ["18", "24", "32", "20"], answer: "32" },
        { question: "Synonym of 'Abundant'", options: ["Plentiful", "Rare", "Little", "Tiny"], answer: "Plentiful" },
        { question: "If 3x + 5 = 20, x = ?", options: ["3", "5", "7", "15"], answer: "5" },
        { question: "Synonym of 'Abundant'", options: ["Plentiful", "Rare", "Little", "Tiny"], answer: "Plentiful" },
        { question: "If 3x + 5 = 20, x = ?", options: ["3", "5", "7", "15"], answer: "5" },
        { question: "Arrange in ascending: 0.3, 0.25, 0.35, 0.2", options: ["0.2,0.25,0.3,0.35","0.25,0.2,0.3,0.35","0.35,0.3,0.25,0.2","0.2,0.3,0.25,0.35"], answer: "0.2,0.25,0.3,0.35" },
        { question: "Opposite of 'Generous'", options: ["Selfish","Kind","Caring","Helpful"], answer: "Selfish" },
        { question: "Find missing: 5, 10, 20, ?, 80", options: ["30","40","50","60"], answer: "40" },
        { question: "Synonym of 'Happy'", options: ["Sad","Joyful","Angry","Depressed"], answer: "Joyful" },
        { question: "If 5y - 10 = 15, y = ?", options: ["5","4","3","2"], answer: "5" },
        //Add remaining 60 questions (mix of easy, medium, hard, aptitude, reasoning, verbal)
        { question: "Complete the sequence: 3, 6, 9, ?", options: ["12","15","18","21"], answer: "12" },
        { question: "Synonym of 'Quick'", options: ["Fast","Slow","Lazy","Sluggish"], answer: "Fast" },
        { question: "If 7x + 2 = 16, x = ?", options: ["2","3","1","4"], answer: "2" },
        { question: "Which word is correct: 'Recieve' or 'Receive'?", options: ["Recieve","Receive","Recive","Receeve"], answer: "Receive" },
        { question: "What is 15% of 200?", options: ["25","30","35","40"], answer: "30" },
        { question: "Logical: All cats are animals. Some animals are dogs. Are all cats dogs?", options: ["Yes","No","Cannot say","Maybe"], answer: "No" },
        { question: "Synonym of 'Big'", options: ["Large","Small","Tiny","Little"], answer: "Large" },
        { question: "Find missing: 2, 4, 12, 48, ?", options: ["96","192","144","144"], answer: "192" },
        { question: "Opposite of 'Generous'", options: ["Selfish","Kind","Caring","Helpful"], answer: "Selfish" },
        { question: "If x/5 = 3, x = ?", options: ["15","10","20","12"], answer: "15" },
        { question: "Synonym of 'Intelligent'", options: ["Smart","Dull","Slow","Stupid"], answer: "Smart" },
        { question: "Solve: 8 + 2*5 - 4 =", options: ["14","16","12","10"], answer: "14" },
        { question: "Find next number: 1,4,9,16,?", options: ["20","25","30","36"], answer: "25" },
        { question: "Synonym of 'Brave'", options: ["Courageous","Cowardly","Timid","Fearful"], answer: "Courageous" },
        { question: "If 3x - 4 = 11, x = ?", options: ["5","3","4","7"], answer: "5" },
        { question: "Choose correct spelling: 'Accomodate'", options: ["Accomodate","Accommodate","Acomodate","Accomadate"], answer: "Accommodate" },
        { question: "What is 25% of 80?", options: ["15","20","25","30"], answer: "20" },
        { question: "Logical: Some A are B. All B are C. Are some A C?", options: ["Yes","No","Cannot say","Maybe"], answer: "Cannot say" },
        { question: "Synonym of 'Small'", options: ["Tiny","Large","Huge","Big"], answer: "Tiny" },
        { question: "Find missing: 1,2,6,24,?", options: ["24","120","48","36"], answer: "120" },
        { question: "Opposite of 'Honest'", options: ["Dishonest","Truthful","Sincere","Kind"], answer: "Dishonest" },
        { question: "Solve: 7 + 3 * 2 - 5 =", options: ["6","8","9","7"], answer: "8" },
        { question: "Synonym of 'Quick'", options: ["Fast","Slow","Late","Lazy"], answer: "Fast" },
        { question: "If 5x + 2 = 17, x = ?", options: ["3","4","2","5"], answer: "3" },
        { question: "Which word is correct: 'Definately' or 'Definitely'?", options: ["Definately","Definitely","Definatly","Definetly"], answer: "Definitely" },
        { question: "What is 10% of 250?", options: ["20","25","30","35"], answer: "25" },
        { question: "Logical: All men are mortal. Socrates is a man. Is Socrates mortal?", options: ["Yes","No","Cannot say","Maybe"], answer: "Yes" },
        { question: "Synonym of 'Sad'", options: ["Happy","Joyful","Sorrowful","Glad"], answer: "Sorrowful" },
        { question: "Find next number: 5, 10, 20, 40, ?", options: ["50","60","80","100"], answer: "80" },
        { question: "Opposite of 'Weak'", options: ["Strong","Fragile","Soft","Feeble"], answer: "Strong" },
        { question: "Solve: 12 - 4 * 2 + 6 =", options: ["10","14","12","16"], answer: "10" },
        { question: "Synonym of 'Angry'", options: ["Furious","Calm","Happy","Joyful"], answer: "Furious" },
        { question: "If 9x - 6 = 21, x = ?", options: ["3","2","4","5"], answer: "3" },
        { question: "Choose correct spelling: 'Occurence'", options: ["Occurence","Occurrence","Ocurrence","Ocurrance"], answer: "Occurrence" },
        { question: "What is 30% of 50?", options: ["10","15","20","25"], answer: "15" },
        { question: "Logical: Some A are B. Some B are C. Can we say some A are C?", options: ["Yes","No","Cannot say","Maybe"], answer: "Cannot say" },
        { question: "Synonym of 'Beautiful'", options: ["Pretty","Ugly","Bad","Mean"], answer: "Pretty" },
        { question: "Find missing: 2,6,12,20,?", options: ["30","24","28","32"], answer: "30" },
        { question: "Opposite of 'Friendly'", options: ["Hostile","Kind","Nice","Polite"], answer: "Hostile" },
        { question: "Solve: 5*6 - 8 + 2 =", options: ["20","24","30","28"], answer: "24" },
        { question: "Synonym of 'Lazy'", options: ["Idle","Active","Energetic","Busy"], answer: "Idle" },
        { question: "If 8x + 4 = 36, x = ?", options: ["3","4","5","6"], answer: "4" },
        { question: "Choose correct spelling: 'Seperate'", options: ["Separate","Seperate","Seperete","Seperat"], answer: "Separate" },
        { question: "What is 40% of 150?", options: ["50","60","70","80"], answer: "60" },
        { question: "Logical: All dogs are animals. All animals are mammals. Are all dogs mammals?", options: ["Yes","No","Cannot say","Maybe"], answer: "Yes" },
        { question: "Synonym of 'Smart'", options: ["Intelligent","Dull","Slow","Stupid"], answer: "Intelligent" },
        { question: "Find next number: 3, 9, 27, ?", options: ["54","81","72","36"], answer: "81" },
        { question: "Opposite of 'Hot'", options: ["Cold","Warm","Cool","Boiling"], answer: "Cold" },
        { question: "Solve: 9 + 5 * 2 - 7 =", options: ["12","15","11","14"], answer: "12" },
        { question: "Synonym of 'Strong'", options: ["Powerful","Weak","Fragile","Soft"], answer: "Powerful" },
        { question: "If 4x - 5 = 11, x = ?", options: ["4","3","5","6"], answer: "4" },
        { question: "Choose correct spelling: 'Reccommend'", options: ["Recommend","Reccommend","Recomend","Recomand"], answer: "Recommend" },
        { question: "What is 20% of 90?", options: ["18","20","16","22"], answer: "18" },
        { question: "Logical: Some cats are dogs. Some dogs are animals. Can we say some cats are animals?", options: ["Yes","No","Cannot say","Maybe"], answer: "Cannot say" },
        { question: "Synonym of 'Difficult'", options: ["Hard","Easy","Simple","Effortless"], answer: "Hard" },
        { question: "Find missing: 1,3,7,15,?", options: ["30","31","29","28"], answer: "31" }
    ];

    // ---------- Start Test ----------
    function startTest() {
        startPage.classList.remove('active');
        quizPage.classList.add('active');
        currentQuestions = [...questions].sort(() => 0.5 - Math.random()).slice(0, 30);
        currentIndex = 0;
        score = 0;
        answersGiven = Array(currentQuestions.length).fill(null);
        progressFill.style.width = `0%`;
        showQuestion();
    }

    function showQuestion() {
        resetTimer();
        const q = currentQuestions[currentIndex];
        questionText.textContent = q.question;
        optionsContainer.innerHTML = '';
        q.options.forEach(opt => {
            const btn = document.createElement('div');
            btn.classList.add('optionBtn');
            btn.textContent = opt;
            if (answersGiven[currentIndex] === opt) btn.classList.add('selected');
            btn.addEventListener('click', () => selectOption(btn, opt));
            optionsContainer.appendChild(btn);
        });
        updateProgress();
    }

    function selectOption(btn, opt) {
        Array.from(optionsContainer.children).forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        answersGiven[currentIndex] = opt;
    }

    function nextQuestion() {
        if (!answersGiven[currentIndex]) return alert("Select an option!");
        if (currentIndex < currentQuestions.length - 1) {
            currentIndex++;
            showQuestion();
        } else endTest();
    }

    function submitTest() {
        if (!answersGiven[currentIndex]) return alert("Select an option!");
        nextQuestion();
    }

    function updateProgress() {
        const percent = ((currentIndex) / currentQuestions.length) * 100;
        progressFill.style.width = `${percent}%`;
        const rocket = document.getElementById('rocket');
        if (rocket) rocket.style.left = `calc(${percent}% - 12px)`;
    }

    function resetTimer() {
        clearInterval(interval);
        timer = 30;
        timerEl.textContent = "00:30";
        interval = setInterval(() => {
            timer--;
            timerEl.textContent = `00:${timer < 10 ? '0' + timer : timer}`;
            if (timer <= 0) { clearInterval(interval); nextQuestion(); }
        }, 1000);
    }

    // ---------- End Test ----------
    function endTest() {
        clearInterval(interval);
        score = answersGiven.reduce((acc, ans, idx) => ans === currentQuestions[idx].answer ? acc + 1 : acc, 0);

        // Update user scores
        if (currentUser) {
            currentUser.scores.push(score);
            localStorage.setItem('users', JSON.stringify(users));
        }

        quizPage.classList.remove('active');
        resultPage.classList.add('active');
        document.getElementById('scoreDisplay').textContent = score;
        const msgEl = document.getElementById('resultMessage');
        msgEl.textContent = score > 25 ? "Excellent!" : score > 15 ? "Good!" : "Keep Practicing!";
    }

    // ---------- Buttons ----------
    startTestBtn?.addEventListener('click', startTest);
    nextBtn?.addEventListener('click', nextQuestion);
    submitBtn?.addEventListener('click', submitTest);

    exitTest?.addEventListener('click', () => {
        if (confirm('Exit test? Your progress will be saved.')) endTest();
    });

    restartBtn?.addEventListener('click', () => {
        resultPage.classList.remove('active');
        startPage.classList.add('active');
    });

    dashboardBtn?.addEventListener('click', () => {
        if (currentUser) window.location.href = 'dashboard.html';
    });

    goToDashboardBtn?.addEventListener('click', () => {
        if (currentUser) window.location.href = 'dashboard.html';
    });
});
