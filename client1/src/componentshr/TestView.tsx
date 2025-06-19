import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

import { getTestById, updateTestById } from '@/services/api';

interface Question {
  question: string;
  options: string[];
  corrected: string;
}

interface Test {
  _id: string;
  teacher_id: string;
  questions: { [key: string]: Question };
  time_allotment: string;
  assessment_name: string;
  ai: boolean;
  date: string;
  timestamp: string;
  question_type: string[];
  is_assigned: boolean;
}

const TestView: React.FC = () => {
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTestData = async () => {
      const currentTest = localStorage.getItem('currentTest');
      if (!currentTest) {
        setError('No test selected.');
        setLoading(false);
        return;
      }

      const { id } = JSON.parse(currentTest);
      try {
        const data = await getTestById(`${id}`);
        setTest(data);
      } catch (err) {
        console.error(err);
        setError('Error loading test data.');
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, []);

  const handleChange = (field: keyof Test, value: any) => {
    if (!test) return;
    setTest({ ...test, [field]: value });
  };

  const handleQuestionChange = (key: string, field: keyof Question, value: any) => {
    if (!test) return;
    setTest({
      ...test,
      questions: {
        ...test.questions,
        [key]: {
          ...test.questions[key],
          [field]: value
        }
      }
    });
  };

  const handleOptionChange = (key: string, index: number, value: string) => {
    if (!test) return;
    const updatedOptions = [...test.questions[key].options];
    updatedOptions[index] = value;

    setTest({
      ...test,
      questions: {
        ...test.questions,
        [key]: {
          ...test.questions[key],
          options: updatedOptions
        }
      }
    });
  };

  const handleSave = async () => {
    if (!test) return;
    try {
      await updateTestById(test._id, test);
      setIsEditing(false);
      alert('Test updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update test.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="page-container">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">{test?.assessment_name}</h1>
        {isEditing ? (
          <div>
            <Button onClick={handleSave}>Save</Button>
            <Button className="ml-5" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        ) : (
          <div>
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
            <Button className="ml-5" onClick={() => navigate('/admin')}>Back</Button>
          </div>
        )}
      </header>

      <div className="mb-4">
        <label className="block">Assessment Name</label>
        <input
          type="text"
          className="input"
          value={test?.assessment_name || ''}
          disabled={!isEditing}
          onChange={(e) => handleChange('assessment_name', e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block">Time Allotment (minutes)</label>
        <input
          type="text"
          className="input"
          value={test?.time_allotment || ''}
          disabled={!isEditing}
          onChange={(e) => handleChange('time_allotment', e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block">Questions</label>
        {test?.questions &&
          Object.keys(test.questions).map((key) => (
            <div key={key} className="mb-4">
              <label className="block font-semibold">Question {key}</label>
              <textarea
                className="input w-full"
                value={test.questions[key].question}
                disabled={!isEditing}
                onChange={(e) => handleQuestionChange(key, 'question', e.target.value)}
              />
              <label className="block mt-2">Correct Answer</label>
              <input
                type="text"
                className="input w-full"
                value={test.questions[key].corrected}
                disabled={!isEditing}
                onChange={(e) => handleQuestionChange(key, 'corrected', e.target.value)}
              />

              {/* Options */}
              <label className="block mt-2">Options</label>
              {test.questions[key].options.map((option, index) => (
                <div key={index} className="mb-2 flex items-center">
                  <input
                    type="text"
                    className="input w-full"
                    value={option}
                    disabled={!isEditing}
                    onChange={(e) => handleOptionChange(key, index, e.target.value)}
                  />
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
};

export default TestView;
