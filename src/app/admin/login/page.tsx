'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Lock, Mail, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Admin Login Page
 *
 * Features:
 * - Email + password form with validation
 * - Error handling (credentials, session expired)
 * - Loading states
 * - Redirect to /admin/dashboard on success
 * - Consistent styling with app theme (glass-love, Love Symbol colors)
 */

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Call login API route
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json()

        // Handle specific error cases
        if (response.status === 401) {
          setError('Email ou mot de passe incorrect')
        } else if (response.status === 400) {
          setError('Les données fournies sont invalides')
        } else {
          setError(data.error || 'Une erreur est survenue')
        }
        return
      }

      // Success - redirect to dashboard
      router.push('/admin/dashboard')
    } catch (err) {
      console.error('[LOGIN] Error:', err)
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 p-8 glass-love rounded-3xl shadow-premium-lg">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-block">
            <div className={cn(
              'h-16 w-16 mx-auto rounded-full',
              'bg-gradient-to-br from-primary to-primary/80',
              'flex items-center justify-center',
              'shadow-premium-purple'
            )}>
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground">
            Administration
          </h1>
          <p className="text-muted-foreground">
            Connectez-vous à votre espace admin
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur de connexion</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@exemple.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              autoFocus
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              <Lock className="w-4 h-4 inline mr-2" />
              Mot de passe
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Entrez votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 font-medium"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </Button>
        </form>

        {/* Footer Info */}
        <p className="text-center text-xs text-muted-foreground pt-4">
          Accès réservé aux administrateurs.
          Les sessions expirent après 8 heures.
        </p>
      </div>
    </div>
  )
}
