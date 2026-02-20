import React from 'react';
import { LoginForm } from '../../components/auth/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🦷</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dental Clinic Assistant
          </h1>
          <p className="text-gray-600">
            AI-powered patient management system
          </p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Login</h2>
          <LoginForm />
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Demo credentials:</p>
          <p className="font-mono text-xs mt-1">
            admin@dentalclinic.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
};
