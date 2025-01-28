// Security-enhanced answer handling
const handleAnswer = async (selectedIndex: number) => {
  try {
    if (questions[currentQuestion].correctAnswer === selectedIndex) {
      if (user?.id) {
        await incrementProgress(user.id);
        setProgress(prev => {
          const newTotal = prev + 1;
          if (user &amp;&amp; newTotal >= 15) {
            setShowLimitWarning(true);
          }
          return newTotal;
        });
      }
      // Rest of success logic
    }
  } catch (err) {
    console.error('Progress update failed:', err);
    setError('Failed to save progress - please try again');
  }
};

// Enhanced validation
const parseAIResponse = (response: string) => {
  try {
    const sanitized = response.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    const parsed = QuestionSchema.safeParse(JSON.parse(sanitized));
    
    if (!parsed.success) {
      throw new Error(`Validation failed: ${parsed.error.message}`);
    }

    return parsed.data.questions.map((q) => ({
      ...q,
      id: crypto.randomUUID(),
      topic: DOMPurify.sanitize(topic)
    }));
  } catch (err) {
    console.error('Response parsing error:', err);
    throw new Error('Invalid question format from AI');
  }
};
