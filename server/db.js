import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../data/database.db');
const db = new sqlite3.Database(dbPath);

export const getUserInfo = (email) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT username, email, phone, gender, photo FROM users WHERE email = ?`, [email], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

export const getUserTransactions = (email) => {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT 
                CASE 
                    WHEN t.from_account = a1.account_id THEN a2.account_id
                    ELSE a1.account_id
                END as account,
                t.transaction_date,
                CASE 
                    WHEN t.from_account = a1.account_id THEN -t.sum
                    ELSE t.sum
                END as sum
            FROM transactions t
            JOIN accounts a1 ON t.from_account = a1.account_id
            JOIN accounts a2 ON t.to_account = a2.account_id
            JOIN users u ON u.user_id = a1.user_id OR u.user_id = a2.user_id
            WHERE u.email = ?
            ORDER BY t.transaction_date DESC
        `, [email], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

export class Account {
    constructor(id, name, currentBalance, income, expense) {
        this.id = id;
        this.name = name;
        this.currentBalance = currentBalance;
        this.income = income;
        this.expense = expense;
    }
}

export const getUserAccounts = (email) => {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT 
                a.account_id as id,
                u.username as name,
                a.current_balance,
                a.income,
                a.expense
            FROM accounts a
            JOIN users u ON a.user_id = u.user_id
            WHERE u.email = ?
        `, [email], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                // преобразуем строки из БД в объекты класса Account
                const accounts = rows.map(row => new Account(
                    row.id,
                    row.name,
                    row.current_balance,
                    row.income,
                    row.expense
                ));
                resolve(accounts);
            }
        });
    });
}; 