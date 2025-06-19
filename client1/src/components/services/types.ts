// types.ts
export interface UserProfile {
    first_name: string;
    last_name: string;
    email: string;
    mobile: string;
    location: string;
    title: string;
    profile_picture: string;
    summary?: string;
    skills: {
      name: string;
      level: 'Beginner' | 'Intermediate' | 'Advanced';
    }[];
    experiences: {
      company_name: string;
      job_title: string;
      start_date: string;
      end_date: string;
      currently_working: boolean;
      description: string;
    }[];
    projects: {
      title: string;
      description: string;
      link: string;
      start_date: string;
      end_date: string;
      currently_ongoing: boolean;
    }[];
    education: {
      '10th': {
        board: string;
        school: string;
        percentage: string;
        passout_year: string;
      };
      '12th': {
        board: string;
        school: string;
        percentage: string;
        passout_year: string;
      };
      graduation: {
        college: string;
        branch: string;
        percentage: string;
        passout_year: string;
      };
    };
    resume: {
      name: string;
      url: string;
      uploadedAt: string;
    } | null;
  }