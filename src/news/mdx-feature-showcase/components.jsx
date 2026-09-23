import {useState} from 'react'

export const Counter = () => {
  const [count, setCount] = useState(0)
  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', marginTop: '1rem', marginBottom: '1rem' }}>
      <p>This is an interactive React component.</p>
      <p>Current count: <strong>{count}</strong></p>
      <button onClick={() => setCount(count + 1)} style={{ padding: '0.5rem 1rem', marginRight: '0.5rem', cursor: 'pointer' }}>Increment</button>
      <button onClick={() => setCount(0)} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Reset</button>
    </div>
  );
};

export const Note = ({ type = 'info', children }) => {
  const styles = {
    info: { backgroundColor: '#e0f7fa', borderColor: '#4dd0e1' },
    warning: { backgroundColor: '#fff3e0', borderColor: '#ffb74d' },
  };
  return (
    <div style={{
      padding: '1rem',
      borderLeft: `4px solid ${styles[type].borderColor}`,
      backgroundColor: styles[type].backgroundColor,
      margin: '1.5em 0',
      borderRadius: '4px',
    }}>
      {children}
    </div>
  );
};