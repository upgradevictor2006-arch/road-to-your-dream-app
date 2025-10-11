# 🔧 Настройка DNS для road-to-your-dream-app.io

## GitHub Pages верификация домена

GitHub Pages требует добавить TXT запись для верификации владения доменом.

### 📋 Данные для настройки:

**Hostname (Имя записи):**
```
_github-pages-challenge-pozerof.road-to-your-dream-app.io
```

**Value (Значение):**
```
7762cff91efe5f82e2963f9418092e
```

**Type (Тип):**
```
TXT
```

## 🎯 Инструкции по настройке DNS

### Для популярных регистраторов доменов:

#### **Cloudflare**
1. Войдите в панель Cloudflare
2. Выберите домен `road-to-your-dream-app.io`
3. Перейдите в **DNS** → **Records**
4. Нажмите **Add record**
5. Заполните:
   - **Type**: `TXT`
   - **Name**: `_github-pages-challenge-pozerof`
   - **Content**: `7762cff91efe5f82e2963f9418092e`
   - **TTL**: `Auto` или `300`
6. Нажмите **Save**

#### **Namecheap**
1. Войдите в аккаунт Namecheap
2. Перейдите в **Domain List** → выберите домен
3. Нажмите **Manage** → **Advanced DNS**
4. В разделе **Host Records** нажмите **Add New Record**
5. Заполните:
   - **Type**: `TXT Record`
   - **Host**: `_github-pages-challenge-pozerof`
   - **Value**: `7762cff91efe5f82e2963f9418092e`
   - **TTL**: `5 min`
6. Нажмите **Save All Changes**

#### **GoDaddy**
1. Войдите в аккаунт GoDaddy
2. Перейдите в **My Products** → **DNS**
3. Нажмите **Add** → **TXT**
4. Заполните:
   - **Host**: `_github-pages-challenge-pozerof`
   - **TXT Value**: `7762cff91efe5f82e2963f9418092e`
   - **TTL**: `1 Hour`
5. Нажмите **Save**

#### **Reg.ru**
1. Войдите в личный кабинет Reg.ru
2. Перейдите в **Мои домены** → выберите домен
3. Нажмите **Управление DNS**
4. В разделе **DNS-записи** нажмите **Добавить запись**
5. Заполните:
   - **Тип**: `TXT`
   - **Поддомен**: `_github-pages-challenge-pozerof`
   - **Значение**: `7762cff91efe5f82e2963f9418092e`
   - **TTL**: `300`
6. Нажмите **Добавить запись**

#### **Другие регистраторы**
Общие принципы:
- **Тип записи**: TXT
- **Имя/Поддомен**: `_github-pages-challenge-pozerof`
- **Значение**: `7762cff91efe5f82e2963f9418092e`
- **TTL**: 300-3600 секунд

## ⏰ После настройки TXT записи

1. **Подождите распространения DNS** (5 минут - 24 часа)
2. **Вернитесь в GitHub Pages** и нажмите **Verify**
3. **После успешной верификации** добавьте A записи:
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```

## 🔍 Проверка настройки

Проверить TXT запись можно командой:
```bash
nslookup -type=TXT _github-pages-challenge-pozerof.road-to-your-dream-app.io
```

Или онлайн сервисами:
- https://dnschecker.org/
- https://www.whatsmydns.net/

## ⚠️ Важные моменты

- **TTL (Time To Live)**: Рекомендуется установить 300 секунд (5 минут) для быстрого обновления
- **Проверка**: DNS изменения могут распространяться до 24 часов
- **Формат**: Имя записи должно быть точно `_github-pages-challenge-pozerof` (без домена)
- **Пробелы**: Убедитесь, что в значении записи нет лишних пробелов

## 🎉 После успешной верификации

1. GitHub автоматически создаст файл `CNAME` в вашем репозитории
2. Включите **Enforce HTTPS** в настройках Pages
3. Ваш сайт будет доступен по адресу: `https://road-to-your-dream-app.io/`
