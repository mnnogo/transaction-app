// === ИМПОРТЫ И НАСТРОЙКИ ===
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

const dbPath = join(__dirname, '../data/database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Ошибка подключения к базе:', err.message);
    else console.log('Подключено к SQLite');
});

function getAccountById(accountId, callback) {
    db.get('SELECT current_balance, type, user_id FROM accounts WHERE account_id = ?', [accountId], callback);
}

function checkDebitAccountBalance(balance, amount) {
    return balance < amount;
}

function checkCreditAccountLimit(balance, amount) {
    return (balance - amount) < -100000;
}

function hasProblematicCreditAccount(userId, callback) {
    db.get(`
        SELECT 1 FROM accounts 
        WHERE user_id = ? AND type = 'Кредитный' AND current_balance < -20000
        LIMIT 1
    `, [userId], (err, row) => {
        if (err) return callback(err, null);
        callback(null, !!row);
    });
}

// информация о пользователе
app.get('/api/user', (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email не указан' });

    db.get(`SELECT username, email, phone, gender, photo FROM users WHERE email = ?`, [email], (err, row) => {
        if (err) return res.status(500).json({ error: 'Ошибка при получении данных пользователя' });
        if (!row) return res.status(404).json({ error: 'Пользователь не найден' });
        res.json(row);
    });
});

// получение транзакций
app.get('/api/transactions', (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email не указан' });

    const sql = `
        SELECT t.from_account, t.to_account, t.transaction_date, t.sum
        FROM transactions t
        JOIN accounts a1 ON t.from_account = a1.account_id
        JOIN accounts a2 ON t.to_account = a2.account_id
        JOIN users u ON u.user_id = a1.user_id OR u.user_id = a2.user_id
        WHERE u.email = ?
        ORDER BY t.transaction_date DESC
    `;

    db.all(sql, [email], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Ошибка при получении транзакций' });
        res.json(rows);
    });
});

// получение счетов
app.get('/api/accounts', (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email не указан' });

    const sql = `
        SELECT a.account_id, a.account_name, a.type, a.current_balance, a.income, a.expense
        FROM accounts a
        JOIN users u ON a.user_id = u.user_id
        WHERE u.email = ?
    `;

    db.all(sql, [email], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Ошибка при получении счетов' });
        res.json(rows);
    });
});

// вход
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Необходимо указать email и password' });

    db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
        if (err) return res.status(500).json({ error: 'Ошибка при проверке учетных данных' });
        if (!row) return res.status(401).json({ error: 'Неверные учетные данные' });
        res.status(200).json({ message: 'Успешный вход в систему' });
    });
});

// перевод денег
app.post('/api/transfer', (req, res) => {
    const { fromAccountId, toAccountId, amount } = req.body;

    if (!fromAccountId || !toAccountId || amount === undefined || amount === null) {
        return res.status(400).json({ error: 'Необходимо указать все параметры' });
    }

    if (fromAccountId === toAccountId) {
        return res.status(400).json({ error: 'Счет отправителя и получателя не могут быть одинаковыми' });
    }

    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Сумма должна быть положительным числом' });
    }

    db.run('BEGIN TRANSACTION');

    // получаем счёт отправителя
    getAccountById(fromAccountId, (err, senderRow) => {
        if (err || !senderRow) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Ошибка при проверке счёта отправителя' });
        }

        const { type: senderType, current_balance: senderBalance, user_id: userId } = senderRow;

        // Проверяем баланс
        if (senderType === 'Дебетовый' && checkDebitAccountBalance(senderBalance, amount)) {
            db.run('ROLLBACK');
            return res.status(400).json({ error: 'Недостаточно средств на дебетовом счёте' });
        }

        if (senderType === 'Кредитный' && checkCreditAccountLimit(senderBalance, amount)) {
            db.run('ROLLBACK');
            return res.status(400).json({ error: 'Превышен лимит кредитного счёта' });
        }

        // Проверяем, что оба аккаунта существуют
        db.get('SELECT 1 FROM accounts WHERE account_id = ?', [fromAccountId], (err, fromExists) => {
            if (err || !fromExists) {
                db.run('ROLLBACK');
                return res.status(404).json({ error: 'Счет отправителя не найден' });
            }

            db.get('SELECT type FROM accounts WHERE account_id = ?', [toAccountId], (err, toAccount) => {
                if (err || !toAccount) {
                    db.run('ROLLBACK');
                    return res.status(404).json({ error: 'Счет получателя не найден' });
                }

                // Если отправитель - дебетовый счёт и получатель НЕ кредитный, проверяем ограничение
                if (senderType === 'Дебетовый' && toAccount.type !== 'Кредитный') {
                    hasProblematicCreditAccount(userId, (err, hasBadCredit) => {
                        if (err) {
                            db.run('ROLLBACK');
                            return res.status(500).json({ error: 'Ошибка при проверке кредитного счёта' });
                        }
                        if (hasBadCredit) {
                            db.run('ROLLBACK');
                            return res.status(403).json({
                                error: 'Операция запрещена: у вас есть кредитный счёт с задолженностью более 20 000₽'
                            });
                        }
                        performTransfer();
                    });
                } else {
                    performTransfer();
                }
            });
        });

        function performTransfer() {
            // Выполняем перевод
            db.run(
                'INSERT INTO transactions (from_account, to_account, sum, transaction_date) VALUES (?, ?, ?, ?)',
                [fromAccountId, toAccountId, amount, new Date().toISOString()],
                function (err) {
                    if (err) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ error: 'Ошибка при создании перевода' });
                    }

                    db.run('UPDATE accounts SET current_balance = current_balance - ?, expense = expense + ? WHERE account_id = ?', 
                        [amount, amount, fromAccountId]);
                    db.run('UPDATE accounts SET current_balance = current_balance + ?, income = income + ? WHERE account_id = ?', 
                        [amount, amount, toAccountId]);

                    db.run('COMMIT');
                    return res.status(200).json({ message: 'Перевод выполнен успешно' });
                }
            );
        }
    });
});

// добавление нового счёта
app.post('/api/accounts/add', (req, res) => {
    const { email, accountName, accountType } = req.body;

    if (!email || !accountName || !accountType) {
        return res.status(400).json({ error: 'Необходимо указать email, название счёта и тип счёта' });
    }

    if (!['debit', 'credit'].includes(accountType)) {
        return res.status(400).json({ error: 'Недопустимый тип счёта. Допустимые значения: debit, credit' });
    }

    db.run('BEGIN TRANSACTION');

    // находим user_id по email
    db.get('SELECT user_id FROM users WHERE email = ?', [email], (err, user) => {
        if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Ошибка при поиске пользователя' });
        }

        if (!user) {
            db.run('ROLLBACK');
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        // создаём новый счёт
        db.run(
            `INSERT INTO accounts (user_id, account_name, type, current_balance, income, expense)
             VALUES (?, ?, ?, 0, 0, 0)`,
            [user.user_id, accountName, accountType],
            function (err) {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: 'Ошибка при создании счёта' });
                }

                // получаем данные созданного счёта для ответа
                db.get(
                    `SELECT account_id, account_name, type, current_balance, income, expense 
                     FROM accounts 
                     WHERE rowid = ?`,
                    [this.lastID],
                    (err, newAccount) => {
                        if (err) {
                            db.run('ROLLBACK');
                            return res.status(500).json({ error: 'Ошибка при получении данных нового счёта' });
                        }

                        db.run('COMMIT');
                        res.status(201).json({
                            message: 'Счёт успешно создан',
                            account: newAccount
                        });
                    }
                );
            }
        );
    });
});

app.post('/api/accounts/deposit', (req, res) => {
    const { accountId, amount } = req.body;

    if (!accountId || amount === undefined || amount === null) {
        return res.status(400).json({ error: 'Необходимо указать accountId и amount' });
    }

    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Сумма должна быть положительным числом' });
    }

    db.run('BEGIN TRANSACTION');

    db.get(
        `SELECT a.*, u.email 
         FROM accounts a
         JOIN users u ON a.user_id = u.user_id
         WHERE a.account_id = ?`,
        [accountId],
        (err, account) => {
            if (err || !account) {
                db.run('ROLLBACK');
                return res.status(404).json({ error: 'Счет не найден' });
            }

            let bonus = 0;
            if (account.type === 'Дебетовый' && amount > 1000000) {
                bonus = 2000;
            }

            db.run(
                `UPDATE accounts 
                 SET current_balance = current_balance + ?,
                     income = income + ?
                 WHERE account_id = ?`,
                [amount + bonus, amount + bonus, accountId],
                function (err) {
                    if (err) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ error: 'Ошибка при пополнении счета' });
                    }

                    db.run(
                        `INSERT INTO transactions (from_account, to_account, sum, transaction_date)
                         VALUES (?, ?, ?, ?)`,
                        [null, accountId, amount, new Date().toISOString()],
                        function (err) {
                            if (err) {
                                db.run('ROLLBACK');
                                return res.status(500).json({ error: 'Ошибка при записи транзакции' });
                            }

                            if (bonus > 0) {
                                db.run(
                                    `INSERT INTO transactions (from_account, to_account, sum, transaction_date, type)
                                     VALUES (?, ?, ?, ?, ?)`,
                                    [null, accountId, bonus, new Date().toISOString(), 'bonus'],
                                    function (err) {
                                        if (err) {
                                            db.run('ROLLBACK');
                                            return res.status(500).json({ error: 'Ошибка при записи бонусной транзакции' });
                                        }
                                        db.run('COMMIT');
                                        return res.status(200).json({ 
                                            message: 'Счет успешно пополнен',
                                            bonusApplied: bonus > 0,
                                            bonusAmount: bonus
                                        });
                                    }
                                );
                            } else {
                                db.run('COMMIT');
                                return res.status(200).json({ message: 'Счет успешно пополнен' });
                            }
                        }
                    );
                }
            );
        }
    );
});

app.post('/api/accounts/withdraw', (req, res) => {
    const { accountId, amount } = req.body;

    if (!accountId || amount === undefined || amount === null) {
        return res.status(400).json({ error: 'Необходимо указать accountId и amount' });
    }

    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Сумма должна быть положительным числом' });
    }

    if (amount > 30000) {
        return res.status(400).json({ error: 'Нельзя снимать более 30 000 за одну операцию' });
    }

    db.run('BEGIN TRANSACTION');

    db.get(
        `SELECT a.*, u.user_id 
         FROM accounts a
         JOIN users u ON a.user_id = u.user_id
         WHERE a.account_id = ?`,
        [accountId],
        (err, account) => {
            if (err || !account) {
                db.run('ROLLBACK');
                return res.status(404).json({ error: 'Счет не найден' });
            }

            if (account.type === 'Дебетовый' && account.current_balance < amount) {
                db.run('ROLLBACK');
                return res.status(400).json({ error: 'Недостаточно средств на счете' });
            }

            if (account.type === 'Кредитный' && (account.current_balance - amount) < -100000) {
                db.run('ROLLBACK');
                return res.status(400).json({ error: 'Превышен лимит кредитного счета' });
            }

            if (account.type === 'Дебетовый') {
                hasProblematicCreditAccount(account.user_id, (err, hasBadCredit) => {
                    if (err) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ error: 'Ошибка при проверке кредитных счетов' });
                    }
                    if (hasBadCredit) {
                        db.run('ROLLBACK');
                        return res.status(403).json({
                            error: 'Операция запрещена: у вас есть кредитный счёт с задолженностью более 20 000₽'
                        });
                    }
                    performWithdrawal();
                });
            } else {
                performWithdrawal();
            }
        }
    );

    function performWithdrawal() {
        db.run(
            `UPDATE accounts 
             SET current_balance = current_balance - ?,
                 expense = expense + ?
             WHERE account_id = ?`,
            [amount, amount, accountId],
            function (err) {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: 'Ошибка при снятии средств' });
                }

                db.run(
                    `INSERT INTO transactions (from_account, to_account, sum, transaction_date)
                     VALUES (?, ?, ?, ?)`,
                    [accountId, null, amount, new Date().toISOString()],
                    function (err) {
                        if (err) {
                            db.run('ROLLBACK');
                            return res.status(500).json({ error: 'Ошибка при записи транзакции' });
                        }

                        db.run('COMMIT');
                        return res.status(200).json({ message: 'Средства успешно сняты' });
                    }
                );
            }
        );
    }
});

app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});