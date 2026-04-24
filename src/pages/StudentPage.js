import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function StudentPage() {
  const navigate = useNavigate();
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    // Update clock
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateClock();
    const clockInterval = setInterval(updateClock, 1000);

    // Fetch weather data from Flask backend
    fetch('http://localhost:5000/precool')
      .then(res => res.json())
      .then(data => {
        setWeatherData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch weather data:', err);
        setLoading(false);
      });

    return () => clearInterval(clockInterval);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button style={styles.backButton} onClick={() => navigate('/')}>
            ← Back
          </button>
          <h1 style={styles.headerTitle}>Student Portal</h1>
        </div>
      </div>
      
      <div style={styles.card}>
        <div style={styles.titleRow}>
          <div>
            <h1 style={styles.title}>Project Thermal Grid</h1>
            <p style={styles.subtitle}>Building Operations & Load Management</p>
          </div>
          <div style={styles.clock}>
            <div style={styles.clockTime}>{currentTime || '00:00:00'}</div>
            <div style={styles.clockLabel}>System Time Sync</div>
          </div>
        </div>
        
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>External Temp</div>
            <div style={styles.statValue}>
              {loading ? '--' : weatherData?.external_temp ? `${weatherData.external_temp}°C` : '--'}
            </div>
            <div style={styles.statStatus}>
              {loading ? 'Loading weather...' : weatherData?.city || 'Weather data unavailable'}
            </div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Grid Status</div>
            <div style={{...styles.statValue, color: '#008489'}}>
              {loading ? '--' : (weatherData?.pre_cooling ? 'Pre-cooling Active' : 'Normal')}
            </div>
            <div style={styles.statStatus}>
              {loading ? 'Checking status...' : weatherData?.pre_cooling 
                ? 'Pre-cooling initialized' : 'Standard operation'}
            </div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Carbon Prevented</div>
            <div style={styles.statValue}>1,240 <span style={styles.statUnit}>kg</span></div>
            <div style={styles.statStatus}>Cumulative total</div>
          </div>
        </div>
        
        <div style={styles.buildingCard}>
          <div style={styles.buildingHeader}>
            <div style={styles.buildingInfo}>
              <h2 style={styles.buildingTitle}>UIET Academic Block</h2>
              <p style={styles.buildingSubtitle}>BLDG-01 • Sector 25, Panjab University</p>
            </div>
            <span style={styles.buildingBadge}>Academic</span>
          </div>
          
          <div style={styles.statusRow}>
            <div>
              <span style={styles.statusLabel}>Current Status</span>
              <div style={styles.statusValue}>
                <span style={styles.statusDot}></span> 
                {loading ? 'Loading...' : (weatherData?.pre_cooling ? 'Pre-cooling Active' : 'Normal')}
              </div>
            </div>
            <div style={styles.loadDisplay}>
              <div style={styles.loadValue}>31 <span style={styles.loadUnit}>kW</span></div>
              <div style={styles.loadLabel}>Total Load</div>
            </div>
          </div>
          
          <div style={styles.progressBar}>
            <div style={{...styles.progressFill, width: '80%', backgroundColor: '#008489'}}></div>
            <div style={{...styles.progressFill, width: '20%', backgroundColor: '#222222'}}></div>
          </div>
          
          <div style={styles.legend}>
            <span><span style={{...styles.legendDot, backgroundColor: '#008489'}}></span> HVAC: 25 kW</span>
            <span><span style={{...styles.legendDot, backgroundColor: '#222222'}}></span> Other: 6 kW</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f7f7f7',
    fontFamily: 'Inter, Arial, sans-serif',
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    maxWidth: '1200px',
    margin: '0 auto 20px auto',
  },
  backButton: {
    padding: '10px 20px',
    fontSize: '14px',
    backgroundColor: '#f3f4f6',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#222222',
    margin: 0,
  },
  card: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '20px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#222222',
    margin: 0,
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    margin: '5px 0 0 0',
  },
  clock: {
    textAlign: 'right',
  },
  clockTime: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#222222',
  },
  clockLabel: {
    fontSize: '12px',
    color: '#666',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
  },
  statCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #ebebeb',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
  },
  statLabel: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '36px',
    fontWeight: '600',
    color: '#222222',
  },
  statUnit: {
    fontSize: '18px',
    fontWeight: '500',
    color: '#666',
  },
  statStatus: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500',
    marginTop: '12px',
    backgroundColor: '#f3f4f6',
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '6px',
  },
  buildingCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #ebebeb',
    borderRadius: '20px',
    padding: '32px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
  },
  buildingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #f3f4f6',
    paddingBottom: '20px',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '15px',
  },
  buildingInfo: {},
  buildingTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#222222',
    margin: 0,
  },
  buildingSubtitle: {
    fontSize: '14px',
    color: '#666',
    margin: '5px 0 0 0',
  },
  buildingBadge: {
    padding: '6px 12px',
    backgroundColor: '#f3f4f6',
    color: '#666',
    fontSize: '12px',
    fontWeight: 'bold',
    borderRadius: '6px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  statusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '20px',
  },
  statusLabel: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    display: 'block',
    marginBottom: '4px',
  },
  statusValue: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#008489',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#008489',
  },
  loadDisplay: {
    textAlign: 'right',
  },
  loadValue: {
    fontSize: '30px',
    fontWeight: '600',
    color: '#222222',
  },
  loadUnit: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#666',
  },
  loadLabel: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500',
  },
  progressBar: {
    height: '12px',
    width: '100%',
    backgroundColor: '#f3f4f6',
    borderRadius: '20px',
    display: 'flex',
    overflow: 'hidden',
    marginBottom: '16px',
  },
  legend: {
    display: 'flex',
    gap: '24px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#666',
  },
  legendDot: {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: '2px',
    marginRight: '6px',
  },
};

export default StudentPage;