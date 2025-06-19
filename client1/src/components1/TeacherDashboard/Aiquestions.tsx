import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaCog, FaComment, FaFileAlt, FaPaperPlane, FaDownload, FaCircle } from "react-icons/fa";
import { FaFileAlt as FaFileAltSolid } from "react-icons/fa";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';
import { fetchSkills } from "../../services/api.tsx";
import { generatequestionpaper } from '../../services/api.tsx';
import { storeAssessment } from '../../services/api.tsx';
import PreviewModal from './PreviewModal.tsx';
import './Ai.css';

interface AquestionsProps {
  fetchAssessments: () => Promise<void>;
  // ... other props
  onClose: () => void; 
}
const AIChatAssistant :React.FC<AquestionsProps> = ({ fetchAssessments, onClose }) => {



  
    interface Message {
        sender: string;
  text: string;
  type: string;
  isGenerating?: boolean;
  hasButtons?: boolean;
  hasTimeInput?: boolean;
  hasNameInput?: boolean;
  timeAllotted?: number;
  timeAllotment?: number;
  questionsData?: any;
  isSuccess?: boolean;
  hasPreviewButton?: boolean;  // Add this
  questions?: any;
    }
    interface UserData {
      id: string;
      full_name: string;
      email: string;
      date_joined: string | null;
      username: string;
    }
    interface Question {
      question: string;
      options: string[];
      corrected: string;
    }

    const [messages, setMessages] = useState<Message[]>([
        { sender: 'AI Assistant', text: 'Hello! I can help you generate an assessment. What skills would you like to test?', type: 'model' }
    ]);
    
    const [inputMessage, setInputMessage] = useState('');
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [difficulty, setDifficulty] = useState('easy');
    const [skillInput, setSkillInput] = useState('');
    const [skills, setSkills] = useState<{skill: string, questions: string}[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const chatBoxRef = useRef<HTMLDivElement>(null);
    const skillInputRef = useRef<HTMLInputElement>(null);
    const [allSkills, setAllSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const timeInputRef = useRef(null);
const nameInputRef = useRef(null);
const [previewData, setPreviewData] = useState(null);
    // Mock skills data - replace with your API call
    const storedUser = localStorage.getItem("user");

  let userData: UserData | null = null;

  if (storedUser) {
    const apiData = JSON.parse(storedUser);
  
    userData = {
      id: apiData.id,
      full_name: `${apiData.first_name} ${apiData.last_name}`,
      email: apiData.email,
      date_joined: apiData.date_joined ?? null,
      username: apiData.username,
 
    };
  }
    useEffect(() => {
        const loadSkills = async () => {
            const skills = await fetchSkills();
            console.log("API Response:", skills); // Debugging
            setAllSkills(Array.isArray(skills) ? skills : []);
        };
        loadSkills();
    }, []);
    
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        
            setShowQuestionForm(false);
  
            const promptMessage = inputMessage; 
            if (!promptMessage) {
                alert("Please enter a prompt!");
                return;
            }
        
            setMessages(prev => [...prev, {
                sender: 'You',
                text: promptMessage,
                type: 'user'
            }]);
        
            try {
              setInputMessage('');
                const typingMessage = {
                    sender: 'AI Assistant',
                    text: 'Typing...',
                    type: 'model',
                    isGenerating: true  // Add isGenerating flag to remove later
                };
        
                setMessages(prev => [...prev, typingMessage]);
        
                const response = await generatequestionpaper(promptMessage);
        
                // Remove the typing animation and add the AI response
                setTimeout(() => {
                    setMessages(prev => prev.filter(msg => !msg.isGenerating).concat({
                        sender: 'AI Assistant',
                        text: typeof response === 'string' 
          ? response.trim() 
          : (response.response ? response.response.trim() : JSON.stringify(response, null, 2))
      ,
                        type: 'model'
                    }));
                }, 1500);
                
        
            } catch (error) {
                console.error("Error:", error);
                setMessages(prev => prev.filter(msg => !msg.isGenerating).concat({
                    sender: 'AI Assistant',
                    text: 'Failed to generate questions. Please try again.',
                    type: 'model'
                }));
            }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const handleChatBtnClick = async () => {
      setShowQuestionForm(false);
  
      const promptMessage = "Hello"; // Get user input dynamically
      if (!promptMessage) {
          alert("Please enter a prompt!");
          return;
      }
  
      setMessages(prev => [...prev, {
          sender: 'You',
          text: promptMessage,
          type: 'user'
      }]);
  
      try {
          const typingMessage = {
              sender: 'AI Assistant',
              text: 'Typing...',
              type: 'model',
              isGenerating: true  // Add isGenerating flag to remove later
          };
  
          setMessages(prev => [...prev, typingMessage]);
  
          const response = await generatequestionpaper(promptMessage);
  
          // Remove the typing animation and add the AI response
          setTimeout(() => {
              setMessages(prev => prev.filter(msg => !msg.isGenerating).concat({
                  sender: 'AI Assistant',
                  text: typeof response === 'string' 
    ? response.trim() 
    : (response.response ? response.response.trim() : JSON.stringify(response, null, 2))
,
                  type: 'model'
              }));
          }, 1);
  
      } catch (error) {
          console.error("Error:", error);
          setMessages(prev => prev.filter(msg => !msg.isGenerating).concat({
              sender: 'AI Assistant',
              text: 'Failed to generate questions. Please try again.',
              type: 'model'
          }));
      }
  };
  

    const handleQuestionPaperBtnClick = () => {
        setShowQuestionForm(true);
    };

    const handleSkillInputChange = (e) => {
        const value = e.target.value;
        setSkillInput(value);

        if (value && Array.isArray(allSkills)) {
            const filtered = allSkills.filter(s => 
                s.toLowerCase().startsWith(value.toLowerCase())
            );
            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const addSkill = (skill) => {
        if (!skills.some(s => s.skill === skill)) {
            setSkills(prev => [...prev, { skill, questions: '' }]);
            setSkillInput('');
            setShowSuggestions(false);
        }
    };

    const removeSkill = (index) => {
        setSkills(prev => prev.filter((_, i) => i !== index));
    };

    const handleSkillQuestionChange = (index, value) => {
        setSkills(prev => prev.map((item, i) => 
            i === index ? { ...item, questions: value } : item
        ));
    };
    const extractCleanJSON = (response: string): Record<string, Question> => {
      try {
        // Remove markdown code block markers
        const jsonString = response.replace(/```json|```/g, '').trim();
        
        // Parse the JSON
        const parsed = JSON.parse(jsonString);
        
        // Validate the structure
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed;
        }
        return {};
      } catch (error) {
        console.error('Failed to parse questions:', error);
        return {};
      }
    };



    const generateQuestionPaper = async () => {
        // Format the skills information
        const skillDetails = skills.map(s => `${s.skill} (${s.questions} questions)`).join(", ");
        
        // Create the prompt message
        const promptMessage = `Generate a multiple-choice question paper in JSON format. Each question should have an ID, a question text, four options, and the correct answer. Use the following specifications:
      
      - Difficulty level: ${difficulty}
      - ${skillDetails}
      
      For each question, provide:
      1. The question text  
      2. Four possible answers (A, B, C, D)  
      3. The correct answer  
      
      Return only the JSON object without any additional text, formatting, or markdown. Do not include triple backticks (\`) or language indicators like \`json\`.  
      
      Example response format:
      {
        "1": {"question": "What is the time complexity of binary search?", "options": ["O(n)", "O(log n)", "O(n^2)", "O(1)"], "corrected": "O(log n)"},
        "2": {"question": "Choose the correct synonym for 'ephemeral'", "options": ["Permanent", "Temporary", "Weak", "Strong"], "corrected": "Temporary"}
      }
      
      Ensure:
      ✅ No explanations, extra text, or code formatting  
      ✅ Strictly a valid JSON object  
      ✅ No section titles like "Numerical Ability" inside the JSON  
      ✅ Each response generates unique, random questions.`;
      
        // Add user message to chat
        setMessages(prev => [...prev, {
          sender: 'You',
          text: `Generate a ${difficulty} level question paper with: ${skillDetails}`,
          type: 'user'
        }]);
      
        // Show generating animation
        const generatingMessage = {
          sender: 'AI Assistant',
          text: 'Generating your question paper...',
          type: 'model',
          isGenerating: true
        };
        setMessages(prev => [...prev, generatingMessage]);
      
        try {
          // Use the separated API service
          setShowQuestionForm(false);
          const response = await generatequestionpaper(promptMessage);
      
          // Remove generating animation
          setMessages(prev => prev.filter(msg => !msg.isGenerating));
      
          // Add the response to chat
          setMessages(prev => [...prev, {
            sender: 'AI Assistant',
            text: `Here's your ${difficulty} level question paper:\n\n${JSON.stringify(response, null, 2)}`,
            type: 'model',
            questions: response, // Store the questions data
      hasPreviewButton: true,
            hasButtons: true,
          }]);
      
        } catch (error) {
          // Remove generating animation
          setMessages(prev => prev.filter(msg => !msg.isGenerating));
          
          // Show error message
          setMessages(prev => [...prev, {
            sender: 'AI Assistant',
            text: 'Failed to generate questions. Please try again.',
            type: 'model'
          }]);
        }
        
        setShowQuestionForm(false);
      };

    const handleDownloadChat = () => {
        // Simulate download functionality
        console.log('Downloading chat history...');
        alert('Chat history download simulated');
    };
    

    return (
        <div className="ai-generator-container" >
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                backgroundColor: '#4361ee',
                color: 'white'
            }}>
                <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaRobot className="logo-icon" />
                    <span>AI Assessment Generator</span>
                </div>
                
            </div>

            <div style={{
                flex: 1,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
               <div className="chat-messages" ref={chatBoxRef} style={{
    flex: 1,
    overflowY: 'auto',
    padding: '1rem'
}}>
    {messages.map((message, index) => (
        <div key={index} className={`message ${message.type}`} style={{
            marginBottom: '1rem',
            maxWidth: '85%',
            padding: '1rem',
            borderRadius: '10px',
            position: 'relative',
            lineHeight: 1.5,
            backgroundColor: message.type === 'user' ? '#e9ecef' : '#f8f9fa',
            marginLeft: message.type === 'user' ? 'auto' : 'initial',
            marginRight: message.type === 'model' ? 'auto' : 'initial',
            borderLeft: message.type === 'model' ? '3px solid #4361ee' : 'none'
        }}>
            <div className="sender" style={{
                fontSize: '0.8rem',
                marginBottom: '0.3rem',
                fontWeight: 500,
                color: message.type === 'user' ? '#495057' : '#4361ee',
                textAlign: message.type === 'user' ? 'right' : 'left'
            }}>{message.sender}</div>
            
            {message.text}
            
            {message.hasButtons && (
  <div className="confirmation-buttons" style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
    <button 
      className="confirm-btn yes-btn" 
      style={{
        padding: '8px 15px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 500,
        background: '#4CAF50',
        color: 'white'
      }}
      onClick={() => {
        // Update only this message to remove buttons and show time input
        setMessages(prev => prev.map(msg => 
          msg === message ? {
            ...msg,
            hasButtons: false,  
            hasTimeInput: true,   
          } : msg
        ));
      }}
    >
      Yes
    </button>
    <button 
      className="confirm-btn no-btn"
      style={{
        padding: '8px 15px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 500,
        background: '#f44336',
        color: 'white'
      }}
      onClick={() => {
        // Replace this message with a new one
        setMessages(prev => [
          ...prev.filter(msg => msg !== message),
          {
            ...message,  
            hasButtons: false,  
            text: 'Try to generate the questions again.',
            
          }
        ]);
      }}
    >
      No
    </button>
  </div>
)}


            {message.hasPreviewButton && (
      <button
      onClick={() => {
        console.log('Questions data:', message.questions); // Debug log
        setPreviewData(message.questions);
      }}
        style={{
          marginTop: '10px',
          padding: '8px 16px',
          backgroundColor: '#4361ee',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Preview Question Paper
      </button>
    )}
            
            
            {message.hasTimeInput && (
  <div style={{ marginTop: '10px' }}>
    <input
      type="number"
      placeholder="Enter minutes"
      style={{
        padding: '8px',
        borderRadius: '5px',
        border: '1px solid #ddd',
        marginRight: '10px'
      }}
      ref={timeInputRef}
    />
    <button
      style={{
        padding: '8px 15px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 500,
        background: '#4CAF50',
        color: 'white'
      }}
      onClick={() => {
        const timeAllotment = timeInputRef.current.value;
        if (!timeAllotment || isNaN(timeAllotment) || timeAllotment <= 0) {
          alert("Please enter a valid time");
          return;
        }
        console.log("Questions Data:", message.questions);
        // Create a NEW message for time allocation while keeping the current one
        setMessages(prev => [
            
          ...prev.map(msg => msg === message ? {
            ...msg,
            hasTimeInput: false,  // Remove time input from current message
            hasPreviewButton: true  // Keep preview button
          } : msg),
          {
            sender: 'AI Assistant',
            text: `Time allotted: ${timeAllotment} minutes`,
            type: 'model'
          },
          {
            sender: 'AI Assistant',
            text: 'Enter assessment name:',
            type: 'model',
            hasNameInput: true,
            timeAllotment: timeAllotment,
            
            questions: message.questions  // Carry forward questions for preview
          }
          
        ]);
      }}
    >
      Submit Time
    </button>
  </div>
)}
            
            {message.hasNameInput && (
  <div style={{ marginTop: '10px' }}>
    <input
      type="text"
      placeholder="Enter assessment name"
      style={{
        padding: '8px',
        borderRadius: '5px',
        border: '1px solid #ddd',
        marginRight: '10px',
        width: '200px'
      }}
      ref={nameInputRef}
    />
    <button
  style={{
    padding: '8px 15px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 500,
    background: '#4CAF50',
    color: 'white'
  }}
  onClick={async () => { 
    const assessmentName = nameInputRef.current.value.trim();
    if (!assessmentName) {
      alert("Please enter a valid name");
      return;
    }

    try {
     
      const questions = extractCleanJSON(message.questions.response);
      console.log("hii",questions);
      const assessmentData = {
        teacher_id: userData.id, 
        questions: questions,
        time_allotment: message.timeAllotment,
        assessment_name: assessmentName,
        ai: true
      };
      
      const result = await storeAssessment(assessmentData);
      await fetchAssessments();
      
      // fetchAssessments={fetchAssessments}
      setMessages(prev => [
        ...prev.map(msg => msg === message ? {
          ...msg,
          hasNameInput: false,
          text: `Assessment name: ${assessmentName}\nTime allotted: ${msg.timeAllotment} minutes`,
          questions: msg.questions
        } : msg),
        {
          sender: 'AI Assistant',
          text: "",
          type: 'model',
          isSuccess: true,
          questions: message.questions
        }
      ]);
    } catch (error) {
      alert(`Error saving assessment: ${error.message}`);
    }
  }}
>
  Submit Name
</button>

  </div>
)}
            
            {message.isSuccess && (
  <div style={{ marginTop: '10px' }}>
    <div style={{ color: 'green', fontWeight: 'bold', marginBottom: '10px' }}>
      ✓ Successfully created assessment
      </div>
      <button
      onClick={() => setPreviewData(message.questions)}
      style={{
        padding: '8px 16px',
        backgroundColor: '#4361ee',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Preview Question Paper
    </button>
    
   
  </div>
)}
            {previewData && (
  <PreviewModal 
    questions={previewData} 
    onClose={() => setPreviewData(null)} 
  />
)}
            
        </div>
    ))}
</div>
                
                {showQuestionForm && (
                    <div id="question-form" className="question-form" style={{
                        background: 'rgb(160 166 172)',
                        borderRadius: '8px',
                        padding: '1rem',
                        margin: '1rem',
                        border: '1px solid #dee2e6',
                        overflowY: 'auto',
                        
                        height: '500000px',
                    }}>
                        <div className="form-group" style={{
                            marginBottom: '1rem',
                            padding: '12px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease-in-out'
                        }}>
                            <label htmlFor="difficulty" style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: 600,
                                color: '#2c3e50',
                                fontSize: '14px'
                            }}> Level:</label>
                            <select 
                                id="difficulty" 
                                className="styled-select"
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontFamily: "'Poppins', sans-serif",
                                    fontSize: '16px',
                                    background: 'white',
                                    color: '#333',
                                    boxShadow: 'inset 0px 2px 4px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                        
                        <div className="form-group" style={{
                            marginBottom: '1rem',
                            padding: '12px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease-in-out'
                        }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: 600,
                                color: '#2c3e50',
                                fontSize: '14px'
                            }}>Key Skills:</label>
                            <div className="skill-container" style={{ position: 'relative', width: '100%' }}>
                                <div id="skill-container" className="skills-box" style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    border: '1px solid #ddd',
                                    padding: '8px',
                                    minHeight: '40px',
                                    borderRadius: '6px',
                                    background: 'white'
                                }}>
                                    {skills.map((skill, index) => (
                                        <div key={index} className="skill-tag" style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '8px 12px',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            fontWeight: 500,
                                            background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                                            border: '1px solid #ddd',
                                            color: '#333',
                                            margin: '4px'
                                        }}>
                                            <span>{skill.skill}</span>
                                            <input 
                                                type="number" 
                                                className="question-input" 
                                                placeholder="No. of questions"
                                                value={skill.questions}
                                                onChange={(e) => handleSkillQuestionChange(index, e.target.value)}
                                                min="1"
                                                style={{
                                                    width: '50px',
                                                    padding: '4px',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '4px',
                                                    fontSize: '14px',
                                                    textAlign: 'center'
                                                }}
                                            />
                                            <span 
                                                className="remove-skill"
                                                onClick={() => removeSkill(index)}
                                                style={{
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: 'bold',
                                                    color: '#888'
                                                }}
                                            >
                                                ×
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <input 
                                    type="text" 
                                    id="skill-input" 
                                    className="styled-input" 
                                    placeholder="Type to search skills..."
                                    value={skillInput}
                                    onChange={handleSkillInputChange}
                                    onFocus={() => skillInput && setShowSuggestions(true)}
                                    ref={skillInputRef}
                                    style={{
                                        width: '100%',
                                        padding: '0.6rem',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '6px',
                                        fontFamily: "'Poppins', sans-serif"
                                    }}
                                />
                                {showSuggestions && suggestions.length > 0 && (
                                    <div id="suggestions" className="suggestions-box" style={{
                                        position: 'absolute',
                                        background: 'white',
                                        border: '1px solid #ccc',
                                        maxHeight: '200px',
                                        overflowY: 'auto',
                                        zIndex: 1000,
                                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                        width: 'auto',
                                        minWidth: '150px',
                                        maxWidth: '100%',
                                        marginTop: '5px',
                                        padding: '5px'
                                    }}>
                                        {suggestions.map((skill, index) => (
                                            <div 
                                                key={index} 
                                                className="suggestion-item"
                                                onClick={() => addSkill(skill)}
                                                style={{
                                                    padding: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                {skill}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <button 
                            id="generate-btn" 
                            className="btn btn-primary"
                            onClick={generateQuestionPaper}
                            style={{
                                width: '100%',
                                marginTop: '1rem',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '0.8rem',
                                fontSize: '16px',
                                backgroundColor: '#4361ee',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 500,
                                fontFamily: "'Poppins', sans-serif"
                            }}
                        >
                            <FaFileAltSolid /> Generate Questions
                        </button>
                    </div>
                )}
                
                <div className="chat-input" style={{
                    padding: '1rem',
                    borderTop: '1px solid #dee2e6',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    background: '#f8f9fa'
                }}>
                    <div className="action-buttons" style={{
                        display: 'flex',
                        gap: '10px',
                        marginBottom: '10px'
                    }}>
                        <button 
                            id="chat-btn" 
                            className="btn btn-outline"
                            onClick={handleChatBtnClick}
                            style={{
                                padding: '0.8rem 1.5rem',
                                background: 'transparent',
                                border: '1px solid #4361ee',
                                color: '#4361ee',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 500,
                                fontFamily: "'Poppins', sans-serif",
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            <FaComment /> Chat with Us
                        </button>
                        <button 
                            id="question-paper-btn" 
                            className="btn btn-outline"
                            onClick={handleQuestionPaperBtnClick}
                            style={{
                                padding: '0.8rem 1.5rem',
                                background: 'transparent',
                                border: '1px solid #4361ee',
                                color: '#4361ee',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 500,
                                fontFamily: "'Poppins', sans-serif",
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            <FaFileAlt /> Generate Question Paper
                        </button>
                    </div>
                    <div className="input-row" style={{ display: 'flex', gap: '10px' }}>
                        <input 
                            type="text" 
                            id="message-box" 
                            placeholder="Type your message here..." 
                            autoFocus
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            style={{
                                flex: 1,
                                padding: '0.8rem 1rem',
                                border: '1px solid #dee2e6',
                                borderRadius: '8px',
                                fontFamily: "'Poppins', sans-serif",
                                transition: 'border-color 0.3s'
                            }}
                        />
                        <button 
                            id="send-btn" 
                            className="btn btn-primary"
                            onClick={handleSendMessage}
                            style={{
                                padding: '0.8rem 1.5rem',
                                backgroundColor: '#4361ee',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 500,
                                fontFamily: "'Poppins', sans-serif",
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            <FaPaperPlane /> <span>Send</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};



export default AIChatAssistant;