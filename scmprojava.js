document.addEventListener('DOMContentLoaded', function() {
    const eventsContainer = document.getElementById('eventsContainer');
    const ticketsContainer = document.getElementById('ticketsContainer');
    const eventForm = document.getElementById('eventForm');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const purchaseForm = document.getElementById('purchaseForm');
    const searchEvents = document.getElementById('searchEvents');
    const categoryFilter = document.getElementById('categoryFilter');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const createEventBtn = document.getElementById('createEventBtn');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const ticketModal = document.getElementById('ticketModal');
    const closeButtons = document.querySelectorAll('.close');
    
    let events = JSON.parse(localStorage.getItem('events')) || [];
    let tickets = JSON.parse(localStorage.getItem('tickets')) || [];
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser) {
        updateUserUI();
    }
    
    function updateUserUI() {
        const userActions = document.querySelector('.user-actions');
        if (currentUser) {
            userActions.innerHTML = `
                <span>Welcome, ${currentUser.name}</span>
                <button id="logoutBtn">Logout</button>
            `;
            document.getElementById('logoutBtn').addEventListener('click', logout);
        } else {
            userActions.innerHTML = `
                <button id="loginBtn">Login</button>
                <button id="registerBtn">Register</button>
            `;
        }
    }
    
    function renderEvents(filteredEvents = events) {
        eventsContainer.innerHTML = '';
        filteredEvents.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            eventCard.innerHTML = `
                <img src="${event.image}" alt="${event.name}">
                <div class="event-card-content">
                    <h3>${event.name}</h3>
                    <div class="date-location">
                        <span>${new Date(event.date).toLocaleDateString()}</span>
                        <span>${event.location}</span>
                    </div>
                    <div class="price">$${event.price.toFixed(2)}</div>
                    <p>${event.description.substring(0, 100)}...</p>
                    <button data-id="${event.id}">Get Tickets</button>
                </div>
            `;
            eventsContainer.appendChild(eventCard);
        });
        
        document.querySelectorAll('.event-card button').forEach(button => {
            button.addEventListener('click', function() {
                const eventId = this.getAttribute('data-id');
                openTicketModal(eventId);
            });
        });
    }
    
    function renderTickets() {
        ticketsContainer.innerHTML = '';
        if (!currentUser) {
            ticketsContainer.innerHTML = '<p>Please login to view your tickets.</p>';
            return;
        }
        
        const userTickets = tickets.filter(ticket => ticket.userEmail === currentUser.email);
        if (userTickets.length === 0) {
            ticketsContainer.innerHTML = '<p>You have no tickets yet.</p>';
            return;
        }
        
        userTickets.forEach(ticket => {
            const event = events.find(e => e.id === ticket.eventId);
            if (!event) return;
            
            const ticketCard = document.createElement('div');
            ticketCard.className = 'ticket-card';
            ticketCard.innerHTML = `
                <h3>${event.name}</h3>
                <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
                <p><strong>Location:</strong> ${event.location}</p>
                <p><strong>Attendee:</strong> ${ticket.attendeeName}</p>
                <p><strong>Quantity:</strong> ${ticket.quantity}</p>
                <p><strong>Total Paid:</strong> $${(ticket.quantity * event.price).toFixed(2)}</p>
            `;
            ticketsContainer.appendChild(ticketCard);
        });
    }
    
    function openTicketModal(eventId) {
        const event = events.find(e => e.id === eventId);
        if (!event) return;
        
        document.getElementById('ticketModalTitle').textContent = Purchase Ticket: ${event.name};
        document.getElementById('ticketModalContent').innerHTML = `
            <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Price per ticket:</strong> $${event.price.toFixed(2)}</p>
            <p><strong>Available:</strong> ${event.quantity} tickets</p>
        `;
        
        document.getElementById('purchaseQuantity').max = event.quantity;
        document.getElementById('purchaseQuantity').value = 1;
        
        purchaseForm.setAttribute('data-event-id', eventId);
        ticketModal.style.display = 'flex';
    }
    
    function filterEvents() {
        const searchTerm = searchEvents.value.toLowerCase();
        const category = categoryFilter.value;
        
        let filteredEvents = events;
        
        if (searchTerm) {
            filteredEvents = filteredEvents.filter(event => 
                event.name.toLowerCase().includes(searchTerm) || 
                event.description.toLowerCase().includes(searchTerm)
        }
        
        if (category !== 'all') {
            filteredEvents = filteredEvents.filter(event => event.category === category);
        }
        
        renderEvents(filteredEvents);
    }
    
    function generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
    
    function login(email, password) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            currentUser = { name: user.name, email: user.email };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUserUI();
            renderTickets();
            closeModal(loginModal);
            return true;
        }
        return false;
    }