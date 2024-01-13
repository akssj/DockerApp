function loginUser() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const name = usernameInput.value;
    const password = passwordInput.value;
  
    const loginData = { name, password };

    fetch('http://localhost:3000/login', {
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
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
  
    fetch('http://localhost:3000/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email }),
    })
      .then(response => response.json())
      .then(() => {
        console.log('User created');
        fetchUsers();
      })
      .catch(error => console.error('Error creating user:', error));
}

function fetchUserById() {
    const userIdInput = document.getElementById('userId');
    const userId = parseInt(userIdInput.value, 10);

    fetch(`http://localhost:3000/users/${userId}`)
      .then(response => response.json())
      .then(user => {
        window.alert(`User Information:\nID: ${user.id}\nName: ${user.name}\nEmail: ${user.email}`);
        console.log('User by ID:', user);
      })
      .catch(error => console.error('Error fetching user by ID:', error));
}
  
function fetchUsers() {
    fetch('http://localhost:3000/users')
      .then(response => response.json())
      .then(users => {
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
      .catch(error => console.error('Error fetching users:', error));
}

  function openEditUserModal(userId) {
    fetch(`http://localhost:3000/users/${userId}`)
      .then(response => response.json())
      .then(user => {
        document.getElementById('userID').innerText = user.id;
        document.getElementById('editName').value = user.name;
        document.getElementById('editEmail').value = user.email;
      })
      .catch(error => console.error('Error fetching user by ID:', error));

    $('#editUserModal').modal('show');
}

function saveUserChanges() {
    const userId = document.getElementById('userID').innerText;
    const newName = document.getElementById('editName').value;
    const newEmail = document.getElementById('editEmail').value;

    updateUser(userId, newName, newEmail);

    $('#editUserModal').modal('hide');
}
  
function updateUser(userId, newName, newEmail) {
    fetch(`http://localhost:3000/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newName, email: newEmail }),
    })
      .then(response => response.json())
      .then(updatedUser => {
        console.log('User updated:', updatedUser);
        fetchUsers();
      })
      .catch(error => console.error('Error updating user:', error));
}

function deleteUser(userId) {
    fetch(`http://localhost:3000/users/${userId}`, {
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
  