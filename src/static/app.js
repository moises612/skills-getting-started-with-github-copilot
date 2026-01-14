document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresca la lista de actividades y participantes
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();

  document.querySelectorAll('.activity-card').forEach(card => {
    const list = card.querySelector('.participants-list');
    if (!list) return;

    const raw = card.dataset.participants;
    let participants = [];

    try {
      if (raw) participants = JSON.parse(raw);
    } catch (e) {
      // fallback: CSV or plain string
      participants = raw ? raw.split(',').map(s => s.trim()).filter(Boolean) : [];
    }

    if (!participants || participants.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'participant-empty';
      empty.textContent = 'No hay participantes inscritos todavía.';
      list.parentNode.replaceChild(empty, list);
      return;
    }

    participants.forEach(name => {
      const li = document.createElement('li');
      li.className = 'participant-item';
      li.style.display = 'flex';
      li.style.alignItems = 'center';
      li.style.marginBottom = '4px';

      const avatar = document.createElement('span');
      avatar.className = 'participant-avatar';
      avatar.textContent = name
        .split(' ')
        .map(n => n[0] || '')
        .slice(0, 2)
        .join('')
        .toUpperCase();

      const span = document.createElement('span');
      span.textContent = name;
      span.style.flex = '1';

      const deleteBtn = document.createElement('button');
      deleteBtn.innerHTML = '🗑️';
      deleteBtn.title = 'Eliminar participante';
      deleteBtn.style.marginLeft = '8px';
      deleteBtn.style.background = 'none';
      deleteBtn.style.border = 'none';
      deleteBtn.style.cursor = 'pointer';
      deleteBtn.style.fontSize = '1em';
      deleteBtn.onclick = function() {
        participants.splice(participants.indexOf(name), 1);
        // Limpiar y volver a renderizar la lista
        list.innerHTML = '';
        participants.forEach(n => {
          // Recursivo: renderiza de nuevo cada participante
          const li2 = document.createElement('li');
          li2.className = 'participant-item';
          li2.style.display = 'flex';
          li2.style.alignItems = 'center';
          li2.style.marginBottom = '4px';
          const avatar2 = document.createElement('span');
          avatar2.className = 'participant-avatar';
          avatar2.textContent = n.split(' ').map(nn => nn[0] || '').slice(0, 2).join('').toUpperCase();
          const span2 = document.createElement('span');
          span2.textContent = n;
          span2.style.flex = '1';
          const deleteBtn2 = document.createElement('button');
          deleteBtn2.innerHTML = '🗑️';
          deleteBtn2.title = 'Eliminar participante';
          deleteBtn2.style.marginLeft = '8px';
          deleteBtn2.style.background = 'none';
          deleteBtn2.style.border = 'none';
          deleteBtn2.style.cursor = 'pointer';
          deleteBtn2.style.fontSize = '1em';
          deleteBtn2.onclick = function() {
            participants.splice(participants.indexOf(n), 1);
            list.innerHTML = '';
            participants.forEach(renderParticipant);
          };
          li2.appendChild(avatar2);
          li2.appendChild(span2);
          li2.appendChild(deleteBtn2);
          list.appendChild(li2);
        });
      };

      li.appendChild(avatar);
      li.appendChild(span);
      li.appendChild(deleteBtn);
      list.appendChild(li);
    });
  });
});
