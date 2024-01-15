const fetchMock = require('jest-fetch-mock');
global.fetch = fetchMock;

const { updateUser } = require('./frontend');

test('updateUser updates user data', async () => {
    const userId = 1;
    const newName = 'John Doe';
    const newEmail = 'john.doe@example.com';
    const newPassword = 'newpassword';
  
    const mockResponse = { id: userId, name: newName, email: newEmail };
  
    fetchMock.mockOnce(JSON.stringify(mockResponse));
  
    const updatedUserPromise = updateUser(userId, newName, newEmail, newPassword);
  
    const updatedUser = await updatedUserPromise;
  
    expect(updatedUser).toEqual(mockResponse);
  });
  

