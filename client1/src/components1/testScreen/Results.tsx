import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTestResults } from '@/services/api';

interface QuestionResult {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  studentAnswer: string;
  isCorrect: boolean;
}

interface TestResult {
  id: string;
  title: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  dateSubmitted: string;
  questions: QuestionResult[];
}

export const TestReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestResults = async () => {
      try {
        setLoading(true);
        const userData = JSON.parse(localStorage.getItem('user'));
        const results = await getTestResults(id, userData.id);
        
        const formattedResult: TestResult = {
          id: results._id,
          title: results.assessment_name,
          score: results.score.percentage,
          totalQuestions: results.score.total,
          correctAnswers: results.score.correct,
          dateSubmitted: results.submitted_at,
          questions: results.questions.map((q: any) => ({
            id: q.id,
            question: q.question,
            options: q.options,
            correctAnswer: q.corrected,
            studentAnswer: results.answers[q.id] || 'Not answered',
            isCorrect: q.corrected === results.answers[q.id]
          }))
        };
        
        setTestResult(formattedResult);
      } catch (err) {
        setError('Failed to load test results');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestResults();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => navigate('/student')}>Back to Dashboard</Button>
      </div>
    );
  }

  if (!testResult) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-muted-foreground mb-4">No test results found</p>
        <Button onClick={() => navigate('/student')}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/student')}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{testResult.title}</h1>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="bg-secondary px-4 py-2 rounded-md">
            <p className="text-sm text-muted-foreground">Score</p>
            <p className="text-xl font-bold">{testResult.score}%</p>
          </div>
          <div className="bg-secondary px-4 py-2 rounded-md">
            <p className="text-sm text-muted-foreground">Correct Answers</p>
            <p className="text-xl font-bold">
              {testResult.correctAnswers}/{testResult.totalQuestions}
            </p>
          </div>
          <div className="bg-secondary px-4 py-2 rounded-md">
            <p className="text-sm text-muted-foreground">Date Submitted</p>
            <p className="text-xl font-bold">
              {new Date(testResult.dateSubmitted).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {testResult.questions.map((question, index) => (
          <Card key={question.id} className="border rounded-lg overflow-hidden">
            <CardHeader className="bg-secondary/50 p-4">
              <CardTitle className="text-lg">
                Question {index + 1}: {question.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Options:</h3>
                <ul className="space-y-2">
                  {question.options.map((option, i) => (
                    <li 
                      key={i}
                      className={`p-3 rounded-md border ${
                        option === question.correctAnswer
                          ? 'bg-green-50 border-green-200'
                          : option === question.studentAnswer && !question.isCorrect
                          ? 'bg-red-50 border-red-200'
                          : 'bg-background'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {option === question.correctAnswer ? (
                          <CheckCircle2 className="text-green-500" size={16} />
                        ) : option === question.studentAnswer && !question.isCorrect ? (
                          <XCircle className="text-red-500" size={16} />
                        ) : null}
                        <span>{option}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-md border border-green-200">
                  <h3 className="font-medium text-green-800 mb-2">Correct Answer</h3>
                  <p className="text-green-700">{question.correctAnswer}</p>
                </div>
                <div className={`p-4 rounded-md border ${
                  question.isCorrect 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <h3 className={`font-medium mb-2 ${
                    question.isCorrect ? 'text-green-800' : 'text-red-800'
                  }`}>
                    Your Answer
                  </h3>
                  <p className={question.isCorrect ? 'text-green-700' : 'text-red-700'}>
                    {question.studentAnswer}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Button 
          onClick={() => navigate('/student')}
          className="px-8 py-4"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};