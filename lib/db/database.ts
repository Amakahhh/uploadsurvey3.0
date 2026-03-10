import * as fs from 'fs';
import * as path from 'path';

interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isVerified: boolean;
  createdAt: string;
}

interface Survey {
  id: string;
  researcherId: string;
  title: string;
  description: string;
  googleFormUrl?: string;
  googleSheetUrl?: string;
  reward_per_response: number;
  estimated_time?: number;
  category?: string;
  target_colleges?: any;
  target_departments?: any;
  target_levels?: any;
  max_responses: number;
  current_responses: number;
  budget?: number;
  paid_amount?: number;
  status: string;
  is_active: number;
  created_at: string;
}

interface Database {
  users: Record<string, User>;
  surveys: Record<string, Survey>;
  wallets: Record<string, any>;
  ledger: any[];
  survey_responses: Record<string, any>;
  survey_sessions: Record<string, any>;
  korapay_transactions: Record<string, any>;
}

let db: Database | null = null;
const DB_PATH = path.join(process.cwd(), '.data', 'surveyhustler.json');

export async function initializeDatabase(): Promise<any> {
  if (db) return { exec, run, prepare: () => ({}) };

  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      db = JSON.parse(data);
    } else {
      db = createEmptyDatabase();
      saveDatabase();
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    db = createEmptyDatabase();
    saveDatabase();
  }

  return { exec, run };
}

function createEmptyDatabase(): Database {
  return {
    users: {},
    surveys: {},
    wallets: {},
    ledger: [],
    survey_responses: {},
    survey_sessions: {},
    korapay_transactions: {},
  };
}

export function saveDatabase() {
  if (!db) return;
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Failed to save database:', error);
  }
}

export function exec(sql: string, params: any[] = []) {
  if (!db) return [];

  // SELECT * FROM users WHERE email = ?
  if (sql.includes('SELECT * FROM users WHERE email')) {
    const email = params[0];
    const user = db.users[email];
    if (user) {
      return [{
        columns: ['id', 'email', 'password', 'firstName', 'lastName', 'roles', 'isVerified'],
        values: [[user.id, user.email, user.password, user.firstName, user.lastName, JSON.stringify(user.roles), user.isVerified ? 1 : 0]],
      }];
    }
    return [];
  }

  // SELECT * FROM surveys WHERE is_active = 1 AND status = 'active'
  if ((sql.includes('SELECT * FROM surveys WHERE is_active') || sql.includes('SELECT * FROM surveys WHERE status')) && !sql.includes('WHERE id')) {
    const surveys = Object.values(db.surveys).filter((s: any) => s.is_active === 1 && s.status === 'active');
    if (surveys.length) {
      return [{
        columns: ['id', 'researcherId', 'title', 'description', 'googleFormUrl', 'googleSheetUrl', 'reward_per_response', 'estimated_time', 'category', 'target_colleges', 'target_departments', 'target_levels', 'max_responses', 'current_responses', 'budget', 'status', 'is_active', 'created_at'],
        values: surveys.map((s: any) => [s.id, s.researcherId, s.title, s.description, s.googleFormUrl, s.googleSheetUrl, s.reward_per_response, s.estimated_time, s.category, JSON.stringify(s.target_colleges || []), JSON.stringify(s.target_departments || []), JSON.stringify(s.target_levels || []), s.max_responses, s.current_responses, s.budget, s.status, s.is_active, s.created_at]),
      }];
    }
    return [];
  }

  // SELECT * FROM surveys WHERE id = ? AND is_active = 1
  if (sql.includes('SELECT * FROM surveys WHERE id') && sql.includes('is_active')) {
    const surveyId = params[0];
    const survey = db.surveys[surveyId];
    if (survey && survey.is_active === 1) {
      return [{
        columns: ['id', 'researcherId', 'title', 'description', 'googleFormUrl', 'googleSheetUrl', 'reward_per_response', 'estimated_time', 'category', 'max_responses', 'current_responses', 'status', 'is_active'],
        values: [[survey.id, survey.researcherId, survey.title, survey.description, survey.googleFormUrl, survey.googleSheetUrl, survey.reward_per_response, survey.estimated_time, survey.category, survey.max_responses, survey.current_responses, survey.status, survey.is_active]],
      }];
    }
    return [];
  }

  // SELECT * FROM surveys WHERE id = ? AND researcherId = ?
  if (sql.includes('SELECT * FROM surveys WHERE id') && sql.includes('researcherId')) {
    const surveyId = params[0];
    const researcherId = params[1];
    const survey = db.surveys[surveyId];
    if (survey && survey.researcherId === researcherId) {
      return [{
        columns: ['id', 'title', 'description', 'reward_per_response', 'max_responses', 'status'],
        values: [[survey.id, survey.title, survey.description, survey.reward_per_response, survey.max_responses, survey.status]],
      }];
    }
    return [];
  }

  // SELECT reward_per_response, current_responses FROM surveys WHERE id = ?
  if (sql.includes('SELECT reward_per_response, current_responses FROM surveys')) {
    const surveyId = params[0];
    const survey = db.surveys[surveyId];
    if (survey) {
      return [{
        columns: ['reward_per_response', 'current_responses'],
        values: [[survey.reward_per_response, survey.current_responses]],
      }];
    }
    return [];
  }

  // SELECT * FROM wallets WHERE user_id = ?
  if (sql.includes('SELECT * FROM wallets WHERE user_id')) {
    const userId = params[0];
    const wallet = db.wallets[userId];
    if (wallet) {
      return [{
        columns: ['id', 'user_id', 'balance', 'total_earned', 'total_withdrawn'],
        values: [[wallet.id, wallet.user_id, wallet.balance, wallet.total_earned, wallet.total_withdrawn]],
      }];
    }
    return [];
  }

  // SELECT id FROM wallets WHERE user_id = ?
  if (sql.includes('SELECT id FROM wallets WHERE user_id')) {
    const userId = params[0];
    const wallet = db.wallets[userId];
    if (wallet) {
      return [{
        columns: ['id'],
        values: [[wallet.id]],
      }];
    }
    return [];
  }

  // SELECT balance FROM wallets WHERE user_id = ?
  if (sql.includes('SELECT balance FROM wallets WHERE user_id')) {
    const userId = params[0];
    const wallet = db.wallets[userId];
    if (wallet) {
      return [{
        columns: ['balance'],
        values: [[wallet.balance]],
      }];
    }
    return [];
  }

  // SELECT * FROM survey_sessions WHERE survey_id = ? AND user_id = ? AND status = 'active'
  if (sql.includes('SELECT * FROM survey_sessions') && sql.includes('survey_id') && sql.includes('status')) {
    const surveyId = params[0];
    const userId = params[1];
    const session = Object.values(db.survey_sessions).find((s: any) => s.survey_id === surveyId && s.user_id === userId && s.status === 'active');
    if (session) {
      return [{
        columns: ['id', 'survey_id', 'user_id', 'started_at', 'expires_at', 'status'],
        values: [[session.id, session.survey_id, session.user_id, session.started_at, session.expires_at, session.status]],
      }];
    }
    return [];
  }

  // SELECT * FROM survey_sessions WHERE user_id = ? AND status = 'active'
  if (sql.includes('SELECT * FROM survey_sessions') && sql.includes('user_id') && sql.includes('status')) {
    const userId = params[0];
    const sessions = Object.values(db.survey_sessions).filter((s: any) => s.user_id === userId && s.status === 'active');
    if (sessions.length) {
      return [{
        columns: ['id', 'survey_id', 'user_id', 'started_at', 'expires_at', 'status'],
        values: sessions.map((s: any) => [s.id, s.survey_id, s.user_id, s.started_at, s.expires_at, s.status]),
      }];
    }
    return [];
  }

  // SELECT * FROM survey_responses WHERE survey_id = ? AND respondent_id = ? AND status = 'verified'
  if (sql.includes('SELECT * FROM survey_responses')) {
    const surveyId = params[0];
    const respondentId = params[1];
    const responses = Object.values(db.survey_responses).filter((r: any) => r.survey_id === surveyId && r.respondent_id === respondentId && r.status === 'verified');
    if (responses.length) {
      return [{
        columns: ['id', 'survey_id', 'respondent_id', 'status'],
        values: responses.map((r: any) => [r.id, r.survey_id, r.respondent_id, r.status]),
      }];
    }
    return [];
  }

  // SELECT * FROM korapay_transactions WHERE reference_id = ? AND status = 'completed'
  if (sql.includes('SELECT * FROM korapay_transactions') && sql.includes('reference_id')) {
    const referenceId = params[0];
    const txn = Object.values(db.korapay_transactions).find((t: any) => t.reference_id === referenceId && t.status === 'completed');
    if (txn) {
      return [{
        columns: ['id', 'user_id', 'type', 'amount', 'status', 'reference_id'],
        values: [[txn.id, txn.user_id, txn.type, txn.amount, txn.status, txn.reference_id]],
      }];
    }
    return [];
  }

  // SELECT * FROM ledger WHERE wallet_id = ? ORDER BY created_at DESC LIMIT 50
  if (sql.includes('SELECT * FROM ledger WHERE wallet_id')) {
    const walletId = params[0];
    const transactions = db.ledger.filter((t: any) => t.wallet_id === walletId)
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 50);
    if (transactions.length) {
      return [{
        columns: ['id', 'wallet_id', 'type', 'amount', 'description', 'created_at', 'survey_id'],
        values: transactions.map((t: any) => [t.id, t.wallet_id, t.type, t.amount, t.description, t.created_at, t.survey_id]),
      }];
    }
    return [];
  }

  return [];
}

export function run(sql: string, params: any[] = []) {
  if (!db) return;

  // INSERT INTO users
  if (sql.includes('INSERT INTO users')) {
    const [id, email, password, firstName, lastName, roles] = params;
    db.users[email] = {
      id,
      email,
      password,
      firstName,
      lastName,
      roles: typeof roles === 'string' ? JSON.parse(roles) : roles,
      isVerified: true,
      createdAt: new Date().toISOString(),
    };
    saveDatabase();
  }
  // INSERT INTO surveys
  else if (sql.includes('INSERT INTO surveys')) {
    const [id, researcherId, title, description, googleFormUrl, googleSheetUrl, reward, time, category, colleges, depts, levels, maxResponses, budget, status] = params;
    db.surveys[id] = {
      id,
      researcherId,
      title,
      description,
      googleFormUrl,
      googleSheetUrl,
      reward_per_response: reward,
      estimated_time: time,
      category,
      target_colleges: colleges,
      target_departments: depts,
      target_levels: levels,
      max_responses: maxResponses,
      current_responses: 0,
      budget,
      status: status || 'draft',
      is_active: 0,
      created_at: new Date().toISOString(),
    };
    saveDatabase();
  }
  // INSERT INTO wallets
  else if (sql.includes('INSERT INTO wallets')) {
    const [id, userId] = params;
    db.wallets[userId] = {
      id,
      user_id: userId,
      balance: 0,
      total_earned: 0,
      total_withdrawn: 0,
    };
    saveDatabase();
  }
  // INSERT INTO survey_sessions
  else if (sql.includes('INSERT INTO survey_sessions')) {
    const [id, surveyId, userId, startTime, expiresAt] = params;
    db.survey_sessions[id] = {
      id,
      survey_id: surveyId,
      user_id: userId,
      started_at: startTime,
      expires_at: expiresAt,
      status: 'active',
    };
    saveDatabase();
  }
  // INSERT INTO survey_responses
  else if (sql.includes('INSERT INTO survey_responses')) {
    const [id, surveyId, respondentId, status, verifiedAt] = params;
    db.survey_responses[id] = {
      id,
      survey_id: surveyId,
      respondent_id: respondentId,
      status,
      verified_at: verifiedAt,
    };
    saveDatabase();
  }
  // INSERT INTO ledger
  else if (sql.includes('INSERT INTO ledger')) {
    const ledgerEntry: any = {};
    const columns = sql.match(/\(([^)]+)\)/)?.[1].split(',').map(c => c.trim()) || [];
    columns.forEach((col: string, idx: number) => {
      if (col === 'id') ledgerEntry.id = params[idx];
      else if (col === 'wallet_id') ledgerEntry.wallet_id = params[idx];
      else if (col === 'type') ledgerEntry.type = params[idx];
      else if (col === 'amount') ledgerEntry.amount = params[idx];
      else if (col === 'description') ledgerEntry.description = params[idx];
      else if (col === 'survey_id') ledgerEntry.survey_id = params[idx];
    });
    ledgerEntry.created_at = new Date().toISOString();
    db.ledger.push(ledgerEntry);
    saveDatabase();
  }
  // INSERT INTO korapay_transactions
  else if (sql.includes('INSERT INTO korapay_transactions')) {
    const txn: any = {};
    const columns = sql.match(/\(([^)]+)\)/)?.[1].split(',').map(c => c.trim()) || [];
    columns.forEach((col: string, idx: number) => {
      if (col === 'id') txn.id = params[idx];
      else if (col === 'user_id') txn.user_id = params[idx];
      else if (col === 'type') txn.type = params[idx];
      else if (col === 'amount') txn.amount = params[idx];
      else if (col === 'status') txn.status = params[idx];
      else if (col === 'reference_id') txn.reference_id = params[idx];
      else if (col === 'metadata') txn.metadata = params[idx];
    });
    txn.created_at = new Date().toISOString();
    db.korapay_transactions[txn.id] = txn;
    saveDatabase();
  }
  // UPDATE surveys SET current_responses
  else if (sql.includes('UPDATE surveys SET current_responses')) {
    const surveyId = params[params.length - 1];
    if (db.surveys[surveyId]) {
      db.surveys[surveyId].current_responses += 1;
      saveDatabase();
    }
  }
  // UPDATE surveys SET status, is_active, paid_amount
  else if (sql.includes('UPDATE surveys SET status')) {
    const surveyId = params[params.length - 1];
    if (db.surveys[surveyId]) {
      db.surveys[surveyId].status = params[0];
      db.surveys[surveyId].is_active = 1;
      if (params.length > 2) {
        db.surveys[surveyId].paid_amount = params[1];
      }
      saveDatabase();
    }
  }
  // UPDATE survey_sessions SET status
  else if (sql.includes('UPDATE survey_sessions SET status')) {
    const sessionId = params[params.length - 1];
    const session = Object.values(db.survey_sessions).find((s: any) => s.id === sessionId);
    if (session) {
      session.status = params[0];
      if (sql.includes('closed_at')) {
        session.closed_at = params[1] || new Date().toISOString();
      }
      saveDatabase();
    }
  }
  // UPDATE wallets SET balance (multiple patterns)
  else if (sql.includes('UPDATE wallets SET balance')) {
    if (sql.includes('total_earned')) {
      // Pattern: balance = balance + ?, total_earned = total_earned + ? WHERE id = ?
      const walletId = params[params.length - 1];
      const wallet = Object.values(db.wallets).find((w: any) => w.id === walletId);
      if (wallet) {
        wallet.balance += params[0];
        wallet.total_earned += params[1];
        saveDatabase();
      }
    } else {
      // Pattern: balance = balance - ? WHERE id = ?
      const walletId = params[params.length - 1];
      const wallet = Object.values(db.wallets).find((w: any) => w.id === walletId);
      if (wallet) {
        wallet.balance -= params[0]; // params[0] is the amount to subtract
        saveDatabase();
      }
    }
  }
  // UPDATE wallets SET total_withdrawn
  else if (sql.includes('UPDATE wallets SET total_withdrawn')) {
    const walletId = params[params.length - 1];
    const wallet = Object.values(db.wallets).find((w: any) => w.id === walletId);
    if (wallet) {
      wallet.total_withdrawn += params[0];
      saveDatabase();
    }
  }
  // UPDATE korapay_transactions SET status
  else if (sql.includes('UPDATE korapay_transactions SET status')) {
    const referenceId = params[params.length - 1];
    const txn = Object.values(db.korapay_transactions).find((t: any) => t.reference_id === referenceId);
    if (txn) {
      txn.status = params[0];
      saveDatabase();
    }
  }
}
