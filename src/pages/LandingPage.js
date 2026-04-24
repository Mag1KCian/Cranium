import React from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome to Cranium</h1>
        <p style={styles.subtitle}>Select your portal to continue</p>
        
        <div style={styles.buttonContainer}>
          <button 
            style={{...styles.button, ...styles.studentButton}}
            onClick={() => navigate('/student')}
          >
            Student
          </button>
          
          <button 
            style={{...styles.button, ...styles.adminButton}}
            onClick={() => navigate('/admin')}
          >
            Admin
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    fontFamily: 'Arial, sans-serif',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '60px 80px',
    borderRadius: '20px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#222',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '40px',
  },
  buttonContainer: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
  },
  button: {
    padding: '20px 50px',
    fontSize: '18px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  studentButton: {
    backgroundColor: '#4F46E5',
    color: '#fff',
  },
  adminButton: {
    backgroundColor: '#059669',
    color: '#fff',
  },
};

export default LandingPage;