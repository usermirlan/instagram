# MikoSocial — Продакшнга чыгаруу (Deployment) боюнча толук колдонмо 🚀

Бул колдонмо **MikoSocial** платформасын каалаган Linux VPS серверге (Ubuntu 22.04 / 24.04 LTS, DigitalOcean, Hetzner, AWS, Selectel ж.б.) Docker жана Nginx аркылуу ишке киргизүү үчүн даярдалган.

---

## 🏗️ Продакшн Архитектурасы

Система 5 көз карандысыз Docker контейнерлеринен турат:
1. **`db`** — PostgreSQL 15 (Туруктуу маалыматтар базасы).
2. **`redis`** — Redis 7 Alpine (WebSocket каналдары жана кэш).
3. **`backend`** — Django + Daphne ASGI сервери (Python 3.11).
4. **`frontend`** — React SPA (Vite + Nginx аркылуу компиляцияланган статикалык файлдар).
5. **`nginx`** — Негизги Gateway/Reverse Proxy (SSL/HTTPS, Gzip, Media/Static файлдарды таратуу).

---

## 1-кадам: Жаңы серверди даярдоо (Ubuntu VPS)

Серверге SSH аркылуу кирип, системаны жаңылаңыз жана Docker орнотуңуз:

```bash
# Системаны жаңыртуу
sudo apt update && sudo apt upgrade -y

# Керектүү куралдарды орнотуу
sudo apt install -y curl git ufw

# Docker & Docker Compose орнотуу
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Колдонуучуга docker укугун берүү
sudo usermod -aG docker $USER
newgrp docker
```

Файрволду (UFW) конфигурациялоо:
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 2-кадам: Долбоорду серверге жүктөө

Долбоорду Git аркылуу серверге жүктөңүз:

```bash
cd /var/www
git clone <СИЗДИН_РЕПОЗИТОРИЙ_URL> social
cd social
```

---

## 3-кадам: Айлана-чөйрөнү (.env) конфигурациялоо

Серверде `.env` файлын түзүп, коопсуз сыр сөздөрдү жазыңыз:

```bash
nano .env
```

Файлдын ичине төмөнкү маалыматтарды толтуруңуз:
```env
# Коопсуздук
SECRET_KEY=чыныгы_жашыруун_узун_кокус_ачкыч_жазыныз_2026_xyz!
DOMAIN=сиздин-домениңиз.com

# PostgreSQL Базасы
DB_NAME=mikosocial
DB_USER=miko_admin
DB_PASSWORD=абдан_күчтүү_сыр_сөз_жазыңыз_!@#

# Башка
DB_ENGINE=postgresql
```

---

## 4-кадам: Долбоорду Docker аркылуу иштетүү

Бардык 5 контейнерди автоматтык түрдө куруп, фондо (detached) иштетиңиз:

```bash
docker compose up -d --build
```

Контейнерлердин иштешин текшерүү:
```bash
docker compose ps
```

---

## 5-кадам: Башкы Администраторду (Superuser) түзүү

Django админ-панелине кирүү үчүн супер-колдонуучу түзүңүз:

```bash
docker compose exec backend python manage.py createsuperuser
```
*(Терминалдан логин, email жана сыр сөздү жазыңыз)*

---

## 6-кадам: Акысыз SSL (HTTPS) сертификатын орнотуу (Let's Encrypt)

Домениңизге коопсуз жашыл кулпу (HTTPS) орнотуу үчүн:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d сиздин-домениңиз.com
```

---

## 🛠️ Пайдалуу командалар (Тейлөө жана Мониторинг)

* **Логдорду реалдуу убакытта көрүү**:
  ```bash
  docker compose logs -f
  # же backend гана:
  docker compose logs -f backend
  ```

* **Контейнерлерди кайра иштетүү**:
  ```bash
  docker compose restart
  ```

* **Контейнерлерди токтотуу**:
  ```bash
  docker compose down
  ```

* **Маалыматтар базасынын резервдик көчүрмөсүн алуу (Backup)**:
  ```bash
  docker compose exec db pg_dump -U postgres mikosocial > backup_$(date +%F).sql
  ```

---

Куттуктайбыз! **MikoSocial** сервериңизде туруктуу, ылдам жана коопсуз иштеп жатат! 🚀
