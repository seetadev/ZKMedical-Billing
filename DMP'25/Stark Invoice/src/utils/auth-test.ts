// Authentication Test Utilities
// Use these functions to test the authentication integration

import { cloudService } from '../services/cloud-service';

export const testAuthFlow = async () => {
  console.log('Testing authentication flow...');
  
  try {
    // Test registration
    console.log('Testing registration...');
    const registerResult = await cloudService.register({
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpassword123'
    });
    console.log('Registration result:', registerResult);
    
    // Test login
    console.log('Testing login...');
    const loginResult = await cloudService.login({
      email: 'test@example.com',
      password: 'testpassword123'
    });
    console.log('Login result:', loginResult);
    
    // Check authentication status
    console.log('Is authenticated:', cloudService.isAuthenticated());
    console.log('Current user:', cloudService.getCurrentUserInfo());
    
    // Test logout
    console.log('Testing logout...');
    await cloudService.logout();
    console.log('Is authenticated after logout:', cloudService.isAuthenticated());
    
  } catch (error) {
    console.error('Auth test failed:', error);
  }
};

// Helper function to check current auth status
export const checkAuthStatus = () => {
  console.log('Authentication Status:');
  console.log('- Is authenticated:', cloudService.isAuthenticated());
  console.log('- Current token:', cloudService.getToken());
  console.log('- Current user:', cloudService.getCurrentUserInfo());
};

// Helper function to clear all auth data
export const clearAuthData = () => {
  cloudService.clearToken();
  console.log('All authentication data cleared');
};
