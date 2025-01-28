import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { openrouter } from '../lib/openrouter';
import { ThumbsUp, ThumbsDown, Share2, Loader } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  topic: string;
}

interface QuestionRating {
  question_id: string;
  is_helpful: boolean;
}

export default function Quiz() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState('World History');
  const [shareLink, setShareLink] = useState('');
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [ratingStatus, setRatingStatus] = useState<Record<string, string>>({});

  const generateQuestions = async (topic: string) => {
    setIsLoading(true);
    try {
      const response = await openrouter.chat.completions.create({
        model: 'google/palm-2',
        messages: [{
          role: 'user',
          content: `Generate 5 multiple choice questions about ${topic} with 4 options each. Format as JSON: {questions: {text: string, options: string[], correctAnswer: number}[]}`
        }],
      });

      const parsed = JSON.parse(response.choices[0].message.content);
      const generated = parsed.questions.map((q: any) => ({
        ...q,
        id: `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        topic
      }));
      
      setQuestions(generated);
      setCurrentQuestion(0);
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const rateQuestion = async (questionId: string, isHelpful: boolean) => {
    setRatingStatus(prev => ({ ...prev, [questionId]: 'saving' }));
    try {
      const { error } = await supabase
        .from('question_ratings')
        .insert([{ 
          question_id: questionId,
          is_helpful: isHelpful,
          question_text: questions.find(q => q.id === questionId)?.text
        }]);

      if (error) throw error;
      setRatingStatus(prev => ({ ...prev, [questionId]: 'saved' }));
    } catch (err) {
      console.error('Rating error:', err);
      setRatingStatus(prev => ({ ...prev, [questionId]: 'error' }));
    }
  };

  const handleAnswer = (selectedIndex: number) => {
    if (questions[currentQuestion].correctAnswer === selectedIndex) {
      setScore(prev => prev + 1);
    }
    setTotalQuestions(prev => prev + 1);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      generateQuestions(selectedTopic);
    }
  };

  const shareQuiz = async () => {
    const { data, error } = await supabase
      .from('shared_quizzes')
      .insert([{ questions }])
      .select();

    if (data) {
      setShareLink(`${window.location.origin}/quiz/${data[0].id}`);
    }
    if (error) console.error('Sharing failed:', error);
  };

  return (
    <div className="w-full max-w-2xl p-6 bg-white rounded-xl shadow-lg mx-auto">
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-700">
          Total Answered: {totalQuestions} | Score: {score} ({questions.length > 0 ? Math.round((score / totalQuestions) * 100) : 0}%)
        </span>
      </div>

      <div className="flex gap-4 mb-8">
        <input
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter quiz topic..."
        />
        <button
          onClick={() => generateQuestions(selectedTopic)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? <Loader className="animate-spin" /> : 'Update Topic'}
        </button>
      </div>

      {questions.length > 0 && (
        <div className="space-y-6">
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">{questions[currentQuestion].text}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className="p-3 text-left bg-white rounded-lg border hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => rateQuestion(questions[currentQuestion].id, true)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                disabled={ratingStatus[questions[currentQuestion].id] === 'saving'}
              >
                <ThumbsUp className="w-5 h-5" />
              </button>
              <button
                onClick={() => rateQuestion(questions[currentQuestion].id, false)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                disabled={ratingStatus[questions[currentQuestion].id] === 'saving'}
              >
                <ThumbsDown className="w-5 h-5" />
              </button>
              {ratingStatus[questions[currentQuestion].id] === 'saved' && (
                <span className="text-sm text-gray-500">Rating saved!</span>
              )}
            </div>
            <span className="text-sm text-gray-500">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
        </div>
      )}

      {shareLink && (
        <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
          <div className="flex gap-2">
            <input
              value={shareLink}
              readOnly
              className="flex-1 px-4 py-2 bg-white rounded-lg border"
            />
            <button
              onClick={() => navigator.clipboard.writeText(shareLink)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" /> Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
