import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// подключение к базе данных
const dbPath = join(__dirname, '../data/database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
    } else {
        console.log('Подключено к базе данных SQLite');
    }
});

// получение информации о пользователе
app.get('/api/user', (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ error: 'Email не указан' });
    }

    db.get(`
        SELECT 
            username,
            email,
            phone,
            gender,
            photo
        FROM users 
        WHERE email = ?
    `, [email], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при получении данных пользователя' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        res.json(row);
    });
});

// получение транзакций пользователя
app.get('/api/transactions', (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ error: 'Email не указан' });
    }

    db.all(`
        SELECT t.from_account, t.to_account, t.transaction_date, t.sum
        FROM transactions t
        JOIN accounts a1 ON t.from_account = a1.account_id
        JOIN accounts a2 ON t.to_account = a2.account_id
        JOIN users u ON u.user_id = a1.user_id OR u.user_id = a2.user_id
        WHERE u.email = ?
        ORDER BY t.transaction_date DESC
    `, [email], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при получении транзакций' });
        }
        res.json(rows);
    });
});

// получение счетов пользователя
app.get('/api/accounts', (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ error: 'Email не указан' });
    }

    db.all(`
        SELECT 
            a.account_id as id,
            a.account_name,
            a.current_balance,
            a.income,
            a.expense
        FROM accounts a
        JOIN users u ON a.user_id = u.user_id
        WHERE u.email = ?
    `, [email], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при получении счетов: ' + err });
        }
        res.json(rows);
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // проверяем наличие всех параметров
    if (!email || !password) {
        return res.status(400).json({ 
            error: 'Необходимо указать email и password' 
        });
    }

    // проверяем учетные данные
    db.get('SELECT * FROM users WHERE email = ? AND password = ?', 
        [email, password], 
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка при проверке учетных данных' });
            }

            if (!row) {
                return res.status(401).json({ error: 'Неверные учетные данные' });
            }

            res.status(200).json({
                message: 'Успешный вход в систему'
            });
        }
    );
});

// эндпоинт для перевода денег
app.post('/api/transfer', (req, res) => {
    const { fromAccountId, toAccountId, amount } = req.body;

    // проверяем наличие всех параметров
    if (!fromAccountId || !toAccountId || amount === undefined || amount === null) {
        return res.status(400).json({ 
            error: 'Необходимо указать все параметры' 
        });
    }

    // проверяем что счет отправителя и счет получателя не одинаковые
    if (fromAccountId === toAccountId) {
        return res.status(400).json({ 
            error: 'Счет отправителя и счет получателя не могут быть одинаковыми' 
        });
    }

    // проверяем что amount - число и больше 0
    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ 
            error: 'Сумма перевода должна быть положительным числом' 
        });
    }

    try {
        db.run('BEGIN TRANSACTION');

        // проверяем существование обоих аккаунтов
        db.get('SELECT account_id FROM accounts WHERE account_id = ?', [fromAccountId], (err, fromAccount) => {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Ошибка при проверке счета отправителя' });
            }

            if (!fromAccount) {
                db.run('ROLLBACK');
                return res.status(404).json({ error: 'Счет отправителя не найден' });
            }

            db.get('SELECT account_id FROM accounts WHERE account_id = ?', [toAccountId], (err, toAccount) => {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: 'Ошибка при проверке счета получателя' });
                }

                if (!toAccount) {
                    db.run('ROLLBACK');
                    return res.status(404).json({ error: 'Счет получателя не найден' });
                }

                // проверяем баланс отправителя
                db.get('SELECT current_balance FROM accounts WHERE account_id = ?', [fromAccountId], (err, row) => {
                    if (err) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ error: 'Ошибка при проверке баланса' });
                    }

                    if (!row || row.current_balance < amount) {
                        db.run('ROLLBACK');
                        return res.status(400).json({ error: 'Недостаточно средств' });
                    }

                    // выполняем перевод
                    db.run(
                        'INSERT INTO transactions (from_account, to_account, sum, transaction_date) VALUES (?, ?, ?, ?)',
                        [fromAccountId, toAccountId, amount, new Date().toISOString()],
                        function(err) {
                            if (err) {
                                db.run('ROLLBACK');
                                return res.status(500).json({ error: 'Ошибка при создании перевода.' });
                            }

                            // обновляем балансы, приходы и расходы
                            db.run('UPDATE accounts SET current_balance = current_balance - ?, expense = expense + ? WHERE account_id = ?', [amount, amount, fromAccountId]);
                            db.run('UPDATE accounts SET current_balance = current_balance + ?, income = income + ? WHERE account_id = ?', [amount, amount, toAccountId]);

                            // завершаем транзакцию
                            db.run('COMMIT');
                            res.status(200).json({ 
                                message: 'Перевод выполнен успешно'
                            });
                        }
                    );
                });
            });
        });
    } catch (error) {
        db.run('ROLLBACK');
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
}); 