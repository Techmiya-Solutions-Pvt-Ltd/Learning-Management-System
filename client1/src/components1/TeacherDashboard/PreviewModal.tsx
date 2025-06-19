import React from 'react';

interface Question {
  question: string;
  options: string[];
  corrected: string;
}

interface PreviewModalProps {
  questions: { response: string } | Record<string, Question> | string | null;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ questions, onClose }) => {
  const parseQuestions = (response: unknown): Record<string, Question> => {
    try {
      // Handle null/undefined cases
      if (!response) return {};

      // If response is already in the correct format
      if (typeof response === 'object' && response !== null && !Array.isArray(response)) {
        // Handle the case where response is { response: "..." }
        if ('response' in response && typeof response.response === 'string') {
          return parseQuestions(response.response);
        }
        return response as Record<string, Question>;
      }

      // Handle string input
      if (typeof response === 'string') {
        // Extract JSON from markdown code block if present
        let jsonString = response.trim();
        const jsonMatch = jsonString.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          jsonString = jsonMatch[1];
        }
        
        // Parse the JSON
        const parsed = JSON.parse(jsonString);
        
        // Handle case where parsed is { response: "..." } again
        if (typeof parsed === 'object' && parsed !== null && 'response' in parsed) {
          return parseQuestions(parsed.response);
        }
        
        return parsed;
      }
    } catch (error) {
      console.error('Error parsing questions:', error);
    }

    return {};
  };

  // Parse the questions data
  const parsedQuestions = parseQuestions(questions);

  // Render nothing if modal shouldn't be visible
  if (!questions) return null;

  // Error state if no questions could be parsed
  if (Object.keys(parsedQuestions).length === 0) {
    return (
      <div style={modalStyle}>
        <div style={contentStyle}>
          <h2 style={{ margin: 0 }}>No Questions Available</h2>
          <p>The question data could not be parsed.</p>
          <button onClick={onClose} style={buttonStyle}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={modalStyle}>
      <div style={contentStyle}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0 }}>Question Paper Preview</h2>
          <button onClick={onClose} style={buttonStyle}>
            Close
          </button>
        </div>

        {Object.entries(parsedQuestions).map(([id, question]) => (
          <div key={id} style={questionStyle}>
            <p style={questionTextStyle}>
              {id}. {question.question}
            </p>
            
            <div style={optionsContainerStyle}>
              <p style={optionsTitleStyle}>Options:</p>
              <ul style={optionsListStyle}>
                {question.options.map((option, i) => (
                  <li key={i} style={optionStyle}>
                    <span style={optionLetterStyle}>
                      {String.fromCharCode(65 + i)}.
                    </span> {option}
                  </li>
                ))}
              </ul>
              
              <p style={correctAnswerStyle}>
                Correct Answer: {question.corrected}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Styles
const modalStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const contentStyle: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '2rem',
  borderRadius: '8px',
  maxWidth: '800px',
  maxHeight: '80vh',
  overflowY: 'auto' as 'auto',
  width: '90%'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1rem'
};

const buttonStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#4361ee',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};

const questionStyle = {
  marginBottom: '2rem',
  padding: '1rem',
  border: '1px solid #e0e0e0',
  borderRadius: '8px'
};

const questionTextStyle = {
  fontWeight: 'bold',
  fontSize: '1.1rem',
  marginBottom: '0.5rem'
};

const optionsContainerStyle = {
  marginLeft: '1rem'
};

const optionsTitleStyle = {
  fontWeight: '500',
  marginBottom: '0.5rem'
};

const optionsListStyle = {
  listStyleType: 'none',
  paddingLeft: 0,
  marginBottom: '1rem'
};

const optionStyle = {
  marginBottom: '0.3rem'
};

const optionLetterStyle = {
  fontWeight: '500'
};

const correctAnswerStyle = {
  color: 'green',
  fontWeight: '500',
  marginTop: '0.5rem'
};

export default PreviewModal;