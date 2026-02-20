// Identifiants et données de test
const users = {
    eleves: {
        "sophie": { password: "sophie123", name: "Sophie Martin" },
        "lucas": { password: "lucas123", name: "Lucas Dubois" },
        "emma": { password: "emma123", name: "Emma Bernard" }
    },
    prof: {
        "prof": { password: "prof123", name: "Professeur" }
    }
};

// Notes de test
const notes = [
    { eleve: "Sophie", matiere: "Maths", noteSur10: 8.5, noteSur20: 17, commentaire: "Très bon travail" },
    { eleve: "Sophie", matiere: "Français", noteSur10: 7.5, noteSur20: 15, commentaire: "Bien" },
    { eleve: "Sophie", matiere: "Anglais", noteSur10: 8, noteSur20: 16, commentaire: "Excellent" },
    { eleve: "Sophie", matiere: "Sciences", noteSur10: 9, noteSur20: 18, commentaire: "Exceptionnel" },
    
    { eleve: "Lucas", matiere: "Maths", noteSur10: 7, noteSur20: 14, commentaire: "Acceptable" },
    { eleve: "Lucas", matiere: "Français", noteSur10: 8.5, noteSur20: 17, commentaire: "Très bien" },
    { eleve: "Lucas", matiere: "Anglais", noteSur10: 6.5, noteSur20: 13, commentaire: "À améliorer" },
    { eleve: "Lucas", matiere: "Sciences", noteSur10: 7.5, noteSur20: 15, commentaire: "Bien" },
    
    { eleve: "Emma", matiere: "Maths", noteSur10: 9.5, noteSur20: 19, commentaire: "Excellent" },
    { eleve: "Emma", matiere: "Français", noteSur10: 9, noteSur20: 18, commentaire: "Très bien" },
    { eleve: "Emma", matiere: "Anglais", noteSur10: 8.5, noteSur20: 17, commentaire: "Très bien" },
    { eleve: "Emma", matiere: "Sciences", noteSur10: 8, noteSur20: 16, commentaire: "Bien" }
];

let reclamations = [];
let currentUser = null;
let currentUserType = null;
let reclamationCount = localStorage.getItem('reclamationCount') ? parseInt(localStorage.getItem('reclamationCount')) : 0;

// Fonction de connexion
function login() {
    const userType = document.getElementById('userType').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!userType || !username || !password) {
        alert('Veuillez remplir tous les champs');
        return;
    }

    let userFound = false;
    let userData = null;

    if (userType === 'eleve') {
        userData = users.eleves[username.toLowerCase()];
        if (userData && userData.password === password) {
            userFound = true;
            currentUser = username;
            currentUserType = 'eleve';
        }
    } else if (userType === 'prof') {
        userData = users.prof[username.toLowerCase()];
        if (userData && userData.password === password) {
            userFound = true;
            currentUser = username;
            currentUserType = 'prof';
        }
    }

    if (userFound) {
        document.querySelector('.login-box').classList.remove('active');
        if (currentUserType === 'eleve') {
            document.getElementById('eleveDashboard').classList.add('active');
            loadEleveNotes();
        } else {
            document.getElementById('profDashboard').classList.add('active');
            loadProfNotes();
        }
    } else {
        alert('Identifiants incorrects');
    }
}

// Afficher les comptes disponibles
function showAccounts() {
    const accounts = `
🔐 COMPTES DE TEST DISPONIBLES:

👨‍🎓 ÉLÈVES:
1. Identifiant: sophie | Mot de passe: sophie123 (Sophie Martin)
2. Identifiant: lucas | Mot de passe: lucas123 (Lucas Dubois)
3. Identifiant: emma | Mot de passe: emma123 (Emma Bernard)

👨‍🏫 PROFESSEUR:
1. Identifiant: prof | Mot de passe: prof123 (Professeur)
    `;
    alert(accounts);
}

// Incrémenter le compteur de réclamations
function incrementReclamationCount(event) {
    // Vérifier que le formulaire est valide avant d'incrémenter
    const form = event.target.closest('form');
    if (!form.checkValidity()) {
        return;
    }

    event.preventDefault(); // Empêcher le submit par défaut
    
    // Récupérer les données du formulaire
    const formData = new FormData(form);
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');
    
    // Incrémenter le compteur localement
    reclamationCount++;
    localStorage.setItem('reclamationCount', reclamationCount);
    
    // Ajouter une réclamation avec timestamp
    reclamations.push({
        email: email,
        matiere: subject,
        date: new Date().toLocaleDateString('fr-FR'),
        heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    });
    
    // Mettre à jour l'affichage du badge
    const badge = document.getElementById('reclamBadge');
    if (badge) {
        badge.textContent = reclamationCount;
    }
    
    // Envoyer à Formspree via fetch
    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            alert('✅ Votre réclamation a été envoyée avec succès!');
            form.reset();
        } else {
            alert('❌ Erreur lors de l\'envoi. Veuillez réessayer.');
        }
    }).catch(error => {
        alert('❌ Erreur de connexion. Vérifiez votre connexion internet.');
        console.log('Erreur:', error);
    });
}

// Charger les notes de l'élève
function loadEleveNotes() {
    const tableBody = document.getElementById('notesBody');
    tableBody.innerHTML = '';

    const eleveNotes = notes.filter(n => n.eleve === currentUser);
    
    eleveNotes.forEach(note => {
        const row = `
            <tr>
                <td>${note.matiere}</td>
                <td>${note.noteSur10}/10</td>
                <td>${note.noteSur20}/20</td>
                <td>${note.commentaire}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    // Calculer la moyenne
    const sum = eleveNotes.reduce((acc, n) => acc + n.noteSur20, 0);
    const moyenne = (sum / eleveNotes.length).toFixed(2);
    document.getElementById('moyenne').textContent = moyenne + '/20';
}

// Charger toutes les notes pour le professeur
function loadProfNotes() {
    const tableBody = document.getElementById('allNotesBody');
    tableBody.innerHTML = '';

    notes.forEach((note, index) => {
        const row = `
            <tr>
                <td>${note.eleve}</td>
                <td>${note.matiere}</td>
                <td>${note.noteSur10}/10</td>
                <td>${note.noteSur20}/20</td>
                <td>
                    <button onclick="deleteNote(${index})" style="background: #f44336; padding: 6px 12px; font-size: 12px;">Supprimer</button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    loadReclamations();
}

// Ajouter une note (Professeur)
function addNote() {
    const eleve = document.getElementById('eleveSelect').value;
    const matiere = document.getElementById('matiereSelect').value;
    const noteSur10 = parseFloat(document.getElementById('noteSur10').value);
    const commentaire = document.getElementById('commentaire').value;

    if (!eleve || !matiere || noteSur10 < 0 || noteSur10 > 10) {
        alert('Veuillez remplir correctement tous les champs');
        return;
    }

    const noteSur20 = (noteSur10 * 2).toFixed(2);
    
    notes.push({
        eleve: eleve,
        matiere: matiere,
        noteSur10: noteSur10,
        noteSur20: parseFloat(noteSur20),
        commentaire: commentaire || "Aucun commentaire"
    });

    alert('Note ajoutée avec succès!');
    document.getElementById('noteSur10').value = '';
    document.getElementById('commentaire').value = '';
    document.getElementById('eleveSelect').value = '';
    document.getElementById('matiereSelect').value = '';
    
    loadProfNotes();
}

// Supprimer une note
function deleteNote(index) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette note?')) {
        notes.splice(index, 1);
        loadProfNotes();
    }
}

// Charger et afficher les réclamations (seulement le compteur pour le prof)
function loadReclamations() {
    const reclamContainer = document.getElementById('reclamations');
    const badge = document.getElementById('reclamBadge');
    
    // Mettre à jour le badge
    if (badge) {
        badge.textContent = reclamationCount;
    }
    
    reclamContainer.innerHTML = '';

    if (reclamations.length === 0) {
        reclamContainer.innerHTML = '<p style="color: #999;">Aucune réclamation pour le moment. ✓</p>';
        return;
    }

    // Afficher seulement les informations sans le contenu (envoyé à Formspree)
    reclamations.forEach((recl, index) => {
        const reclamDiv = `
            <div class="reclamation-item">
                <div class="reclamation-info">
                    <strong>📧 Réclamation #${index + 1}</strong>
                    <small><strong>Date:</strong> ${recl.date} à ${recl.heure}</small>
                    <small><strong>Matière:</strong> ${recl.matiere}</small>
                    <small><strong>Email:</strong> ${recl.email}</small>
                    <small style="color: #1976d2; margin-top: 5px;">✓ Envoyée à Formspree</small>
                </div>
                <div class="reclamation-actions">
                    <button onclick="deleteReclamation(${index})">Supprimer</button>
                </div>
            </div>
        `;
        reclamContainer.innerHTML += reclamDiv;
    });
}

// Supprimer une réclamation
function deleteReclamation(index) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette réclamation?')) {
        reclamations.splice(index, 1);
        loadReclamations();
    }
}

// Déconnexion
function logout() {
    currentUser = null;
    currentUserType = null;
    document.querySelector('.login-box').classList.add('active');
    document.getElementById('eleveDashboard').classList.remove('active');
    document.getElementById('profDashboard').classList.remove('active');
    
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('userType').value = '';
}

// Chatbot simple
function toggleChat() {
    document.getElementById('chatWindow').classList.toggle('active');
}

function sendChat() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value;

    if (!message) return;

    const chatMessages = document.getElementById('chatMessages');
    
    // Ajouter le message utilisateur
    const userMsg = `<div class="message user">${message}</div>`;
    chatMessages.innerHTML += userMsg;

    // Réponse du bot (simple)
    setTimeout(() => {
        let response = "Je ne comprends pas. Pouvez-vous reformuler?";
        
        if (message.toLowerCase().includes('note')) {
            response = "Consultez votre tableau de bord pour voir vos notes détaillées.";
        } else if (message.toLowerCase().includes('réclamation')) {
            response = "Vous pouvez envoyer une réclamation via le formulaire dans votre profil.";
        } else if (message.toLowerCase().includes('identifiant') || message.toLowerCase().includes('mot de passe')) {
            response = "Pour les identifiants de test, cliquez sur 'Voir les comptes' depuis la page de connexion.";
        } else if (message.toLowerCase().includes('bonjour') || message.toLowerCase().includes('salut')) {
            response = "Bonjour! Comment puis-je vous aider?";
        }

        const botMsg = `<div class="message bot">${response}</div>`;
        chatMessages.innerHTML += botMsg;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 500);

    chatInput.value = '';
}

// Fermer le chatbot si on clique ailleurs
document.addEventListener('click', (e) => {
    const chatWindow = document.getElementById('chatWindow');
    const chatbot = document.querySelector('.chatbot');
    
    if (chatWindow && chatbot && !chatWindow.contains(e.target) && !chatbot.contains(e.target)) {
        chatWindow.classList.remove('active');
    }
});
