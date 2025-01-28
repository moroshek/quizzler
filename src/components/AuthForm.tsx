// ... (existing imports)

const passwordRequirements = [
  { id: 1, rule: 'At least 8 characters' },
  { id: 2, rule: 'One uppercase letter' },
  { id: 3, rule: 'One lowercase letter' },
  { id: 4, rule: 'One number' },
];

export function AuthForm({ onSuccessfulAuth }: AuthFormProps) {
  // ... (existing state)

  useEffect(() => {
    const checkPasswordValidity = () => {
      const requirements = [
        (password.length >= 8),
        /[A-Z]/.test(password),
        /[a-z]/.test(password),
        /[0-9]/.test(password),
      ];
      
      setIsPasswordValid(requirements.every((req) => req));
      
      // Return new array instead of mutating
      return requirements.map((met, index) => ({
        ...passwordRequirements[index],
        met
      }));
    };

    checkPasswordValidity();
  }, [password]);

  // ... rest of the component
}
