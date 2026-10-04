# MikoSocial — Заманбап Социалдык Түйүн Платформасы 🚀

![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-5-purple)
![Django](https://img.shields.io/badge/Django-4.2-green)
![DRF](https://img.shields.io/badge/Django_REST_Framework-3.14-red)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![Tests](https://img.shields.io/badge/Tests-22%20Passed-success)

**MikoSocial** — заманбап Instagram жана Threads стилиндеги, толук функционалдык full-stack социалдык медиа платформасы.

---

## 📸 Негизги өзгөчөлүктөрү

* 🔐 **Аутентификация**: JWT Access + Refresh токендери, Blacklisting, күчтүү сыр сөз валидациясы.
* 📷 **Посттор жана Сүрөттөр**: Сүрөттөрдү жүктөө, коштоочу тексттер (captions), өчүрүү укуктары.
* ❤️ **Лайктар жана Комментарийлер**: Интерактивдүү бир басуу менен лайк, комментарий жазуу.
* 👥 **Follow Тутуму**: Колдонуучуларга жазылуу/чыгуу, катталуучулардын жана катталгандардын толук тизмелери.
* 📰 **Жекечелештирилген Лента (Feed)**: Башкы бетте колдонуучу жазылган авторлордун гана жаңы посттору.
* 🔍 **Издөө жана Explore**: Колдонуучуларды жана постторду издөө, сунушталган колдонуучулар, фото-галерея тору.
* 💬 **Жеке Билдирүүлөр (Direct Chat)**: Реалдуу убакыттагы диалогдор, окулду/жөнөтүлдү статустары, окула элек каттардын эсептегичи.
* 🔔 **Билдирүүлөр (Notifications)**: Лайк, комментарий, жаңы жазылуучу келгендеги жандуу кызыл коңгуроо эсептегичи (live badge).
* 👤 **Профильди башкаруу**: Аватар жүктөө, Bio өзгөртүү, профилдин статистикасы.
* 📱 **Адаптивдүү Дизайн**: Компьютер, планшет жана мобилдик телефондорго 100% ылайыкташкан Glassmorphic Dark UI.

---

## 🛠️ Технологиялык стек

### Backend
* **Python 3.11**
* **Django 4.2 LTS** & **Django REST Framework**
* **Daphne ASGI** (WebSocket & HTTP)
* **PostgreSQL / SQLite**
* **JWT (SimpleJWT)**
* **Django Channels & Redis**

### Frontend
* **React 18**
* **Vite**
* **Vanilla CSS (Design Tokens & Glassmorphism)**
* **Axios** (JWT Interceptors менен)
* **React Router DOM 6**
* **React Icons**

---

## 💻 Локалдык түрдө иштетүү

### 1. Backend иштетүү:
```bash
cd backend
# Виртуалдык чөйрөнү активдештирүү
..\venv\Scripts\activate   # Windows
# Миграцияларды жүргүзүү
python manage.py migrate
# Серверди иштетүү
python manage.py runserver 0.0.0.0:8000
```

### 2. Frontend иштетүү:
```bash
cd frontend
npm install
npm run dev
```

Браузериңизден ачыңыз:
* Веб-колдонмо: `http://localhost:5173`
* Backend API: `http://localhost:8000/api/`
* Админ-панель: `http://localhost:8000/admin/`

---

## 🧪 Тесттерди жүргүзүү

Бэкэнддеги бардык 22 интеграциялык тестти текшерүү:
```bash
cd backend
python manage.py test apps.accounts apps.posts apps.follows apps.chat apps.notifications
```

---

## 🚢 Продакшн (Docker Deployment)

Серверге чыгаруу боюнча деталдуу колдонмо [DEPLOYMENT.md](DEPLOYMENT.md) файлында берилген.

Бир буйрук менен Docker аркылуу иштетүү:
```bash
docker compose up -d --build
```
