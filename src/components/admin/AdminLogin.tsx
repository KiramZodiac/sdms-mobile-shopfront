import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { 
  Loader2, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle,
  Mail,
  Lock
} from 'lucide-react';

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export const AdminLogin = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signIn, signingIn, admin } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (admin) {
      const intendedDestination = sessionStorage.getItem('intended_destination');
      const redirectTo = intendedDestination || '/admin/dashboard';
      sessionStorage.removeItem('intended_destination');
      navigate(redirectTo, { replace: true });
    }
  }, [admin, navigate]);

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('admin_remembered_email');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail, rememberMe: true }));
    }
  }, []);

  /**
   * Validates form inputs
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signIn(formData.email, formData.password);
      
      if (result.success) {
        // Handle remember me
        if (formData.rememberMe) {
          localStorage.setItem('admin_remembered_email', formData.email);
        } else {
          localStorage.removeItem('admin_remembered_email');
        }
        
        // Navigation is handled by the useEffect above
      } else if (result.error) {
        setErrors({ general: result.error.message });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles input changes with validation
   */
  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Gets error styling for input fields
   */
  const getInputClassName = (field: keyof FormErrors) => {
    return errors[field] ? 'border-red-500 focus:border-red-500' : '';
  };

  const isLoading = signingIn || isSubmitting;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <ShieldCheck className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
          <CardDescription>
            Sign in to access the administrative dashboard
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`pl-10 ${getInputClassName('email')}`}
                  disabled={isLoading}
                  autoComplete="email"
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && (
                <div id="email-error" className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`pl-10 pr-10 ${getInputClassName('password')}`}
                  disabled={isLoading}
                  autoComplete="current-password"
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <div id="password-error" className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password}
                </div>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => handleInputChange('rememberMe', checked === true)}
                disabled={isLoading}
              />
              <Label 
                htmlFor="remember" 
                className="text-sm font-normal cursor-pointer select-none"
              >
                Remember my email
              </Label>
            </div>

            {/* General Error */}
            {errors.general && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>

            {/* Additional Help */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Having trouble signing in?{' '}
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                  onClick={() => {
                    // TODO: Implement forgot password or contact admin
                    alert('Please contact your system administrator for password reset.');
                  }}
                >
                  Contact Support
                </button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Success Notification */}
      {admin && (
        <div className="fixed top-4 right-4 z-50">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Successfully signed in! Redirecting...
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

// Additional utility component for forgot password (future implementation)
export const ForgotPasswordDialog = () => {
  // TODO: Implement forgot password functionality
  return null;
};