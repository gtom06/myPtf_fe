import React, { useState } from 'react';
import './index.css';


function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://host.docker.internal:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username,
          password,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.detail || 'Credenziali non valide');
        setLoading(false);
        return;
      }
      const data = await response.json();
      // Salva il token JWT se necessario (es: localStorage)
      localStorage.setItem('token', data.access_token);
      setLoading(false);
      if (onLogin) onLogin(username);
    } catch (err) {
      setError('Errore di connessione al server');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div className="error-message">{error}</div>}
        <button type="submit">Accedi</button>
      </form>
    </div>
  );
}

export default LoginPage;
