import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

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

// Recommended prompts for the chatbot
const recommendedPrompts = [
  "Status of Lab 301?",
  "Reduce power in Room 205",
  "Are there any active fire alerts?",
];

// Generate real-time wattage data
const generateWattageData = () => {
  const data = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000);
    const baseWattage = 28000 + Math.sin(i / 5) * 3000;
    const noise = Math.random() * 2000 - 1000;
    const total = Math.round(baseWattage + noise);
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      wattage: total,
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
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [roomsData, setRoomsData] = useState(mockRooms);
  const [alertsData, setAlertsData] = useState(mockAlerts);
  const chatEndRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

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

  // Toggle component power cutoff
  const toggleComponentPower = (roomId, componentName) => {
    setRoomsData(prevData => prevData.map(room => {
      if (room.id === roomId) {
        const updatedComponents = room.components.map(comp => {
          if (comp.name === componentName) {
            return { ...comp, isOff: !comp.isOff };
          }
          return comp;
        });
        const newPower = updatedComponents.reduce((sum, c) => sum + (c.isOff ? 0 : c.power), 0);
        let newStatus = 'normal';
        if (newPower > 4500) newStatus = 'danger';
        else if (newPower > 3500) newStatus = 'warning';
        return { ...room, components: updatedComponents, power: newPower, status: newStatus };
      }
      return room;
    }));
  };

  // Toggle alert power cutoff
  const toggleAlertPower = (alertId) => {
    setAlertsData(prev => prev.map(alert => {
      if (alert.id === alertId) {
        return { ...alert, isOff: !alert.isOff };
      }
      return alert;
    }));
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
        const total = Math.round(newWattage);
        newData.push({
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          wattage: total,
        });
        return newData;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Handle Chatbot messages using Gemini API
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const newUserMsg = { id: Date.now(), type: 'user', text: chatInput };
    setChatMessages(prev => [...prev, newUserMsg]);
    setChatInput('');
    setIsTyping(true);

    // Prepare real-time context for the AI
    const currentWattage = wattageData[wattageData.length - 1]?.wattage || 0;
    const currentTemp = weatherData?.external_temp || 'Unknown';
    const preCooling = weatherData?.pre_cooling ? 'Active' : 'Inactive';
    const activeAlerts = alertsData.length > 0 
      ? alertsData.map(a => `${a.room}: ${a.component} at ${a.isOff ? 0 : a.power}W (${a.severity})`).join('; ') 
      : 'None';
    const highRooms = roomsData.map(r => `${r.name} (${r.power}W)`).join(', ');

    const systemInstructionText = `You are an Operations AI Chatbot for a building's thermal grid management system. Provide concise, helpful answers. Use plain text without markdown formatting.

Current Real-Time System Data:
- Total Building Load: ${currentWattage} W
- External Temperature: ${currentTemp}°C
- Pre-cooling Status: ${preCooling}
- Active Fire/Safety Alerts: ${activeAlerts}
- Monitored Rooms: ${highRooms}

Use this data to answer the user's questions accurately as if you are monitoring the live system.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCJwKQHEsAIygLbhs6Ru5Mvh-jdawD4_jQ`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          systemInstruction: {
            parts: [{ text: systemInstructionText }]
          },
          contents: [{ role: "user", parts: [{ text: chatInput }] }] 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch response from Gemini');
      }

      if (data.candidates && data.candidates.length > 0) {
        const aiText = data.candidates[0].content.parts[0].text;
        const newAiMsg = { id: Date.now() + 1, type: 'ai', text: aiText };
        setChatMessages(prev => [...prev, newAiMsg]);
      } else {
        throw new Error('No valid response from Gemini');
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      const errorMsg = { id: Date.now() + 1, type: 'ai', text: `Error: ${error.message}` };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const UPPER_THRESHOLD = 35000;
  const LOWER_THRESHOLD = 22000;

  return (
    <div style={styles.pageWrapper}>
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
                {roomsData.map(room => (
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
                        <span style={{ color: comp.isOff ? '#94a3b8' : '#1e293b', textDecoration: comp.isOff ? 'line-through' : 'none' }}>
                          {comp.name}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{...styles.componentPower, color: comp.isOff ? '#94a3b8' : '#0d9488'}}>
                            {comp.isOff ? 0 : comp.power}W
                          </span>
                          <button 
                            style={{...styles.cutoffButton, backgroundColor: comp.isOff ? '#10b981' : '#dc2626'}}
                            onClick={() => toggleComponentPower(room.id, comp.name)}
                          >
                            {comp.isOff ? 'Turn On' : 'Cutoff'}
                          </button>
                        </div>
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
              {alertsData.length > 0 ? (
                <div style={styles.alertList}>
                  {alertsData.map(alert => (
                    <div key={alert.id} style={{
                      ...styles.alertItem,
                      borderLeft: alert.isOff ? '4px solid #10b981' : (alert.severity === 'critical' ? '4px solid #dc2626' : '4px solid #f59e0b')
                    }}>
                      <div style={styles.alertInfo}>
                        <span style={{...styles.alertRoom, textDecoration: alert.isOff ? 'line-through' : 'none', color: alert.isOff ? '#94a3b8' : '#1e293b'}}>{alert.room}</span>
                        <span style={{...styles.alertComponent, textDecoration: alert.isOff ? 'line-through' : 'none'}}>{alert.component}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={styles.alertPower}>
                          <span style={{color: alert.isOff ? '#94a3b8' : '#dc2626', fontWeight: '700'}}>{alert.isOff ? 0 : alert.power}W</span>
                          <span style={styles.alertThreshold}>/ {alert.threshold}W threshold</span>
                        </div>
                        <button 
                          style={{...styles.cutoffButton, backgroundColor: alert.isOff ? '#10b981' : '#dc2626'}}
                          onClick={() => toggleAlertPower(alert.id)}
                        >
                          {alert.isOff ? 'Turn On' : 'Cutoff'}
                        </button>
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
            {/* Appliance Condition Summary Box */}
            <div style={styles.summaryCard}>
              <div style={{...styles.cardHeader, borderBottom: '1px solid #fde68a', marginBottom: '12px', paddingBottom: '8px'}}>
                <h2 style={{...styles.cardTitle, color: '#b45309'}}>Appliance Condition Summary</h2>
              </div>
              <div style={styles.summaryText}>
                <div style={{marginBottom: '8px'}}><strong>⚠️ System AI Assessment:</strong></div>
                {alertsData.length > 0 ? alertsData.map(alert => (
                  <div key={alert.id} style={{marginBottom: '6px'}}>
                    • <strong>{alert.room} ({alert.component}):</strong> Power draw at {alert.isOff ? 0 : alert.power}W {alert.isOff ? 'has been cut off.' : (alert.severity === 'critical' ? 'exceeds safe limit. Immediate shutdown recommended to prevent fire hazard.' : 'is elevated. Inspect connected devices.')}
                  </div>
                )) : (
                  <div style={{marginBottom: '6px'}}>• All appliances are operating safely.</div>
                )}
                <div style={{marginTop: '8px'}}>• <strong>Overall Status:</strong> Other tracked HVAC and lighting systems are within normal parameters.</div>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>Operations AI Chatbot</h2>
              </div>
              <div style={styles.chatContainer}>
                {chatMessages.map(msg => (
                  <div key={msg.id} style={{...styles.chatMessage, backgroundColor: msg.type === 'user' ? '#f1f5f9' : '#f8fafc'}}>
                    <div style={{...styles.chatIcon, backgroundColor: msg.type === 'user' ? '#0d9488' : '#7c3aed'}}>
                      {msg.type === 'user' ? 'U' : 'AI'}
                    </div>
                    <div style={styles.chatText}>{msg.text}</div>
                  </div>
                ))}
                {isTyping && (
                  <div style={styles.chatMessage}>
                    <div style={styles.chatIcon}>AI</div>
                    <div style={styles.chatText}>Typing...</div>
                  </div>
                )}
              <div ref={chatEndRef} />
              </div>
              
              <div style={styles.promptContainer}>
                {recommendedPrompts.map((prompt, idx) => (
                  <button 
                    key={idx} 
                    style={styles.promptPill}
                    onClick={() => setChatInput(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <div style={styles.chatInput}>
                <input 
                  type="text" 
                  placeholder="Ask about operations..." 
                  style={styles.input} 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button style={styles.sendButton} onClick={handleSendMessage} disabled={isTyping}>
                  {isTyping ? '...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    backgroundColor: '#f1f5f9', // Clean off-white outer framing
    padding: '32px',
    minHeight: '100vh',
    boxSizing: 'border-box',
  },
  container: {
    backgroundColor: '#f8fafc',
    borderRadius: '24px',
    maxWidth: '1600px',
    margin: '0 auto',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
    minHeight: 'calc(100vh - 64px)',
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
  cutoffButton: {
    padding: '4px 8px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 'bold',
    color: '#fff',
    cursor: 'pointer',
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
  summaryCard: {
    backgroundColor: '#fffbeb',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.15)',
    border: '1px solid #fcd34d',
  },
  summaryText: {
    fontSize: '13px',
    color: '#92400e',
    lineHeight: '1.5',
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
  promptContainer: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '12px',
  },
  promptPill: {
    padding: '6px 12px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    fontSize: '12px',
    color: '#475569',
    cursor: 'pointer',
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