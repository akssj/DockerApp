function loginUser() {
  const usernameInput = document.getElementById('popup_username');
  const passwordInput = document.getElementById('popup_password');
  const name = usernameInput.value;
  const password = passwordInput.value;

  const loginData = { name, password };

  fetch('http://localhost:8080/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loginData),
  })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        localStorage.setItem('loggedin', 'true');
        window.alert('Login successful!');
        toggleLoginPopup();
        console.log('Login successful');
      } else {
        localStorage.setItem('loggedin', 'false');
        window.alert('Invalid username or password. Please try again.');
        console.log('Login failed');
      }
    })
    .catch(error => console.error('Error during login:', error));
}

function createUser() {
const name = document.getElementById('username').value;
const email = document.getElementById('email').value;
const password = document.getElementById('password').value;

const userData = { name, email, password };

fetch('http://localhost:8080/users', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
})
.then(response => {
  if (response.status === 201) {
      console.log('User created');
      fetchUsers();
  } else {
      console.error('Error creating user. Server responded with:', response.status);
  }
})
.catch(error => console.error('Error creating user:', error));
}


function fetchUserById() {
  const userIdInput = document.getElementById('userId');
  const userId = parseInt(userIdInput.value, 10);

  fetch(`http://localhost:8080/users/${userId}`)
    .then(response => response.json())
    .then(user => {
      window.alert(`User Information:\nID: ${user.id}\nName: ${user.name}\nEmail: ${user.email}`);
      console.log('User by ID:', user);
    })
    .catch(error => console.error('Error fetching user by ID:', error));
}

function fetchUsers() {
fetch('http://localhost:8080/users')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(users => {
    if (!Array.isArray(users)) {
      throw new Error('Invalid response format. Users is not an array.');
    }

    const userTableBody = document.getElementById('userTableBody');
    userTableBody.innerHTML = '';

    users.forEach(user => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>
          <button type="button" class="btn btn-danger" onclick="deleteUser(${user.id})">Delete</button>
          <button type="button" class="btn btn-info" onclick="openEditUserModal(${user.id})">Modify</button>
        </td>
      `;
      userTableBody.appendChild(row);
    });
  })
  .catch(error => console.error('Error fetching users:', error.message));
}


function openEditUserModal(userId) {
fetch(`http://localhost:8080/users/${userId}`)
  .then(response => response.json())
  .then(user => {
    document.getElementById('userID').innerText = user.id;
    document.getElementById('editName').value = user.name;
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editPassword').value = '';
  })
  .catch(error => console.error('Error fetching user by ID:', error));

$('#editUserModal').modal('show');
}


function saveUserChanges() {
const userId = document.getElementById('userID').innerText;
const newName = document.getElementById('editName').value;
const newEmail = document.getElementById('editEmail').value;
const newPassword = document.getElementById('editPassword').value;

updateUser(userId, newName, newEmail, newPassword);

$('#editUserModal').modal('hide');
}


function updateUser(userId, newName, newEmail, newPassword) {
fetch(`http://localhost:8080/users/${userId}`, {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: newName, email: newEmail, password: newPassword }),
})
.then(response => response.json())
.then(updatedUser => {
    console.log('User updated:', updatedUser);
    fetchUsers();
})
.catch(error => console.error('Error updating user:', error));
}


function deleteUser(userId) {
  fetch(`http://localhost:8080/users/${userId}`, {
    method: 'DELETE',
  })
    .then(response => {
      if (response.ok) {
        console.log(`User with ID ${userId} deleted`);
        fetchUsers();
      } else {
        console.error(`Error deleting user with ID ${userId}`);
      }
    })
    .catch(error => console.error('Error deleting user:', error));
}

function toggleLoginPopup() {
  const loginPopup = document.getElementById('loginPopup');
  loginPopup.style.display = (loginPopup.style.display === 'block') ? 'none' : 'block';
}

fetchUsers();
