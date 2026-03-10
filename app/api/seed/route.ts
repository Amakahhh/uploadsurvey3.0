import { NextRequest } from 'next/server';
import { initializeDatabase } from '@/lib/db/database';
import { generateId, hashPassword } from '@/lib/utils/auth';
import { success, serverError } from '@/lib/utils/response';

export async function GET(request: NextRequest) {
  try {
    const { run } = await initializeDatabase();

    // Create test user (respondent)
    const respondentId = generateId();
    const respondentEmail = 'respondent@example.com';
    const respondentPassword = hashPassword('password123');

    run(
      `INSERT OR IGNORE INTO users (id, email, password, firstName, lastName, roles, isVerified)
       VALUES (?, ?, ?, 'Test', 'Respondent', ?, 1)`,
      [respondentId, respondentEmail, respondentPassword, JSON.stringify(['respondent'])]
    );

    // Create wallets for test user
    const respondentWalletId = generateId();
    run(
      `INSERT OR IGNORE INTO wallets (id, user_id, balance, total_earned)
       VALUES (?, ?, 0, 0)`,
      [respondentWalletId, respondentId]
    );

    // Create test researcher user
    const researcherId = generateId();
    const researcherEmail = 'researcher@example.com';
    const researcherPassword = hashPassword('password123');

    run(
      `INSERT OR IGNORE INTO users (id, email, password, firstName, lastName, roles, isVerified)
       VALUES (?, ?, ?, 'Test', 'Researcher', ?, 1)`,
      [researcherId, researcherEmail, researcherPassword, JSON.stringify(['researcher', 'respondent'])]
    );

    // Create test surveys
    const surveys = [
      {
        title: 'Impact of AI on Academic Performance',
        description: 'Help us understand how AI tools like ChatGPT and Gemini affect student learning outcomes.',
        category: 'Engineering',
        reward: 200,
        time: 5,
        max_responses: 100,
      },
      {
        title: 'Student Mental Health Survey 2026',
        description: 'A research study on the mental health challenges faced by university students.',
        category: 'Social Sciences',
        reward: 150,
        time: 8,
        max_responses: 200,
      },
      {
        title: 'Entrepreneurship Mindset Among Students',
        description: 'Investigating entrepreneurial intentions and factors that influence them.',
        category: 'Business',
        reward: 100,
        time: 4,
        max_responses: 80,
      },
      {
        title: 'Social Media Usage and Academic Performance',
        description: 'Exploring the relationship between social media habits and GPA.',
        category: 'Mass Communication',
        reward: 75,
        time: 3,
        max_responses: 150,
      },
      {
        title: 'Campus Food Quality Assessment',
        description: 'Rate the quality, variety, and pricing of food options available.',
        category: 'General',
        reward: 100,
        time: 5,
        max_responses: 300,
      },
    ];

    surveys.forEach((survey) => {
      const surveyId = generateId();
      const budget = survey.reward * survey.max_responses * 1.05;

      run(
        `INSERT OR IGNORE INTO surveys (
          id, researcherId, title, description, reward_per_response, estimated_time,
          category, max_responses, current_responses, budget, status, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          surveyId,
          researcherId,
          survey.title,
          survey.description,
          survey.reward,
          survey.time,
          survey.category,
          survey.max_responses,
          Math.floor(Math.random() * (survey.max_responses * 0.5)),
          budget,
          'active',
          1,
        ]
      );
    });

    return success({
      message: 'Test data seeded successfully',
      testCredentials: {
        respondent: {
          email: respondentEmail,
          password: 'password123',
        },
        researcher: {
          email: researcherEmail,
          password: 'password123',
        },
      },
    });
  } catch (err: any) {
    console.error('[Seed Error]', err);
    return serverError(err.message);
  }
}
