document.addEventListener('DOMContentLoaded', () => {
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    let currentUserEmail = localStorage.getItem('currentUserEmail');
    let currentUser = users.find(u => u.email === currentUserEmail);

    const scoresTableBody = document.querySelector('#scoresTableBody');
    const logoutBtn = document.getElementById('logoutBtn');
    const backToStartBtn = document.getElementById('backToStartBtn');

    function updateScoresTable() {
        scoresTableBody.innerHTML = '';
        if (!currentUser) return;
        currentUser.scores.forEach((score, idx) => {
            const status = score > 25 ? 'Excellent' : score > 15 ? 'Good' : 'Keep Practicing';
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${idx + 1}</td><td>${score}</td><td>${status}</td>`;
            scoresTableBody.appendChild(tr);
        });
    }

    updateScoresTable();

    logoutBtn?.addEventListener('click', () => {
        localStorage.removeItem('currentUserEmail');
        window.location.href = 'index.html';
    });

    backToStartBtn?.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});
