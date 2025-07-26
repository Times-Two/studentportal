// auth.js
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    
    // Sample student data (in a real app, this would come from a server)
    const students = {
        "STU20230001": {
            password: "password123",
            name: "John Doe",
            class: "Grade 10 - JHS 3",
            term: "First Term 2023",
            position: "5th",
            attendance: "92%",
            promot: "Promoted to JHS 2"

        },
        "STU20230002": {
            password: "password123",
            name: "Jane Smith",
            class: "Grade 11 - JHS 1",
            term: "First Term 2023",
            position: "3rd",
            attendance: "95%",
            promot: "Promoted to JHS 2"
        }
    };
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const studentId = document.getElementById('studentId').value;
        const password = document.getElementById('password').value;
        
        // Check if student exists and password matches
        if (students[studentId] && students[studentId].password === password) {
            // Store student data in sessionStorage (in a real app, use proper session management)
            sessionStorage.setItem('currentStudent', JSON.stringify({
                id: studentId,
                ...students[studentId]
            }));
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            loginError.textContent = 'Invalid Student ID or Password';
        }
    });
});