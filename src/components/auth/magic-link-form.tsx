'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Sparkles, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Magic Link Form Component
 *
 * Passwordless authentication via email magic link
 * - User enters email
 * - Receives unique link via email
 * - Click link → auto-login
 * - Zero password management
 */

export function MagicLinkForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('resend', {
        email,
        redirect: false,
      })

      if (result?.error) {
        setError('Erreur lors de l\'envoi de l\'email')
        setIsLoading(false)
      } else {
        setIsSubmitted(true)
      }
    } catch (err) {
      setError('Une erreur est survenue')
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="space-y-4 text-center p-6 rounded-2xl glass-love border border-primary/20">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-premium-purple">
          <Mail className="h-8 w-8 text-white" />
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-2xl font-bold">Email envoyé !</h3>
          <p className="text-muted-foreground">
            Nous avons envoyé un lien de connexion à
          </p>
          <p className="font-medium text-primary">{email}</p>
        </div>
        <div className="pt-4 space-y-2 text-sm text-muted-foreground">
          <p>✨ Cliquez sur le lien dans l'email pour vous connecter</p>
          <p>🕐 Le lien expire dans 24 heures</p>
          <p>📬 Vérifiez vos spams si vous ne le voyez pas</p>
        </div>
        <Button
          variant="ghost"
          onClick={() => {
            setIsSubmitted(false)
            setEmail('')
          }}
          className="mt-4"
        >
          Renvoyer à une autre adresse
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className={cn(
              "pl-10 h-12",
              "glass-purple border-primary/20",
              "focus:border-primary/40 focus:ring-primary/20"
            )}
          />
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className={cn(
          "w-full h-12",
          "bg-gradient-to-r from-primary to-primary/80",
          "hover:from-primary/90 hover:to-primary/70",
          "shadow-premium-purple",
          "transition-all duration-300",
          "group"
        )}
      >
        {isLoading ? (
          <>
            <Sparkles className="mr-2 h-5 w-5 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Envoyer le lien magique
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Un email avec un lien de connexion unique vous sera envoyé.<br />
        Aucun mot de passe nécessaire ✨
      </p>
    </form>
  )
}
