import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import './MAssesment.css';
import { storeAssessment } from '../../services/api.tsx';

const ManualAssessmentCreator = () => {
  const navigate = useNavigate();
  const [assessmentTitle, setAssessmentTitle] = useState('');
  const [timeAllocation, setTimeAllocation] = useState(30);
  const [questions, setQuestions] = useState([{
    id: 1,
    type: 'multiple-choice',
    question: '',
    options: ['', ''],
    correctAnswer: 0,
    correctAnswers: [],
    shortAnswer: ''
  }]);

  const addQuestion = () => {
    setQuestions([...questions, {
      id: questions.length + 1,
      type: 'multiple-choice',
      question: '',
      options: ['', ''],
      correctAnswer: 0,
      correctAnswers: [],
      shortAnswer: ''
    }]);
  };

  const removeQuestion = (id: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const addOption = (questionId: number) => {
    setQuestions(questions.map(q =>
      q.id === questionId ? { ...q, options: [...q.options, ''] } : q
    ));
  };

  const removeOption = (questionId: number, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions.splice(optionIndex, 1);

        let newCorrectAnswers = [...q.correctAnswers];
        if (q.type === 'checkbox') {
          newCorrectAnswers = newCorrectAnswers
            .filter(ans => ans !== optionIndex)
            .map(ans => ans > optionIndex ? ans - 1 : ans);
        }

        return {
          ...q,
          options: newOptions,
          correctAnswers: newCorrectAnswers,
          correctAnswer: q.correctAnswer > optionIndex ? q.correctAnswer - 1 : q.correctAnswer
        };
      }
      return q;
    }));
  };

  const handleOptionChange = (questionId: number, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleQuestionChange = (id: number, field: string, value: string) => {
    setQuestions(questions.map(q =>
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const setCorrectAnswer = (questionId: number, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        if (q.type === 'checkbox') {
          const newCorrectAnswers = q.correctAnswers.includes(optionIndex)
            ? q.correctAnswers.filter(ans => ans !== optionIndex)
            : [...q.correctAnswers, optionIndex];
          return { ...q, correctAnswers: newCorrectAnswers };
        } else {
          return { ...q, correctAnswer: optionIndex };
        }
      }
      return q;
    }));
  };

  const changeQuestionType = (questionId: number, type: string) => {
    setQuestions(questions.map(q =>
      q.id === questionId ? {
        ...q,
        type,
        options: type === 'short-answer' ? [] : ['', ''],
        correctAnswers: type === 'checkbox' ? [] : q.correctAnswers,
        correctAnswer: type !== 'checkbox' ? 0 : q.correctAnswer,
        shortAnswer: type === 'short-answer' ? '' : q.shortAnswer
      } : q
    ));
  };

  const saveAssessment = async () => {
    const transformedQuestions: any = {};

    questions.forEach((q, index) => {
      const qNum = (index + 1).toString();
      const qObj: any = {
        question: q.question,
        options: q.type === 'short-answer' ? [] : q.options
      };

      if (q.type === 'checkbox') {
        qObj.corrected = q.correctAnswers.map(i => q.options[i]);
      } else if (q.type === 'multiple-choice') {
        qObj.corrected = q.options[q.correctAnswer];
      } else if (q.type === 'short-answer') {
        qObj.corrected = q.shortAnswer;
      }

      transformedQuestions[qNum] = qObj;
    });

    const assessmentData = {
      teacher_id: JSON.parse(localStorage.getItem('user') || '{}').id,
      questions: transformedQuestions,
      time_allotment: timeAllocation.toString(),
      assessment_name: assessmentTitle,
      ai: false,
      question_type: questions.map(q => {
        if (q.type === 'multiple-choice') return 'Multiple Choice';
        if (q.type === 'checkbox') return 'Multiple Answers';
        if (q.type === 'short-answer') return 'Short Answer';
        return '';
      }),
    };

    try {
      const result = await storeAssessment(assessmentData);
      console.log("Saved:", result);
      navigate('/teacherdashbord');
    } catch (error) {
      console.error("Failed to save assessment", error);
    }
  };

  return (
    <div className="manual-assessment-container">
      <div className="assessment-header">
        <button className="btn-back" onClick={() => navigate('/teacherdashbord')}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Teacher Portal
        </button>
        <h1>Create New Assessment</h1>
        <div className="assessment-title">
          <textarea
            className="assessment-title-input"
            placeholder="Assessment Title"
            value={assessmentTitle}
            onChange={(e) => setAssessmentTitle(e.target.value)}
            rows={2}
          />
          <div className="time-allocation">
            <label>Time Allocation (minutes):</label>
            <input
              type="number"
              min="1"
              value={timeAllocation}
              onChange={(e) => setTimeAllocation(parseInt(e.target.value) || 1)}
            />
          </div>
        </div>
      </div>

      <div className="questions-container">
        {questions.map((q) => (
          <div key={q.id} className="question-card">
            <div className="question-header">
              <select
                value={q.type}
                onChange={(e) => changeQuestionType(q.id, e.target.value)}
              >
                <option value="multiple-choice">Multiple Choice</option>
                <option value="checkbox">Multiple Answers</option>
                <option value="short-answer">Short Answer</option>
              </select>
              {questions.length > 1 && (
                <button className="btn-remove" onClick={() => removeQuestion(q.id)}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
            </div>

            <div className="question-content">
              <div className="question-textarea-container">
                <label>Question:</label>
                <textarea
                  className="question-textarea"
                  placeholder="Enter your question here..."
                  value={q.question}
                  onChange={(e) => handleQuestionChange(q.id, 'question', e.target.value)}
                  rows={3}
                />
              </div>

              {q.type !== 'short-answer' ? (
                <div className="options-container">
                  <label>Options:</label>
                  {q.options.map((option, idx) => (
                    <div key={idx} className="option-row">
                      <input
                        type={q.type === 'checkbox' ? 'checkbox' : 'radio'}
                        name={`question-${q.id}`}
                        checked={q.type === 'checkbox'
                          ? q.correctAnswers.includes(idx)
                          : q.correctAnswer === idx}
                        onChange={() => setCorrectAnswer(q.id, idx)}
                        className="option-selector"
                      />
                      <textarea
                        className="option-textarea"
                        placeholder={`Option ${idx + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(q.id, idx, e.target.value)}
                        rows={2}
                      />
                      {q.options.length > 2 && (
                        <button 
                          className="btn-remove-option"
                          onClick={() => removeOption(q.id, idx)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button className="add-option" onClick={() => addOption(q.id)}>
                    <FontAwesomeIcon icon={faPlus} /> Add Option
                  </button>
                </div>
              ) : (
                <div className="short-answer-container">
                  <label>Correct Answer:</label>
                  <textarea
                    className="answer-textarea"
                    placeholder="Enter the correct answer..."
                    value={q.shortAnswer}
                    onChange={(e) => handleQuestionChange(q.id, 'shortAnswer', e.target.value)}
                    rows={4}
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        <button className="add-question" onClick={addQuestion}>
          <FontAwesomeIcon icon={faPlus} /> Add Question
        </button>
      </div>

      <div className="actions-container">
        <button className="btn-save" onClick={saveAssessment}>
          Create Assessment
        </button>
      </div>
    </div>
  );
};

export default ManualAssessmentCreator;