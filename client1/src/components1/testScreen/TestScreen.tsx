import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Maximize2, Minimize2, Clock, User, Sun, Moon, BookOpen, AlertCircle, Check } from 'lucide-react';
import { fetchTest, submitTest } from '@/services/api';
import { useNavigate } from 'react-router-dom';

interface Question {
  id: string;
  question: string;
  options: string[];
  corrected: string | string[];
  number: string;
  question_type?: string[];
}

interface TestDetails {
  _id: string;
  assessment_name: string;
  teacher_id: string;
  time_allotment: string;
  questions: Question[];
  ai?: boolean;
  is_assigned?: boolean;
  timestamp?: string;
}

interface UserData {
  email: string;
  first_name: string;
  last_name: string;
  id: string;
  role: string;
  username: string;
}

const TestScreen: React.FC = () => {
  const [testDetails, setTestDetails] = useState<TestDetails | null>(null);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [testStarted, setTestStarted] = useState(false);
  const navigate = useNavigate();
  
  const clearTestData = () => {
    if (!testDetails) return;
    localStorage.removeItem(`test_answers_${testDetails._id}`);
    localStorage.removeItem('currentTest');
  };

  // Load user data and theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsDarkMode(savedTheme === 'dark');

    const user = localStorage.getItem('user');
    if (user) {
      setUserData(JSON.parse(user));
    }
  }, []);

  useEffect(() => {
    if (testDetails) {
      const savedAnswers = localStorage.getItem(`test_answers_${testDetails._id}`);
      const initialAnswers = savedAnswers ? JSON.parse(savedAnswers) : {};
      setAnswers(initialAnswers);
    }
  }, [testDetails]);

  // Load test data
  useEffect(() => {
    const loadTestData = async () => {
      try {
        const currentTest = localStorage.getItem('currentTest');
        if (!currentTest) throw new Error('No test data found');
        
        const testData = JSON.parse(currentTest);
        const testId = testData.id;

        const cachedTest = localStorage.getItem(`test_${testId}`);
        if (cachedTest) {
          const cachedData = JSON.parse(cachedTest);
          setTestDetails(cachedData);
          const savedAnswers = localStorage.getItem(`test_answers_${testId}`);
          if (savedAnswers) {
            setAnswers(JSON.parse(savedAnswers));
          }
        }

        const apiData = await fetchTest(testId);
        setTestDetails(apiData);
        localStorage.setItem(`test_${testId}`, JSON.stringify(apiData));
      } catch (error) {
        console.error('Error loading test data:', error);
      }
    };

    loadTestData();
  }, []);

  // Save answers to localStorage whenever they change
  useEffect(() => {
    if (testDetails?._id) {
      localStorage.setItem(`test_answers_${testDetails._id}`, JSON.stringify(answers));
    }
  }, [answers, testDetails?._id]);
  
  // Timer logic (only starts when testStarted is true)
  useEffect(() => {
    if (!testStarted || !testDetails) return;

    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, testStarted, testDetails]);

  const handleAutoSubmit = async () => {
    if (!testDetails) return;
    
    try {
      await submitAnswers();
      setShowTimeoutModal(true);
    } catch (error) {
      console.error('Auto-submit failed:', error);
    }
  };

  const handleTimeoutModalClose = () => {
    setShowTimeoutModal(false);
    navigate('/student');
    window.location.reload();
  };

  const handleDisclaimerConfirm = () => {
    setShowDisclaimer(false);
    setTestStarted(true);
    if (testDetails) {
      setTimeLeft(parseInt(testDetails.time_allotment) * 60);
    }
  };

  const handleDisclaimerCancel = () => {
    navigate('/student');
    window.location.reload();
  };

  const handleAnswerSelect = (questionNumber: string, option: string) => {
    if (!testDetails) return;
    
    const currentAnswers = answers[questionNumber] || [];
    const isMultipleAnswer = testDetails.questions.find(q => q.number === questionNumber)?.question_type?.includes("Multiple Answers");

    let newAnswers: string[];
    if (isMultipleAnswer) {
      // For multiple answer questions, toggle the option
      if (currentAnswers.includes(option)) {
        newAnswers = currentAnswers.filter(ans => ans !== option);
      } else {
        newAnswers = [...currentAnswers, option];
      }
    } else {
      // For single answer questions, replace the answer
      newAnswers = [option];
    }

    const updatedAnswers = {
      ...answers,
      [questionNumber]: newAnswers
    };

    setAnswers(updatedAnswers);
    localStorage.setItem(`test_answers_${testDetails._id}`, JSON.stringify(updatedAnswers));
  };

  const isOptionSelected = (questionNumber: string, option: string) => {
    return answers[questionNumber]?.includes(option) || false;
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(console.error);
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(console.error);
    }
  };

  // Theme toggle
  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', newTheme);
  };

  // Test submission handlers
  const handleFinishTest = () => setShowConfirmation(true);
  const cancelFinishTest = () => setShowConfirmation(false);
  
  const confirmFinishTest = async () => {
    try {
      await submitAnswers();
      navigate('/student');
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };

  // API submission function
  const submitAnswers = async () => {
    if (!testDetails || !userData) return;
    try {
      const response = await submitTest(
        testDetails._id, 
        userData.id,
        Object.fromEntries(Object.entries(answers).map(([key, value]) => [key, value.join(',')])),
        parseInt(testDetails.time_allotment) * 60 - timeLeft
      );
      console.log('Submission response:', response);
      localStorage.removeItem(`test_answers_${testDetails._id}`);
      localStorage.removeItem(`test_${testDetails._id}`);
      localStorage.removeItem('currentTest');
      return response;
    } catch (error) {
      console.error('Error submitting answers:', error);
      throw error;
    }
  };

  if (!testDetails || !userData) {
    return (
      <div className={`flex items-center justify-center h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Loading test...
        </div>
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = testDetails.questions.length;

  // Theme classes
  const bgColor = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const textColor = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const cardBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`flex h-screen ${bgColor} ${textColor}`}>
      {/* Timeout Modal */}
      <Transition appear show={showTimeoutModal} as={React.Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={handleTimeoutModalClose}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-50" />
            </Transition.Child>

            <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className={`inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform ${cardBg} shadow-xl rounded-2xl`}>
                <Dialog.Title as="h3" className={`text-lg font-medium leading-6 ${textColor}`}>
                  Time's Up!
                </Dialog.Title>
                <div className="mt-4">
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Your test has been automatically submitted.
                  </p>
                  <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    You answered {answeredCount} out of {totalQuestions} questions.
                  </p>
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                    onClick={handleTimeoutModalClose}
                  >
                    OK
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Disclaimer Modal */}
      <Transition appear show={showDisclaimer} as={React.Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={handleDisclaimerCancel}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-50" />
            </Transition.Child>

            <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className={`inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform ${cardBg} shadow-xl rounded-2xl`}>
                <Dialog.Title as="h3" className={`text-lg font-medium leading-6 ${textColor}`}>
                  Test Disclaimer
                </Dialog.Title>
                <div className="mt-4">
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} mb-4`}>
                    By starting this test, you agree to the following:
                  </p>
                  <ul className={`list-disc pl-5 space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <li>You will complete the test without external help</li>
                    <li>You will not navigate away from the test page</li>
                    <li>The test will be timed and submitted automatically when time expires</li>
                    <li>All answers are final once submitted</li>
                  </ul>
                </div>
                <div className="mt-6 flex space-x-3">
                  <button
                    type="button"
                    className={`inline-flex justify-center px-4 py-2 text-sm font-medium ${isDarkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} border border-transparent rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500`}
                    onClick={handleDisclaimerCancel}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                    onClick={handleDisclaimerConfirm}
                  >
                    I Understand, Start Test
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Confirmation Modal */}
      <Transition appear show={showConfirmation} as={React.Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={cancelFinishTest}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-50" />
            </Transition.Child>

            <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className={`inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform ${cardBg} shadow-xl rounded-2xl`}>
                <Dialog.Title as="h3" className={`text-lg font-medium leading-6 ${textColor}`}>
                  Finish Test?
                </Dialog.Title>
                <div className="mt-4">
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} mb-2`}>
                    Questions answered: {answeredCount}/{totalQuestions}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Are you sure you want to finish the test? {totalQuestions - answeredCount} questions remain unanswered.
                  </p>
                </div>
                <div className="mt-6 flex space-x-3">
                  <button
                    type="button"
                    className={`inline-flex justify-center px-4 py-2 text-sm font-medium ${isDarkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} border border-transparent rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500`}
                    onClick={cancelFinishTest}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                    onClick={confirmFinishTest}
                  >
                    Yes, Finish Test
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Main Test Interface */}
      {!showDisclaimer && (
        <div className="flex w-full">
          {/* Sidebar */}
          <div className={`w-64 ${cardBg} border-r ${borderColor} p-4 flex flex-col h-screen sticky top-0 shadow-lg`}>
            {/* Test Info Section */}
            <div className="mb-6">
              <h1 className={`text-xl font-bold ${textColor} mb-4`}>
                {testDetails.assessment_name}
              </h1>
              
              {/* Timer */}
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className={`w-5 h-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                    <span className="font-medium">Time Remaining</span>
                  </div>
                  <span className={`font-bold ${timeLeft < 300 ? 'text-red-500' : isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                  </span>
                </div>
              </div>
              
              {/* Progress */}
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-4`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm font-medium">{answeredCount}/{totalQuestions}</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Controls */}
              <div className="space-y-2 mb-6">
                <div className="flex space-x-2">
                  <button
                    className={`flex-1 p-2 rounded-md ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} flex items-center justify-center`}
                    onClick={toggleFullscreen}
                    title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  >
                    {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                  </button>
                  <button
                    className={`flex-1 p-2 rounded-md ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} flex items-center justify-center`}
                    onClick={toggleTheme}
                    title="Toggle theme"
                  >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              {/* User Information */}
              <div className="mb-6">
                <h2 className={`text-lg font-semibold ${textColor} flex items-center mb-4`}>
                  <BookOpen className="w-5 h-5 mr-2" />
                  Test Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <User className={`w-4 h-4 mt-0.5 mr-2 flex-shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <div>
                      <p className="text-xs font-medium opacity-70">Student</p>
                      <p className="text-sm">{userData.first_name} {userData.last_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <User className={`w-4 h-4 mt-0.5 mr-2 flex-shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <div>
                      <p className="text-xs font-medium opacity-70">Email</p>
                      <p className="text-sm break-all">{userData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <User className={`w-4 h-4 mt-0.5 mr-2 flex-shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <div>
                      <p className="text-xs font-medium opacity-70">Teacher ID</p>
                      <p className="text-sm">{testDetails.teacher_id}</p>
                    </div>
                  </div>
                  <button
                    className="fixed bottom-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center w-"
                    onClick={handleFinishTest}
                  >
                    Finish Test
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Scrollable Questions */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-8 max-w-4xl mx-auto">
              {testDetails.questions.map((question, index) => {
                const isMultipleAnswer = question.question_type?.includes("Multiple Answers");
                
                return (
                  <div 
                    key={question.id} 
                    className={`${cardBg} rounded-lg shadow p-6 ${borderColor}`}
                    id={`question-${index}`}
                  >
                    <div className="mb-6">
                      <h2 className={`text-lg font-semibold ${textColor}`}>
                        Question {index + 1}
                        {isMultipleAnswer && (
                          <span className="ml-2 text-sm font-normal text-gray-500">
                            (Select all that apply)
                          </span>
                        )}
                      </h2>
                      <p className={`mt-2 ${textColor}`}>{question.question}</p>
                    </div>

                    <div className="space-y-3">
                      {question.options && question.options.length > 0 ? (
                        question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`p-3 border rounded-md cursor-pointer flex items-center justify-between ${
                              isOptionSelected(question.number, option)
                                ? 'border-blue-500 bg-blue-500/10'
                                : `${borderColor} ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`
                            }`}
                            onClick={() => handleAnswerSelect(question.number, option)}
                          >
                            <div className="flex items-center">
                              {isMultipleAnswer ? (
                                <div className={`w-5 h-5 border rounded-md mr-3 flex items-center justify-center ${
                                  isOptionSelected(question.number, option)
                                    ? 'bg-blue-500 border-blue-500'
                                    : borderColor
                                }`}>
                                  {isOptionSelected(question.number, option) && (
                                    <Check className="w-4 h-4 text-white" />
                                  )}
                                </div>
                              ) : (
                                <span className={`font-medium mr-2 ${textColor}`}>
                                  {String.fromCharCode(65 + optionIndex)}.
                                </span>
                              )}
                              <span className={textColor}>{option}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className={`p-3 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-md`}>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                            Type Your Answer.
                          </p>
                          <input
                            type="text"
                            value={answers[question.number]?.[0] || ''}
                            onChange={(e) => {
                              const newAnswers = {
                                ...answers,
                                [question.number]: [e.target.value]
                              };
                              setAnswers(newAnswers);
                              localStorage.setItem(`test_answers_${testDetails._id}`, JSON.stringify(newAnswers));
                            }}
                            className={`w-full p-2 border rounded-md ${borderColor} ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                            placeholder="Type your answer here..."
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestScreen;