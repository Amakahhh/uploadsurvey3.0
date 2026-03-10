import { safeLocalStorage } from "../utils/storageUtils";

const API_BASE_URL = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  firstName: string;
  lastName: string;
  isAuthenticated: boolean;
  userName?: string;
  email: string;
  roles: string[];
  isVerified: boolean;
  jwToken: string;
  refreshToken: string;
  refreshTokenExpiration: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  userName: string;
  role?: "respondent" | "researcher";
}

export interface School {
  id: string;
  name: string;
}

export interface College {
  id: string;
  name: string;
  schoolId: string;
}

export interface Department {
  id: string;
  name: string;
  collegeId: string;
}

export interface Course {
  id: string;
  name: string;
  departmentId: string;
}

export interface Gender {
  id: number;
  name: string;
}

export interface PersonType {
  id: number;
  name: string;
}

export interface FormVerificationRequest {
  surveyId: string;
}

export interface SurveyCondition {
  schoolId?: string;
  personType?: number;
  collegeId?: string;
  departmentId?: string;
  courseId?: string;
  levels?: string;
  gender?: number;
}

export interface CreateSurveyRequest {
  title?: string;
  description?: string;
  googleFormUrl?: string;
  googleSheetUrl?: string;
  reward_per_response?: number;
  max_responses?: number;
  estimated_time?: number;
  target_colleges?: string[];
  target_departments?: string[];
  target_levels?: string[];

  // legacy aliases used by some components
  name?: string;
  desc?: string;
  responderLink?: string;
  sheetLink?: string;
  chargePerResponse?: number;
  maxResponseNo?: number;
  conditions?: SurveyCondition[];
}

export interface CreateSurveyResponse {
  id: string;
  surveyId: string;
  name: string;
  title: string;
  description: string;
  responderLink: string;
  sheetLink: string;
  googleFormUrl?: string;
  maxResponseNo: number;
  chargePerResponse: number;
  creatorId: string;
  begin: string;
  conditions: SurveyCondition[];
  isActive: boolean;
  createdAt: string;
  checkoutLink: string;
  respondentsCharge: number;
  platformCommission: number;
  conditionsCharge: number;
  totalAmount: number;
}

interface ApiResult<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

const demoSchools: School[] = [
  { id: "covenant-university", name: "Covenant University" },
  { id: "babcock-university", name: "Babcock University" },
  { id: "afe-babalola-university-abuad", name: "Afe Babalola University (ABUAD)" },
  { id: "redeemers-university", name: "Redeemer's University" },
  { id: "landmark-university", name: "Landmark University" },
  { id: "bells-university-of-technology", name: "Bells University of Technology" },
  { id: "university-of-lagos-unilag", name: "University of Lagos (UNILAG)" },
  { id: "university-of-ibadan", name: "University of Ibadan" },
  { id: "university-of-benin", name: "University of Benin" },
  { id: "university-of-nigeria", name: "University of Nigeria" },
];

const baseCollegeTemplates = [
  { id: "cst", name: "CST (College of Science and Technology)" },
  { id: "coe", name: "COE (College of Engineering)" },
  { id: "cmss", name: "CMSS (College of Management and Social Studies)" },
  { id: "clds", name: "CLDS (College of Leadership and Development Studies)" },
];

const baseDepartmentTemplates: Record<string, string[]> = {
  cst: ["Computer Science", "Biological Sciences", "Chemistry", "Physics", "Mathematics"],
  coe: ["Mechanical Engineering", "Civil Engineering", "Electrical Engineering", "Chemical Engineering", "Petroleum Engineering"],
  cmss: ["Business Administration", "Economics", "Accounting", "Mass Communication", "Sociology"],
  clds: ["Political Science", "International Relations", "Languages", "Psychology"],
};

const baseCoursesByDepartment: Record<string, string[]> = {
  "Computer Science": ["BSc. Computer Science", "BSc. Management Information Systems"],
  "Biological Sciences": ["BSc. Biology", "BSc. Biochemistry", "BSc. Microbiology"],
  Chemistry: ["BSc. Industrial Chemistry", "BSc. Pure Chemistry"],
  Physics: ["BSc. Industrial Physics"],
  Mathematics: ["BSc. Mathematics"],
  "Mechanical Engineering": ["BEng. Mechanical Engineering"],
  "Civil Engineering": ["BEng. Civil Engineering"],
  "Electrical Engineering": ["BEng. Electrical & Electronics Engineering", "BEng. Info & Comm Engineering"],
  "Chemical Engineering": ["BEng. Chemical Engineering"],
  "Petroleum Engineering": ["BEng. Petroleum Engineering"],
  "Business Administration": ["BSc. Business Administration", "BSc. Marketing"],
  Economics: ["BSc. Economics"],
  Accounting: ["BSc. Accounting", "BSc. Banking and Finance"],
  "Mass Communication": ["BSc. Mass Communication"],
  Sociology: ["BSc. Sociology"],
  "Political Science": ["BSc. Political Science"],
  "International Relations": ["BSc. International Relations"],
  Languages: ["B.A. English"],
  Psychology: ["BSc. Psychology"],
};

const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const demoColleges: College[] = demoSchools.flatMap((school) =>
  baseCollegeTemplates.map((college) => ({
    id: `${school.id}-${college.id}`,
    name: college.name,
    schoolId: school.id,
  }))
);

const demoDepartments: Department[] = demoColleges.flatMap((college) => {
  const collegeCode = college.id.split("-").slice(-1)[0] as keyof typeof baseDepartmentTemplates;
  const names = baseDepartmentTemplates[collegeCode] || [];
  return names.map((deptName) => ({
    id: `${college.id}-${slug(deptName)}`,
    name: deptName,
    collegeId: college.id,
  }));
});

const demoCourses: Course[] = demoDepartments.flatMap((department) => {
  const names = baseCoursesByDepartment[department.name] || [`BSc. ${department.name}`];
  return names.map((courseName) => ({
    id: `${department.id}-${slug(courseName)}`,
    name: courseName,
    departmentId: department.id,
  }));
});

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = safeLocalStorage.getItem("jwtToken");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async parse<T>(response: Response): Promise<T> {
    const json = (await response.json().catch(() => ({}))) as ApiResult<T>;
    if (!response.ok || json.success === false) {
      const message = json.message || json.error || `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    if (json.data !== undefined) {
      return json.data;
    }

    return json as T;
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return { status: "ok", timestamp: new Date().toISOString() };
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const payload = await this.parse<any>(response);
    const user = payload.user || payload.data?.user;
    const session = payload.session || payload.data?.session;

    if (!user || !session?.accessToken) {
      throw new Error("Invalid login response from server");
    }

    const fullName = user.fullName || "";
    const [firstName, ...rest] = fullName.split(" ");

    return {
      id: user.id,
      firstName: firstName || "User",
      lastName: rest.join(" ") || "",
      isAuthenticated: true,
      email: user.email,
      roles: [user.role || "respondent"],
      isVerified: Boolean(user.isVerified),
      jwToken: session.accessToken,
      refreshToken: session.refreshToken || "",
      refreshTokenExpiration: session.expiresAt ? new Date(session.expiresAt * 1000).toISOString() : "",
    };
  }

  async register(request: RegisterRequest): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: request.email,
        password: request.password,
        fullName: `${request.firstName} ${request.lastName}`.trim(),
        role: request.role || "researcher",
      }),
    });

    const result = await this.parse<any>(response);
    return { message: result.message || "Registration completed" };
  }

  async getSurveys(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/surveys`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    const data = await this.parse<any[]>(response);
    return data;
  }

  async createSurvey(surveyData: CreateSurveyRequest): Promise<CreateSurveyResponse> {
    const payload = {
      title: surveyData.title || surveyData.name,
      description: surveyData.description || surveyData.desc,
      reward: surveyData.reward_per_response || surveyData.chargePerResponse,
      response_cap: surveyData.max_responses || surveyData.maxResponseNo,
      google_sheet_url: surveyData.googleSheetUrl || surveyData.sheetLink,
      google_form_url: surveyData.googleFormUrl || surveyData.responderLink,
      target_college: Array.isArray(surveyData.target_colleges) && surveyData.target_colleges.length
        ? surveyData.target_colleges[0]
        : undefined,
      target_department: Array.isArray(surveyData.target_departments) && surveyData.target_departments.length
        ? surveyData.target_departments[0]
        : undefined,
      target_level: Array.isArray(surveyData.target_levels) && surveyData.target_levels.length
        ? surveyData.target_levels[0]
        : undefined,
      estimated_time: surveyData.estimated_time || 5,
    };

    const response = await fetch(`${API_BASE_URL}/api/surveys`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const survey = await this.parse<any>(response);
    const maxResponses = Number(survey.response_cap || 0);
    const reward = Number(survey.reward || 0);
    const respondentsCharge = maxResponses * reward;
    const platformCommission = respondentsCharge * 0.05;

    return {
      id: survey.id,
      surveyId: survey.id,
      title: survey.title || payload.title || "",
      name: survey.title || payload.title || "",
      description: survey.description || payload.description || "",
      responderLink: surveyData.googleFormUrl || surveyData.responderLink || "",
      sheetLink: surveyData.googleSheetUrl || surveyData.sheetLink || "",
      googleFormUrl: survey.google_form_url || surveyData.googleFormUrl || surveyData.responderLink || "",
      chargePerResponse: reward,
      maxResponseNo: maxResponses,
      creatorId: survey.creator_id || "",
      begin: new Date().toISOString(),
      conditions: surveyData.conditions || [],
      isActive: survey.status === "active",
      createdAt: survey.created_at || new Date().toISOString(),
      checkoutLink: `/api/payments/create`,
      respondentsCharge,
      platformCommission,
      conditionsCharge: 0,
      totalAmount: respondentsCharge + platformCommission,
    };
  }

  async startSurveySession(surveyId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/surveys/start`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ surveyId }),
    });

    return this.parse<any>(response);
  }

  async verifyResponse(surveyId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/verify`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ surveyId }),
    });

    return this.parse<any>(response);
  }

  async verifyForm(_request: FormVerificationRequest): Promise<{ isAvailable: boolean; message: string }> {
    return {
      isAvailable: true,
      message: "Verification stub active in local development",
    };
  }

  async getWallet(_walletId?: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/wallet`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    return this.parse<any>(response);
  }

  async getWalletBalance(_walletId?: string): Promise<{ balance: number }> {
    const wallet = await this.getWallet();
    return { balance: wallet.balance || 0 };
  }

  async createWallet(request: { userId: string; pin: string; cPin: string }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/wallet`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ action: "create", ...request }),
    });

    return this.parse<any>(response);
  }

  async fundWallet(_walletId: string, request: { walletId?: string; amount: number; message?: string }): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/wallet`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ action: "fund", amount: request.amount, message: request.message }),
    });

    const data = await this.parse<any>(response);
    return { message: data.message || "Wallet funded" };
  }

  async payWithWallet(request: { walletId: string; surveyId: string; totalAmount: number }): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/wallet`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        action: "debit",
        amount: request.totalAmount,
        reference: `survey_payment_${request.surveyId}`,
        description: `Survey funding for ${request.surveyId}`,
      }),
    });

    const data = await this.parse<any>(response);
    return { success: true, message: data.message || "Wallet payment successful" };
  }

  async getSchools(): Promise<School[]> {
    return demoSchools;
  }

  async getCollegesBySchool(schoolId: string): Promise<College[]> {
    if (!schoolId) return demoColleges;
    return demoColleges.filter((c) => c.schoolId === schoolId);
  }

  async getDepartmentsByCollege(collegeId: string): Promise<Department[]> {
    if (!collegeId) return demoDepartments;
    return demoDepartments.filter((d) => d.collegeId === collegeId);
  }

  async getCoursesByDepartment(departmentId: string): Promise<Course[]> {
    if (!departmentId) return demoCourses;
    return demoCourses.filter((c) => c.departmentId === departmentId);
  }

  async getGenders(): Promise<Gender[]> {
    return [
      { id: 1, name: "Male" },
      { id: 2, name: "Female" },
    ];
  }

  async getPersonTypes(): Promise<PersonType[]> {
    return [
      { id: 1, name: "Student" },
      { id: 2, name: "Graduate" },
    ];
  }
}

export const apiService = new ApiService();
