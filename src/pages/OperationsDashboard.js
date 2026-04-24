import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area } from 'recharts';

// Mock data for rooms with high power consumption
const mockRooms = [
  { 
    id: 1, 
    name: 'Room 101', 
    power: 4500, 
    status: 'normal',
    components: [
      { name: 'AC Unit 1', power: 1800 },
      { name: 'Lights', power: 400 },
      { name: 'Projector', power: 1200 },
      { name: 'Outlets', power: 1100 }
    ]
  },
  { 
    id: 2, 
    name: 'Room 205', 
    power: 3800, 
    status: 'warning',
    components: [
      { name: 'AC Unit 2', power: 1500 },
      { name: 'Lights', power: 350 },
      { name: 'Computer Lab', power: 950 },
      { name: 'Outlets', power: 1000 }
    ]
  },
  { 
    id: 3, 
    name: 'Lab 301', 
    power: 5200, 
    status: 'danger',
    components: [
      { name: 'AC Unit 3', power: 2200 },
      { name: 'Lights', power: 500 },
      { name: 'Lab Equipment', power: 1800 },
      { name: 'Outlets', power: 700 }
    ]
  },
  { 
    id: 4, 
    name: 'Room 102', 
    power: 2900, 
    status: 'normal',
    components: [
      { name: 'AC Unit 4', power: 1200 },
      { name: 'Lights', power: 300 },
      { name: 'Smart Board', power: 800 },
      { name: 'Outlets', power: 600 }
    ]
  },
];

// Mock data for fire hazard alerts
const mockAlerts = [
  { id: 1, room: 'Lab 301', component: 'AC Unit 3', power: 5800, threshold: 5000, severity: 'critical' },
  { id: 2, room: 'Room 205', component: 'Power Outlet B2', power: 4200, threshold: 5000, severity: 'warning' },
];

// Mock chatbot messages
const mockChatMessages = [
  { id: 1, type: 'ai', text: 'System analysis complete. All HVAC units operating within normal parameters.' },
  { id: 2, type: 'ai', text: 'Alert: Room 205 showing 15% above average power consumption. Recommend inspection.' },
  { id: 3, type: 'ai', text: 'Pre-cooling schedule optimized for tomorrow. Expected 12% energy savings.' },
];

// Generate real-time wattage data
const generateWattageData = () => {
  const data = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000);
    const baseWattage = 28000 + Math.sin(i / 5) * 3000;
    const noise = Math.random() * 2000 - 1000;
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      wattage: Math.round(baseWattage + noise),
    });
  }
  return data;
};

function OperationsDashboard() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState('');
  const [wattageData, setWattageData] = useState(generateWattageData());
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRoom, setExpandedRoom] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);

  // Clock update
  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Camera function - access PC camera
  const toggleCamera = async (roomName) => {
    if (cameraStream && cameraStream.room === roomName) {
      cameraStream.stream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    } else {
      if (cameraStream) {
        cameraStream.stream.getTracks().forEach(t => t.stop());
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraStream({ room: roomName, stream });
      } catch (err) {
        console.error('Camera access error:', err);
        alert('Unable to access camera. Please check permissions.');
      }
    }
  };

  // Toggle component dropdown
  const toggleComponents = (roomId) => {
    setExpandedRoom(expandedRoom === roomId ? null : roomId);
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [cameraStream]);

  // Fetch weather data
  useEffect(() => {
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
  }, []);

  // Simulate real-time wattage updates
  useEffect(() => {
    const interval = setInterval(() => {
      setWattageData(prev => {
        const newData = [...prev.slice(1)];
        const lastWattage = prev[prev.length - 1].wattage;
        const newWattage = lastWattage + (Math.random() * 1000 - 500);
        newData.push({
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          wattage: Math.round(newWattage),
        });
        return newData;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const UPPER_THRESHOLD = 35000;
  const LOWER_THRESHOLD = 22000;

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button style={styles.backButton} onClick={() => navigate('/')}>
            ← Back
          </button>
          <h1 style={styles.headerTitle}>Admin Portal</h1>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.clock}>{currentTime || '00:00:00'}</div>
          <div style={styles.clockLabel}>System Time Sync</div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Metrics Row */}
        <div style={styles.metricsRow}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>External Temp</div>
            <div style={styles.metricValue}>
              {loading ? '--' : weatherData?.external_temp ? `${weatherData.external_temp}°C` : '--'}
            </div>
            <div style={styles.metricStatus}>
              {loading ? 'Loading...' : weatherData?.city || 'Weather data unavailable'}
            </div>
          </div>

          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Grid Status</div>
            <div style={{...styles.metricValue, color: '#0d9488'}}>
              {loading ? '--' : (weatherData?.pre_cooling ? 'Pre-cooling Active' : 'Normal')}
            </div>
            <div style={styles.metricStatus}>
              {loading ? 'Checking...' : weatherData?.pre_cooling ? 'Pre-cooling initialized' : 'Standard operation'}
            </div>
          </div>

          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Carbon Prevented</div>
            <div style={styles.metricValue}>1,240 <span style={styles.metricUnit}>kg</span></div>
            <div style={styles.metricStatus}>Cumulative total</div>
          </div>
        </div>

        {/* Main Grid */}
        <div style={styles.gridContainer}>
          {/* Left Column */}
          <div style={styles.leftColumn}>
            {/* High Power Consumption Rooms */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>High Power Consumption Rooms</h2>
              </div>
              <div style={styles.roomList}>
                {mockRooms.map(room => (
                  <div key={room.id} style={styles.roomItem}>
                    <div style={styles.roomInfo}>
                      <span style={styles.roomName}>{room.name}</span>
                      <span style={{
                        ...styles.roomStatus,
                        color: room.status === 'danger' ? '#dc2626' : room.status === 'warning' ? '#f59e0b' : '#0d9488'
                      }}>
                        {room.power} W
                      </span>
                    </div>
                    <div style={styles.roomActions}>
                  <button style={styles.actionButton} onClick={() => toggleCamera(room.name)}>
                    {cameraStream?.room === room.name ? 'Close Camera' : 'Camera'}
                  </button>
                  <button style={styles.actionButton} onClick={() => toggleComponents(room.id)}>
                    {expandedRoom === room.id ? 'Hide Components' : 'Components'}
                  </button>
                    </div>
                {cameraStream && cameraStream.room === room.name && (
                  <video
                    ref={el => { if (el && !el.srcObject) el.srcObject = cameraStream.stream; }}
                    autoPlay
                    playsInline
                    style={styles.videoStream}
                  />
                )}
                {expandedRoom === room.id && (
                  <div style={styles.componentsDropdown}>
                    {room.components.map((comp, idx) => (
                      <div key={idx} style={styles.componentItem}>
                        <span>{comp.name}</span>
                        <span style={styles.componentPower}>{comp.power}W</span>
                      </div>
                    ))}
                  </div>
                )}
                  </div>
                ))}
              </div>
            </div>

            {/* Fire Hazard Alerts */}
            <div style={{...styles.card, borderLeft: '4px solid #dc2626'}}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>Fire Hazard Alerts</h2>
              </div>
              {mockAlerts.length > 0 ? (
                <div style={styles.alertList}>
                  {mockAlerts.map(alert => (
                    <div key={alert.id} style={{
                      ...styles.alertItem,
                      borderLeft: alert.severity === 'critical' ? '4px solid #dc2626' : '4px solid #f59e0b'
                    }}>
                      <div style={styles.alertInfo}>
                        <span style={styles.alertRoom}>{alert.room}</span>
                        <span style={styles.alertComponent}>{alert.component}</span>
                      </div>
                      <div style={styles.alertPower}>
                        <span style={{color: '#dc2626', fontWeight: '700'}}>{alert.power}W</span>
                        <span style={styles.alertThreshold}>/ {alert.threshold}W threshold</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.noAlerts}>No components under danger</div>
              )}
            </div>
          </div>

          {/* Center Column - Building Wattage Chart */}
          <div style={styles.centerColumn}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>Building Wattage</h2>
              </div>
              <div style={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={wattageData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#64748b" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#64748b" domain={[15000, 40000]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                      formatter={(value) => [`${value} W`, 'Wattage']}
                    />
                    <ReferenceLine y={UPPER_THRESHOLD} stroke="#dc2626" strokeDasharray="5 5" label={{ value: 'Fossil Energy Switch', fill: '#dc2626', fontSize: 10 }} />
                    <ReferenceLine y={LOWER_THRESHOLD} stroke="#0d9488" strokeDasharray="5 5" label={{ value: 'Auto-cooling', fill: '#0d9488', fontSize: 10 }} />
                    <Line type="monotone" dataKey="wattage" stroke="#7c3aed" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* UIET Academic Block */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.buildingInfo}>
                  <h2 style={styles.cardTitle}>UIET Academic Block</h2>
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
                <div style={{...styles.progressFill, width: '80%', backgroundColor: '#0d9488'}}></div>
                <div style={{...styles.progressFill, width: '20%', backgroundColor: '#1e293b'}}></div>
              </div>
              <div style={styles.legend}>
                <span><span style={{...styles.legendDot, backgroundColor: '#0d9488'}}></span> HVAC: 25 kW</span>
                <span><span style={{...styles.legendDot, backgroundColor: '#1e293b'}}></span> Other: 6 kW</span>
              </div>
            </div>
          </div>

          {/* Right Column - Chatbot */}
          <div style={styles.rightColumn}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>Operations AI Chatbot</h2>
              </div>
              <div style={styles.chatContainer}>
                {mockChatMessages.map(msg => (
                  <div key={msg.id} style={styles.chatMessage}>
                    <div style={styles.chatIcon}>AI</div>
                    <div style={styles.chatText}>{msg.text}</div>
                  </div>
                ))}
              </div>
              <div style={styles.chatInput}>
                <input type="text" placeholder="Ask about operations..." style={styles.input} />
                <button style={styles.sendButton}>Send</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#F8FAFC',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    borderBottom: '1px solid #e2e8f0',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  backButton: {
    padding: '8px 16px',
    fontSize: '14px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#1e293b',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  headerRight: {
    textAlign: 'right',
  },
  clock: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    fontFamily: 'monospace',
  },
  clockLabel: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  main: {
    padding: '24px 40px',
    maxWidth: '1600px',
    margin: '0 auto',
  },
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginBottom: '24px',
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
  },
  metricLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  metricValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
  },
  metricUnit: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#64748b',
  },
  metricStatus: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '8px',
    backgroundColor: '#f1f5f9',
    padding: '4px 10px',
    borderRadius: '6px',
    display: 'inline-block',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr 1fr',
    gap: '24px',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  centerColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #f1f5f9',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  roomList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  roomItem: {
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  roomInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  roomName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
  },
  roomStatus: {
    fontSize: '14px',
    fontWeight: '700',
  },
  roomActions: {
    display: 'flex',
    gap: '8px',
  },
  actionButton: {
    flex: 1,
    padding: '6px 12px',
    backgroundColor: '#0d9488',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  videoStream: {
    width: '100%',
    marginTop: '12px',
    borderRadius: '8px',
    backgroundColor: '#000',
  },
  componentsDropdown: {
    marginTop: '12px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '8px',
  },
  componentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 4px',
    fontSize: '13px',
    borderBottom: '1px solid #f1f5f9',
  },
  componentPower: {
    fontWeight: '600',
    color: '#0d9488',
  },
  alertList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  alertItem: {
    padding: '12px',
    backgroundColor: '#fef2f2',
    borderRadius: '8px',
  },
  alertInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  alertRoom: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
  },
  alertComponent: {
    fontSize: '13px',
    color: '#64748b',
  },
  alertPower: {
    fontSize: '13px',
  },
  alertThreshold: {
    color: '#64748b',
    marginLeft: '4px',
  },
  noAlerts: {
    padding: '20px',
    textAlign: 'center',
    color: '#0d9488',
    fontSize: '14px',
    fontWeight: '500',
  },
  chartContainer: {
    height: '300px',
  },
  buildingInfo: {},
  buildingSubtitle: {
    fontSize: '13px',
    color: '#64748b',
    margin: '4px 0 0 0',
  },
  buildingBadge: {
    padding: '4px 10px',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    fontSize: '11px',
    fontWeight: '600',
    borderRadius: '6px',
    textTransform: 'uppercase',
  },
  statusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '16px',
  },
  statusLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'block',
    marginBottom: '4px',
  },
  statusValue: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#0d9488',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#0d9488',
  },
  loadDisplay: {
    textAlign: 'right',
  },
  loadValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
  },
  loadUnit: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#64748b',
  },
  loadLabel: {
    fontSize: '13px',
    color: '#64748b',
  },
  progressBar: {
    height: '10px',
    width: '100%',
    backgroundColor: '#f1f5f9',
    borderRadius: '20px',
    display: 'flex',
    overflow: 'hidden',
    marginBottom: '12px',
  },
  legend: {
    display: 'flex',
    gap: '20px',
    fontSize: '13px',
    color: '#64748b',
  },
  legendDot: {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: '2px',
    marginRight: '6px',
  },
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '400px',
    overflowY: 'auto',
  },
  chatMessage: {
    display: 'flex',
    gap: '10px',
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  chatIcon: {
    width: '32px',
    height: '32px',
    backgroundColor: '#7c3aed',
    color: '#fff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '700',
    flexShrink: 0,
  },
  chatText: {
    fontSize: '13px',
    color: '#1e293b',
    lineHeight: '1.5',
  },
  chatInput: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '13px',
    outline: 'none',
  },
  sendButton: {
    padding: '10px 20px',
    backgroundColor: '#7c3aed',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default OperationsDashboard;