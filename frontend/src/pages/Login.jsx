import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password) {
      setError('Логин жана сыр сөздү жазыңыз.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await login(formData.username.trim(), formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      const detail = err.response?.data?.detail || 'Логин же сыр сөз туура эмес.';
      setError(detail);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-badge">M</div>
          <h1 className="auth-title">MikoSocial</h1>
          <p className="auth-subtitle">Кош келиңиз! Аккаунтуңузга кириңиз.</p>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="username">Колдонуучу аты (Username)</label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="мисалы: azamat"
              className="form-input"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Сыр сөз</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="form-input"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn-primary auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Текшерилүүдө...' : 'Кирүү'}
          </button>
        </form>

        <div className="auth-footer">
          Аккаунтуңуз жокпу?
          <Link to="/register" className="auth-link">Катталуу</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
