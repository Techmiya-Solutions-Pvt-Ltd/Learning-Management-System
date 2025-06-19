// services/resumeGenerator.ts
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { UserProfile } from './types';


export const generateResumePDF = async (templateId: number, userData: UserProfile): Promise<Blob> => {
  const doc = new jsPDF();
  
  switch(templateId) {
    case 1: return generateProfessionalTemplate(doc, userData);
    case 2: return generateModernTemplate(doc, userData);
    case 3: return generateCreativeTemplate(doc, userData);
    case 4: return generateMinimalistTemplate(doc, userData);
    default: return generateProfessionalTemplate(doc, userData);
  }
};

const generateProfessionalTemplate = (doc: jsPDF, userData: UserProfile): Blob => {
  // Set document properties
  doc.setProperties({
    title: `${userData.first_name} ${userData.last_name} - Professional Resume`,
    subject: 'Professional Resume',
    author: `${userData.first_name} ${userData.last_name}`,
  });

  // Add header
  doc.setFontSize(22);
  doc.setTextColor(51, 51, 51);
  doc.setFont('helvetica', 'bold');
  doc.text(`${userData.first_name} ${userData.last_name}`, 105, 30, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(userData.title || 'Professional', 105, 36, { align: 'center' });
  
  // Add contact information
  const contactInfo = [
    userData.email ? `Email: ${userData.email}` : '',
    userData.mobile ? `Phone: ${userData.mobile}` : '',
    userData.location ? `Location: ${userData.location}` : ''
  ].filter(Boolean).join(' | ');
  
  doc.setFontSize(10);
  doc.text(contactInfo, 105, 44, { align: 'center' });
  
  // Add horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 50, 190, 50);
  
  let yPosition = 60;
  
  // Professional Summary
  if (userData.summary) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 51, 51);
    doc.text('PROFESSIONAL SUMMARY', 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitText = doc.splitTextToSize(userData.summary, 170);
    doc.text(splitText, 20, yPosition);
    yPosition += splitText.length * 6 + 10;
  }
  
  // Skills
  if (userData.skills?.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('SKILLS', 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const skillsText = userData.skills.map(skill => `${skill.name} (${skill.level})`).join(', ');
    doc.text(skillsText, 20, yPosition);
    yPosition += 10;
  }
  
  // Professional Experience
  if (userData.experiences?.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PROFESSIONAL EXPERIENCE', 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    userData.experiences.forEach(exp => {
      // Company and position
      doc.setFont('helvetica', 'bold');
      doc.text(`${exp.job_title}`, 20, yPosition);
      doc.setFont('helvetica', 'normal');
      
      // Company name and dates
      let dateText = exp.start_date;
      if (exp.end_date) dateText += ` - ${exp.end_date}`;
      if (exp.currently_working) dateText += ` - Present`;
      
      doc.text(`${exp.company_name} | ${dateText}`, 20, yPosition + 6);
      yPosition += 12;
      
      // Description
      if (exp.description) {
        const splitDesc = doc.splitTextToSize(exp.description, 170);
        doc.text(splitDesc, 20, yPosition);
        yPosition += splitDesc.length * 6 + 6;
      }
      
      yPosition += 4;
    });
  }
  
  // Education
  if (userData.education) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('EDUCATION', 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Graduation
    if (userData.education.graduation?.college) {
      const grad = userData.education.graduation;
      doc.setFont('helvetica', 'bold');
      doc.text(`${grad.branch || 'Degree'}`, 20, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(`${grad.college} | ${grad.passout_year || ''}`, 20, yPosition + 6);
      if (grad.percentage) doc.text(`Percentage: ${grad.percentage}%`, 20, yPosition + 12);
      yPosition += 18;
    }
    
    // 12th
    if (userData.education['12th']?.school) {
      const twelfth = userData.education['12th'];
      doc.setFont('helvetica', 'bold');
      doc.text('12th Grade', 20, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(`${twelfth.school} | ${twelfth.board || ''}`, 20, yPosition + 6);
      if (twelfth.percentage) doc.text(`Percentage: ${twelfth.percentage}%`, 20, yPosition + 12);
      yPosition += 18;
    }
    
    // 10th
    if (userData.education['10th']?.school) {
      const tenth = userData.education['10th'];
      doc.setFont('helvetica', 'bold');
      doc.text('10th Grade', 20, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(`${tenth.school} | ${tenth.board || ''}`, 20, yPosition + 6);
      if (tenth.percentage) doc.text(`Percentage: ${tenth.percentage}%`, 20, yPosition + 12);
      yPosition += 18;
    }
  }
  
  // Projects
  if (userData.projects?.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PROJECTS', 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    userData.projects.forEach(proj => {
      doc.setFont('helvetica', 'bold');
      doc.text(proj.title, 20, yPosition);
      doc.setFont('helvetica', 'normal');
      
      if (proj.link) doc.text(`Link: ${proj.link}`, 20, yPosition + 6);
      
      if (proj.description) {
        const splitDesc = doc.splitTextToSize(proj.description, 170);
        doc.text(splitDesc, 20, proj.link ? yPosition + 12 : yPosition + 6);
        yPosition += (proj.link ? 12 : 6) + splitDesc.length * 6;
      } else {
        yPosition += proj.link ? 12 : 6;
      }
      
      yPosition += 6;
    });
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated by Resume Builder', 105, 290, { align: 'center' });
  
  return doc.output('blob');
};

// Other template generators would follow similar patterns but with different styling
const generateModernTemplate = (doc: jsPDF, userData: UserProfile): Blob => {
  // Modern design with two-column layout
  doc.setProperties({
    title: `${userData.first_name} ${userData.last_name} - Resume`,
    subject: 'Resume',
    author: `${userData.first_name} ${userData.last_name}`,
  });

  // Left column (30% width)
  const leftCol = 15;
  const rightCol = 60;
  const fullWidth = 170;
  
  // Add name and title
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246); // Blue color
  doc.setFont('helvetica', 'bold');
  doc.text(userData.first_name, leftCol, 25);
  doc.text(userData.last_name, leftCol, 32);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text(userData.title || 'Professional', leftCol, 40);
  
  // Contact information
  doc.setFontSize(10);
  doc.setTextColor(51, 51, 51);
  
  let contactY = 50;
  if (userData.email) {
    doc.text(`Email: ${userData.email}`, leftCol, contactY);
    contactY += 6;
  }
  if (userData.mobile) {
    doc.text(`Phone: ${userData.mobile}`, leftCol, contactY);
    contactY += 6;
  }
  if (userData.location) {
    doc.text(`Location: ${userData.location}`, leftCol, contactY);
    contactY += 6;
  }
  
  // Skills section in left column
  if (userData.skills?.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('SKILLS', leftCol, contactY + 10);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51);
    
    userData.skills.forEach((skill, index) => {
      doc.text(`${skill.name}:`, leftCol, contactY + 20 + (index * 6));
      // Simple skill level indicator
      const levelWidth = skill.level === 'Beginner' ? 20 : 
                       skill.level === 'Intermediate' ? 40 : 60;
      doc.setFillColor(200, 230, 255);
      doc.rect(leftCol + 20, contactY + 16 + (index * 6), levelWidth, 4, 'F');
    });
    contactY += 20 + (userData.skills.length * 6);
  }
  
  // Right column content
  let rightY = 25;
  
  // Professional Summary
  if (userData.summary) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('PROFILE', rightCol, rightY);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51);
    const splitText = doc.splitTextToSize(userData.summary, fullWidth - rightCol);
    doc.text(splitText, rightCol, rightY + 8);
    rightY += splitText.length * 6 + 15;
  }
  
  // Professional Experience
  if (userData.experiences?.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('EXPERIENCE', rightCol, rightY);
    rightY += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51);
    
    userData.experiences.forEach(exp => {
      // Company and position
      doc.setFont('helvetica', 'bold');
      doc.text(`${exp.job_title}`, rightCol, rightY);
      doc.setFont('helvetica', 'normal');
      
      // Company name and dates
      let dateText = exp.start_date;
      if (exp.end_date) dateText += ` - ${exp.end_date}`;
      if (exp.currently_working) dateText += ` - Present`;
      
      doc.text(`${exp.company_name} | ${dateText}`, rightCol, rightY + 6);
      rightY += 12;
      
      // Description
      if (exp.description) {
        const splitDesc = doc.splitTextToSize(exp.description, fullWidth - rightCol);
        doc.text(splitDesc, rightCol, rightY);
        rightY += splitDesc.length * 6 + 6;
      }
      
      rightY += 4;
    });
  }
  
  // Education
  if (userData.education) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('EDUCATION', rightCol, rightY);
    rightY += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51);
    
    // Graduation
    if (userData.education.graduation?.college) {
      const grad = userData.education.graduation;
      doc.setFont('helvetica', 'bold');
      doc.text(`${grad.branch || 'Degree'}`, rightCol, rightY);
      doc.setFont('helvetica', 'normal');
      doc.text(`${grad.college} | ${grad.passout_year || ''}`, rightCol, rightY + 6);
      if (grad.percentage) doc.text(`Percentage: ${grad.percentage}%`, rightCol, rightY + 12);
      rightY += 18;
    }
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated by Resume Builder', 105, 290, { align: 'center' });
  
  return doc.output('blob');
};

const generateCreativeTemplate = (doc: jsPDF, userData: UserProfile): Blob => {
  // Creative design with more visual elements
  doc.setProperties({
    title: `${userData.first_name} ${userData.last_name} - Creative Resume`,
    subject: 'Creative Resume',
    author: `${userData.first_name} ${userData.last_name}`,
  });

  // Creative header with colored bar
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, 210, 30, 'F');
  
  // Name in header
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(`${userData.first_name} ${userData.last_name}`, 20, 20);
  
  // Title below header
  doc.setFontSize(14);
  doc.setTextColor(59, 130, 246);
  doc.text(userData.title || 'Professional', 20, 40);
  
  // Contact information in right column
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  let contactY = 45;
  
  if (userData.email) {
    doc.text(`✉ ${userData.email}`, 150, contactY);
    contactY += 6;
  }
  if (userData.mobile) {
    doc.text(`📱 ${userData.mobile}`, 150, contactY);
    contactY += 6;
  }
  if (userData.location) {
    doc.text(`📍 ${userData.location}`, 150, contactY);
    contactY += 6;
  }
  
  let yPosition = 60;
  
  // Professional Summary
  if (userData.summary) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('ABOUT ME', 20, yPosition);
    
    // Decorative line
    doc.setDrawColor(59, 130, 246);
    doc.line(20, yPosition + 2, 50, yPosition + 2);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51);
    const splitText = doc.splitTextToSize(userData.summary, 170);
    doc.text(splitText, 20, yPosition + 10);
    yPosition += splitText.length * 6 + 15;
  }
  
  // Two column layout for the rest
  const leftCol = 20;
  const rightCol = 110;
  
  // Left column - Experience
  if (userData.experiences?.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('EXPERIENCE', leftCol, yPosition);
    doc.line(leftCol, yPosition + 2, leftCol + 60, yPosition + 2);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51);
    
    userData.experiences.forEach(exp => {
      // Company and position
      doc.setFont('helvetica', 'bold');
      doc.text(`${exp.job_title}`, leftCol, yPosition);
      doc.setFont('helvetica', 'normal');
      
      // Company name and dates
      let dateText = exp.start_date;
      if (exp.end_date) dateText += ` - ${exp.end_date}`;
      if (exp.currently_working) dateText += ` - Present`;
      
      doc.text(`${exp.company_name} | ${dateText}`, leftCol, yPosition + 6);
      yPosition += 12;
      
      // Description
      if (exp.description) {
        const splitDesc = doc.splitTextToSize(exp.description, 80);
        doc.text(splitDesc, leftCol, yPosition);
        yPosition += splitDesc.length * 6 + 6;
      }
      
      yPosition += 4;
    });
  }
  
  // Right column - Skills and Education
  let rightY = 60;
  
  // Skills
  if (userData.skills?.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('SKILLS', rightCol, rightY);
    doc.line(rightCol, rightY + 2, rightCol + 40, rightY + 2);
    rightY += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51);
    
    userData.skills.forEach(skill => {
      doc.text(`• ${skill.name} (${skill.level})`, rightCol, rightY);
      rightY += 6;
    });
    
    rightY += 10;
  }
  
  // Education
  if (userData.education) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('EDUCATION', rightCol, rightY);
    doc.line(rightCol, rightY + 2, rightCol + 60, rightY + 2);
    rightY += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51);
    
    // Graduation
    if (userData.education.graduation?.college) {
      const grad = userData.education.graduation;
      doc.setFont('helvetica', 'bold');
      doc.text(`${grad.branch || 'Degree'}`, rightCol, rightY);
      doc.setFont('helvetica', 'normal');
      doc.text(`${grad.college}`, rightCol, rightY + 6);
      if (grad.passout_year) doc.text(`Year: ${grad.passout_year}`, rightCol, rightY + 12);
      if (grad.percentage) doc.text(`Score: ${grad.percentage}%`, rightCol, rightY + 18);
      rightY += 24;
    }
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated by Resume Builder', 105, 290, { align: 'center' });
  
  return doc.output('blob');
};

const generateMinimalistTemplate = (doc: jsPDF, userData: UserProfile): Blob => {
  // Minimalist design with clean lines and monochrome
  doc.setProperties({
    title: `${userData.first_name} ${userData.last_name} - Resume`,
    subject: 'Resume',
    author: `${userData.first_name} ${userData.last_name}`,
  });

  // Name and title
  doc.setFontSize(24);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(`${userData.first_name} ${userData.last_name}`, 20, 30);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(userData.title || 'Professional', 20, 38);
  
  // Thin line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 45, 190, 45);
  
  // Contact information in one line
  const contactInfo = [
    userData.email ? `${userData.email}` : '',
    userData.mobile ? `${userData.mobile}` : '',
    userData.location ? `${userData.location}` : ''
  ].filter(Boolean).join(' • ');
  
  doc.setFontSize(10);
  doc.text(contactInfo, 20, 52);
  
  let yPosition = 65;
  
  // Sections with minimal styling
  const addSection = (title: string, content: string[]) => {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), 20, yPosition);
    doc.line(20, yPosition + 2, 40, yPosition + 2);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    content.forEach(line => {
      if (line) {
        const splitText = doc.splitTextToSize(line, 170);
        doc.text(splitText, 20, yPosition);
        yPosition += splitText.length * 6 + 6;
      }
    });
    
    yPosition += 10;
  };
  
  // Summary
  if (userData.summary) {
    addSection('Profile', [userData.summary]);
  }
  
  // Experience
  if (userData.experiences?.length > 0) {
    const experienceContent = userData.experiences.flatMap(exp => {
      const dateText = exp.currently_working 
        ? `${exp.start_date} - Present`
        : `${exp.start_date} - ${exp.end_date}`;
      
      return [
        `${exp.job_title} | ${exp.company_name} | ${dateText}`,
        exp.description || ''
      ];
    });
    
    addSection('Experience', experienceContent);
  }
  
  // Education
  if (userData.education) {
    const educationContent = [];
    
    if (userData.education.graduation?.college) {
      const grad = userData.education.graduation;
      educationContent.push(
        `${grad.branch || 'Degree'} | ${grad.college} | ${grad.passout_year || ''}`,
        grad.percentage ? `Percentage: ${grad.percentage}%` : ''
      );
    }
    
    if (userData.education['12th']?.school) {
      const twelfth = userData.education['12th'];
      educationContent.push(
        `12th Grade | ${twelfth.school} | ${twelfth.passout_year || ''}`,
        twelfth.percentage ? `Percentage: ${twelfth.percentage}%` : ''
      );
    }
    
    if (userData.education['10th']?.school) {
      const tenth = userData.education['10th'];
      educationContent.push(
        `10th Grade | ${tenth.school} | ${tenth.passout_year || ''}`,
        tenth.percentage ? `Percentage: ${tenth.percentage}%` : ''
      );
    }
    
    if (educationContent.length > 0) {
      addSection('Education', educationContent);
    }
  }
  
  // Skills
  if (userData.skills?.length > 0) {
    const skillsContent = [
      userData.skills.map(skill => `${skill.name} (${skill.level})`).join(' • ')
    ];
    addSection('Skills', skillsContent);
  }
  
  // Projects
  if (userData.projects?.length > 0) {
    const projectsContent = userData.projects.flatMap(proj => [
      `${proj.title}${proj.link ? ` | ${proj.link}` : ''}`,
      proj.description || ''
    ]);
    addSection('Projects', projectsContent);
  }
  
  // No footer for true minimalism
  
  return doc.output('blob');
};