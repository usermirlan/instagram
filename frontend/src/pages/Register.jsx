import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: null }));
    }
    if (generalError) setGeneralError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.password2) {
      setErrors({ password2: 'Сыр сөздөр дал келген жок.' });
      return;
    }

    try {
      setIsLoading(true);
      setErrors({});
      setGeneralError('');

      await register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        password: formData.password,
        password2: formData.password2,
      });

      navigate('/', { replace: true });
    } catch (err) {
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'object' && !data.detail) {
          setErrors(data);
        } else {
          setGeneralError(data.detail || 'Каттоо учурунда ката кетти.');
        }
      } else {
        setGeneralError('Сервер менен байланыш жок. Кайра аракет кылыңыз.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: '480px' }}>
        <div className="auth-header">
          <div className="auth-logo-badge">M</div>
          <h1 className="auth-title">MikoSocial</h1>
          <p className="auth-subtitle">Жаңы аккаунт түзүп, досторуңуз менен байланышыңыз.</p>
        </div>

        {generalError && <div className="alert-error">{generalError}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="reg-username">Колдонуучу аты (Username) *</label>
            <input
              id="reg-username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="azamat_99"
              className="form-input"
              required
              autoComplete="username"
            />
            {errors.username && <span className="field-error">{errors.username[0] || errors.username}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email *</label>
            <input
              id="reg-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="azamat@example.com"
              className="form-input"
              required
              autoComplete="email"
            />
            {errors.email && <span className="field-error">{errors.email[0] || errors.email}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-fname">Атыңыз</label>
              <input
                id="reg-fname"
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Азамат"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-lname">Фамилияңыз</label>
              <input
                id="reg-lname"
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Асанов"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Сыр сөз *</label>
            <input
              id="reg-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Мисалы: 8 символдон ашык"
              className="form-input"
              required
              autoComplete="new-password"
            />
            {errors.password && <span className="field-error">{errors.password[0] || errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password2">Сыр сөздү тастыктаңыз *</label>
            <input
              id="reg-password2"
              type="password"
              name="password2"
              value={formData.password2}
              onChange={handleChange}
              placeholder="Кайра жазыңыз"
              className="form-input"
              required
              autoComplete="new-password"
            />
            {errors.password2 && <span className="field-error">{errors.password2[0] || errors.password2}</span>}
          </div>

          <button
            type="submit"
            className="btn-primary auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Катталууда...' : 'Катталуу'}
          </button>
        </form>

        <div className="auth-footer">
          Аккаунтуңуз барбы?
          <Link to="/login" className="auth-link">Кирүү</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
