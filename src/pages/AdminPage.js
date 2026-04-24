import React from 'react';
import { useNavigate } from 'react-router-dom';


function AdminPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate('/')}>← Back</button>
        <span style={styles.badge}>Admin Portal</span>
      </div>
      <div style={styles.card}>
        <div style={styles.gridContainer}>
          {/* Top Left - Red */}
          <div style={styles.redBox}>
            <div style={styles.sectionTitle}></div>
            <p style={styles.redText}>
              Rooms HAving the highest power consumption with a button<br />
              leading to then camera in the room and a button which gives the<br />
              list of components having the highest power useage (like<br />
              AC/Cooler/outlet)
            </p>
            <div style={{marginTop: 12}}>
              <button style={styles.actionButton}>View Camera</button>
              <button style={styles.actionButton}>Show Components</button>
            </div>
          </div>
          {/* Top Right - Dark Red */}
          <div style={styles.dangerBox}>
            <div style={styles.sectionTitle}></div>
            <p style={styles.dangerText}>
              Any room which may show a dagerous amout of power being<br />
              supplied to a single component which may be a fire hazard<br />
              otherwise show no component under danger
            </p>
          </div>
          {/* Middle - Black */}
          <div style={styles.graphBox}>
            <div style={styles.sectionTitle}></div>
            <p style={styles.graphText}>
              Area for a real time graph providing the total wattage useage By the building which consist<br />
              of two threshold limit the upper threshold bing the time when the auto switching of the<br />
              renewable energy to the fossil enegy and the lower threshold being when to auto cool the<br />
              building
            </p>
            <div style={styles.graphPlaceholder}>[Graph Placeholder]</div>
          </div>
          {/* Middle Right - Yellow */}
          <div style={styles.summaryBox}>
            <div style={styles.sectionTitle}></div>
            <p style={styles.summaryText}>
              a space for a a summary given by a chatbot whcih tells exactly<br />
              what to do when the components are under stress os haven been<br />
              dmanged
            </p>
          </div>
          {/* Bottom - Blue */}
          <div style={styles.blueBox}>
            <span style={styles.blueText}>
              I shows the basic idea as given in the student sections
            </span>
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
  badge: {
    padding: '6px 16px',
    backgroundColor: '#059669',
    color: '#fff',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '2fr 1.2fr',
    gridTemplateRows: '180px 1.5fr 120px',
    gap: '18px',
    gridTemplateAreas: `
      "red danger"
      "graph summary"
      "blue blue"
    `,
    minHeight: '600px',
  },
  redBox: {
    gridArea: 'red',
    border: '3px solid #e11d48',
    borderRadius: '12px',
    padding: '18px',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  redText: {
    color: '#e11d48',
    fontWeight: 500,
    marginBottom: 8,
  },
  actionButton: {
    marginRight: 10,
    padding: '7px 18px',
    background: '#e11d48',
    color: '#fff',
    border: 'none',
    borderRadius: '7px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  dangerBox: {
    gridArea: 'danger',
    border: '3px solid #b91c1c',
    borderRadius: '12px',
    padding: '18px',
    background: '#fff',
  },
  dangerText: {
    color: '#b91c1c',
    fontWeight: 500,
  },
  graphBox: {
    gridArea: 'graph',
    border: '3px solid #222',
    borderRadius: '12px',
    padding: '18px',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  graphText: {
    color: '#222',
    fontWeight: 500,
    marginBottom: 10,
  },
  graphPlaceholder: {
    background: '#f3f4f6',
    border: '2px dashed #222',
    borderRadius: '8px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#222',
    fontWeight: 600,
    fontSize: '1.1rem',
  },
  summaryBox: {
    gridArea: 'summary',
    border: '3px solid #fde047',
    borderRadius: '12px',
    padding: '18px',
    background: '#fff',
  },
  summaryText: {
    color: '#222',
    fontWeight: 500,
  },
  blueBox: {
    gridArea: 'blue',
    border: '3px solid #2563eb',
    borderRadius: '12px',
    padding: '18px',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blueText: {
    color: '#2563eb',
    fontWeight: 600,
    fontSize: '1.1rem',
  },
  sectionTitle: {
    fontWeight: 700,
    fontSize: '1.1rem',
    marginBottom: 6,
  },
};

export default AdminPage;