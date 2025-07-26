document.addEventListener('DOMContentLoaded', function() {
    // Check if student is logged in
    const currentStudent = JSON.parse(sessionStorage.getItem('currentStudent')) || {
        name: "John Doe",
        id: "STU20230001",
        class: "Grade 10 - Science",
        term: "First Term 2023",
        position: "5th",
        attendance: "92%",
        promot: "Promoted to JHS 2"
    };
    
    if (!currentStudent) {
        window.location.href = 'index.html';
        return;
    }
    
    // DOM Elements
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const menuItems = document.querySelectorAll('.menu-item');
    const contentSections = document.querySelectorAll('.content-section');
    const resultsTable = document.getElementById('results-table');
    const payFeesBtn = document.getElementById('pay-fees-btn');
    const receiptHistoryBtn = document.getElementById('receipt-history-btn');
    const paymentForm = document.getElementById('payment-form');
    const paymentHistory = document.getElementById('payment-history');
    const paymentModal = document.getElementById('payment-modal');
    const closeModal = document.querySelector('.close-modal');
    const cancelPaymentModal = document.getElementById('cancel-payment-modal');
    const proceedToPayment = document.getElementById('proceed-to-payment');
    const cancelPayment = document.getElementById('cancel-payment');
    const successAlertTemplate = document.getElementById('success-alert-template');
    
    // Populate profile data
    document.getElementById('student-name').textContent = currentStudent.name;
    document.getElementById('student-id').textContent = `ID: ${currentStudent.id}`;
    document.getElementById('student-class').textContent = currentStudent.class;
    document.getElementById('student-term').textContent = currentStudent.term;
    document.getElementById('student-position').textContent = currentStudent.position;
    document.getElementById('student-attendance').textContent = currentStudent.attendance;
    document.getElementById('student-promot').textContent = currentStudent.promot;
    
    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && e.target !== mobileMenuToggle) {
            sidebar.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
        }
    });
    
    // Menu navigation
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            
            // Handle logout
            if (this.id === 'logoutBtn') {
                sessionStorage.removeItem('currentStudent');
                window.location.href = 'index.html';
                return;
            }
            
            // Update active menu item
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected section
            contentSections.forEach(section => {
                section.classList.add('hidden');
                if (section.id === `${sectionId}-section`) {
                    section.classList.remove('hidden');
                }
            });
            
            // Close sidebar on mobile
            if (window.innerWidth <= 992) {
                sidebar.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            }
        });
    });
    
    // Results section
    const resultsData = [
        { subject: "Mathematics", score: 78, grade: "B", comment: "Good effort, needs more practice in algebra" },
        { subject: "English", score: 88, grade: "A", comment: "Excellent writing skills" },
        { subject: "Physics", score: 85, grade: "A", comment: "Very good understanding of concepts" },
        { subject: "Chemistry", score: 82, grade: "A", comment: "Consistent performance" },
        { subject: "Biology", score: 90, grade: "A+", comment: "Outstanding work" },
        { subject: "History", score: 76, grade: "B", comment: "Participates well in class" },
        { subject: "Computer Science", score: 92, grade: "A+", comment: "Excellent programming skills" }
    ];
    
    resultsData.forEach(result => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${result.subject}</td>
            <td>${result.score}</td>
            <td>${result.grade}</td>
            <td>${result.comment}</td>
        `;
        resultsTable.appendChild(row);
    });
    
    // Print report card
    document.getElementById('print-report-btn').addEventListener('click', function() {
        window.print();
    });
    
    // Fees payment
    payFeesBtn.addEventListener('click', function() {
        paymentForm.classList.remove('hidden');
        paymentHistory.classList.add('hidden');
    });
    
    receiptHistoryBtn.addEventListener('click', function() {
        paymentForm.classList.add('hidden');
        paymentHistory.classList.remove('hidden');
    });
    
    // Cancel payment button
    if (cancelPayment) {
        cancelPayment.addEventListener('click', function() {
            paymentForm.classList.add('hidden');
            paymentHistory.classList.remove('hidden');
        });
    }
    
    // Payment form submission
    document.getElementById('feePaymentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const amount = document.getElementById('payment-amount').value;
        document.getElementById('payment-amount-display').textContent = `GHS ${parseFloat(amount).toFixed(2)}`;
        paymentModal.classList.add('active');
    });
    
    // Modal controls
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            paymentModal.classList.remove('active');
        });
    }
    
    if (cancelPaymentModal) {
        cancelPaymentModal.addEventListener('click', function() {
            paymentModal.classList.remove('active');
        });
    }
    
    if (proceedToPayment) {
        proceedToPayment.addEventListener('click', function() {
            const amount = document.getElementById('payment-amount').value * 100; // Convert to pesewas
            const email = `${currentStudent.id.toLowerCase()}@school.edu`;
            
            const handler = PaystackPop.setup({
                key: 'pk_test_3e9630a4bc98a5e0b7101ed38aa6fccd44dba1d0',
                email: email,
                amount: amount,
                currency: 'GHS',
                ref: 'STU-' + Date.now(),
                metadata: {
                    student_id: currentStudent.id,
                    purpose: "school_fees"
                },
                callback: function(response) {
                    // Payment was successful
                    updatePaymentUI(amount / 100); // Convert back to Cedis
                    paymentModal.classList.remove('active');
                    
                    // Show success message
                    showPaymentSuccess(response.reference, amount / 100);
                },
                onClose: function() {
                    // User closed the payment modal
                    console.log('Payment window closed');
                }
            });
            
            handler.openIframe();
        });
    }
    
    // Function to update the payment UI
    function updatePaymentUI(amountPaid) {
        // Get current values from the UI
        const currentFeesElement = document.querySelector('.fee-status .amount:not(.paid):not(.balance)');
        const paidElement = document.querySelector('.fee-status .amount.paid');
        const balanceElement = document.querySelector('.fee-status .amount.balance');
        const statusElement = document.querySelector('.fee-status .badge');
        
        const currentFees = parseFloat(currentFeesElement.textContent.replace('GHS ', '').replace(/,/g, ''));
        const currentPaid = parseFloat(paidElement.textContent.replace('GHS ', '').replace(/,/g, ''));
        
        // Calculate new values
        const newPaid = currentPaid + amountPaid;
        const newBalance = currentFees - newPaid;
        
        // Update the UI
        paidElement.textContent = `GHS ${newPaid.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        balanceElement.textContent = `GHS ${newBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        
        // Update status
        if (newBalance <= 0) {
            statusElement.textContent = 'Fully Paid';
            statusElement.classList.remove('badge-danger');
            statusElement.classList.add('badge-success');
        } else {
            statusElement.textContent = 'Partially Paid';
        }
        
        // Add to payment history
        addPaymentToHistory(amountPaid);
    }
    
    // Function to add payment to history
    function addPaymentToHistory(amount) {
        const historyTable = document.querySelector('#payment-history tbody');
        const now = new Date();
        
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${now.toLocaleDateString()}</td>
            <td>GHS ${amount.toFixed(2)}</td>
            <td>Card Payment</td>
            <td><span class="badge badge-success">Completed</span></td>
            <td><a href="#" class="download-receipt"><i class="fas fa-download"></i></a></td>
        `;
        
        historyTable.insertBefore(newRow, historyTable.firstChild);
    }
    
    // Function to show payment success
    function showPaymentSuccess(reference, amount) {
        const alertClone = successAlertTemplate.cloneNode(true);
        alertClone.classList.remove('hidden');
        alertClone.querySelector('.alert-content').textContent = `Payment of GHS ${amount.toFixed(2)} successful! Reference: ${reference}`;
        
        const mainContent = document.querySelector('.main-content');
        mainContent.insertBefore(alertClone, mainContent.firstChild);
        
        // Add click handler to close button
        alertClone.querySelector('.close-alert').addEventListener('click', function() {
            alertClone.remove();
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            alertClone.remove();
        }, 5000);
    }
    
    // Settings form
    document.getElementById('settingsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // In a real app, verify current password with server
        if (currentPassword !== "password123") { // Using sample password
            showAlert('Current password is incorrect', 'danger');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showAlert('New passwords do not match', 'danger');
            return;
        }
        
        if (newPassword.length < 8) {
            showAlert('Password must be at least 8 characters long', 'danger');
            return;
        }
        
        // In a real app, update password on server
        showAlert('Password updated successfully', 'success');
        this.reset();
    });
    
    // Profile picture upload
    document.getElementById('profile-pic-upload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('profile-pic-preview').src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Profile picture form submission
    document.getElementById('profilePicForm').addEventListener('submit', function(e) {
        e.preventDefault();
        showAlert('Profile picture updated successfully', 'success');
    });
    
    // Helper function to show alerts
    function showAlert(message, type) {
        const alertClone = successAlertTemplate.cloneNode(true);
        alertClone.classList.remove('hidden');
        alertClone.classList.remove('alert-success');
        alertClone.classList.add(`alert-${type}`);
        
        if (type === 'success') {
            alertClone.querySelector('i').className = 'fas fa-check-circle';
        } else if (type === 'danger') {
            alertClone.querySelector('i').className = 'fas fa-exclamation-circle';
        }
        
        alertClone.querySelector('.alert-content').textContent = message;
        
        const mainContent = document.querySelector('.main-content');
        mainContent.insertBefore(alertClone, mainContent.firstChild);
        
        // Add click handler to close button
        alertClone.querySelector('.close-alert').addEventListener('click', function() {
            alertClone.remove();
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            alertClone.remove();
        }, 5000);
    }
    
    // Initialize the first section
    document.querySelector('.menu-item.active').click();
});