import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('admin'); // 'admin' or 'student'

  // Live Clock Update
  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      {/* Left Side - Login Form Card */}
      <div style={styles.leftPane}>
        <div style={styles.formCard}>
          {/* Header & Clock */}
          <div style={styles.cardHeader}>
            <div style={styles.projectTitle}>Project Thermal Grid</div>
            <div style={styles.clockBox}>
              <div style={styles.timeText}>{currentTime || '00:00:00'}</div>
              <div style={styles.timeLabel}>SYSTEM TIME SYNC</div>
            </div>
          </div>

          {/* Main Form Content */}
          <div style={styles.formContent}>
            <h2 style={styles.welcomeTitle}>Welcome Back</h2>
            <p style={styles.welcomeSub}>
              {role === 'admin' ? 'Enter your details to manage the grid' : 'Access your campus dashboard'}
            </p>

            {/* Role Selection Toggle */}
            <div style={styles.roleToggleContainer}>
              <button 
                style={role === 'admin' ? styles.roleButtonActive : styles.roleButton}
                onClick={() => setRole('admin')}
              >
                Admin
              </button>
              <button 
                style={role === 'student' ? styles.roleButtonActive : styles.roleButton}
                onClick={() => setRole('student')}
              >
                Student
              </button>
            </div>

            {/* Email Input */}
            <div style={styles.inputContainer}>
              <svg style={styles.inputIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              <input type="email" placeholder="Enter your email" style={styles.input} />
            </div>

            {/* Password Input */}
            <div style={styles.inputContainer}>
              <svg style={styles.inputIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter your password" 
                style={styles.input} 
              />
              <svg 
                style={styles.eyeIcon} 
                onClick={() => setShowPassword(!showPassword)}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </div>

            {/* Remember Me & Forgot Password */}
            <div style={styles.formOptions}>
              <label style={styles.checkboxLabel}>
                <input type="checkbox" style={styles.checkbox} />
                Remember me
              </label>
              <span style={styles.forgotLink}>Forgot Password?</span>
            </div>

            {/* Action Button - Routes dynamically based on selected role */}
            <button style={styles.loginBtn} onClick={() => navigate(role === 'admin' ? '/admin' : '/student')}>
              Login
            </button>

            {/* Separator */}
            <div style={styles.separator}>
              <div style={styles.line}></div>
              <span style={styles.orText}>OR</span>
              <div style={styles.line}></div>
            </div>

            {/* Social Logins - Routes to Student Page */}
            <div style={styles.socialGrid}>
              <button style={styles.socialBtn} onClick={() => navigate(role === 'admin' ? '/admin' : '/student')}>
                <svg style={styles.socialIcon} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.126 3.805 3.068 1.52-.058 2.115-.998 3.96-.998 1.845 0 2.378.998 3.974.968 1.637-.029 2.65-1.523 3.64-2.96 1.154-1.682 1.626-3.313 1.65-3.398-.035-.015-3.182-1.222-3.21-4.86-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.702z"/>
                </svg>
                Log in with Apple
              </button>
              <button style={styles.socialBtn} onClick={() => navigate(role === 'admin' ? '/admin' : '/student')}>
                <svg style={styles.socialIcon} viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign In with Google
              </button>
            </div>
          </div>

          {/* Form Footer - HVAC Load */}
          <div style={styles.hvacFooter}>
            <div style={styles.hvacHeader}>
              <div style={styles.hvacTags}>
                <span style={styles.hvacLabel}>HVAC: 25 kW</span>
                <span style={styles.hvacLabel}>Other: 6 kW</span>
              </div>
              <span style={styles.totalLoad}>Total Load: 31 kW</span>
            </div>
            <div style={styles.hvacBarContainer}>
              <div style={{...styles.hvacBar, width: '80%', backgroundColor: '#0d9488'}}></div>
              <div style={{...styles.hvacBar, width: '20%', backgroundColor: '#1e293b'}}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Abstract Visuals & Data */}
      <div style={styles.rightPane}>
        <div style={styles.glassCardsContainer}>
          <div style={styles.glassCard}>
            <div style={styles.glassLabel}>EXTERNAL TEMP</div>
            <div style={styles.glassValue}>26.79°C</div>
            <div style={styles.glassSub}>Chandigarh</div>
          </div>
          <div style={styles.glassCard}>
            <div style={styles.glassLabel}>GRID STATUS</div>
            <div style={styles.glassValue}>Log in Status: Secure Connection</div>
            <div style={styles.glassSub}>Connection Established</div>
          </div>
        </div>

        <div style={styles.visualFooter}>
          <h1 style={styles.serifHeading}>
            Get Everything You Want - A Carbon Prevented Total: 1,240 kg
          </h1>
          <p style={styles.visualFooterText}>
            UIET Academic Block - Sector 25, Panjab University
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    minHeight: '100vh',
    width: '100%',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  },
  leftPane: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
    width: '100%',
    maxWidth: '520px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '32px 40px',
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: '#fafafa',
  },
  projectTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  clockBox: {
    textAlign: 'right',
  },
  timeText: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#0d9488', // Dark teal accent
    fontFamily: 'monospace',
  },
  timeLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: '1px',
    marginTop: '2px',
  },
  formContent: {
    padding: '40px',
  },
  welcomeTitle: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: '36px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 8px 0',
  },
  welcomeSub: {
    fontSize: '15px',
    color: '#64748b',
    marginBottom: '24px',
  },
  roleToggleContainer: {
    display: 'flex',
    backgroundColor: '#f1f5f9',
    borderRadius: '12px',
    padding: '4px',
    marginBottom: '24px',
  },
  roleButton: {
    flex: 1,
    padding: '10px 0',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  roleButtonActive: {
    flex: 1,
    padding: '10px 0',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    transition: 'all 0.2s ease',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '14px 16px',
    marginBottom: '16px',
    backgroundColor: '#fff',
    transition: 'border-color 0.2s',
  },
  inputIcon: {
    width: '20px',
    height: '20px',
    color: '#94a3b8',
    marginRight: '12px',
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '15px',
    color: '#1e293b',
    background: 'transparent',
  },
  eyeIcon: {
    width: '20px',
    height: '20px',
    color: '#94a3b8',
    cursor: 'pointer',
  },
  formOptions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    fontSize: '14px',
    color: '#64748b',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  checkbox: {
    marginRight: '8px',
    accentColor: '#1d4ed8',
  },
  forgotLink: {
    fontWeight: '600',
    color: '#1d4ed8',
    cursor: 'pointer',
  },
  loginBtn: {
    width: '100%',
    backgroundColor: '#1d4ed8', // Deep blue
    color: '#fff',
    padding: '16px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    boxShadow: '0 4px 12px rgba(29, 78, 216, 0.2)',
  },
  separator: {
    display: 'flex',
    alignItems: 'center',
    margin: '32px 0',
  },
  line: {
    flex: 1,
    height: '1px',
    backgroundColor: '#e2e8f0',
  },
  orText: {
    margin: '0 16px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#94a3b8',
  },
  socialGrid: {
    display: 'flex',
    gap: '20px',
  },
  socialBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '14px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    backgroundColor: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  socialIcon: {
    width: '20px',
    height: '20px',
  },
  hvacFooter: {
    padding: '24px 40px',
    backgroundColor: '#fafafa',
    borderTop: '1px solid #f1f5f9',
  },
  hvacHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  hvacTags: {
    display: 'flex',
    gap: '12px',
  },
  hvacLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
  },
  totalLoad: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
  },
  hvacBarContainer: {
    height: '8px',
    width: '100%',
    backgroundColor: '#f1f5f9',
    borderRadius: '10px',
    display: 'flex',
    overflow: 'hidden',
  },
  hvacBar: {
    height: '100%',
  },
  rightPane: {
    flex: 1.1,
    backgroundColor: '#000000',
    backgroundImage: `
      radial-gradient(circle at 20% 80%, rgba(134, 25, 143, 0.4) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(30, 58, 138, 0.6) 0%, transparent 50%),
      linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(30, 58, 138, 0.3) 50%, rgba(88, 28, 135, 0.5) 100%)
    `,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '60px',
    color: '#ffffff',
    position: 'relative',
    borderLeft: '1px solid rgba(255,255,255,0.1)',
  },
  glassCardsContainer: {
    display: 'flex',
    gap: '20px',
    zIndex: 2,
  },
  glassCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '20px',
    borderRadius: '16px',
    flex: 1,
  },
  glassLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: '1px',
    marginBottom: '8px',
  },
  glassValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '4px',
  },
  glassSub: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  visualFooter: {
    zIndex: 2,
  },
  serifHeading: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: '44px',
    fontWeight: '700',
    lineHeight: '1.2',
    color: '#f8fafc',
    marginBottom: '20px',
    maxWidth: '90%',
  },
  visualFooterText: {
    fontSize: '15px',
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
    letterSpacing: '0.5px',
  },
};

export default LandingPage;