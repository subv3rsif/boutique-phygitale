import { auth, signOut } from "@/lib/auth/config"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Calendar, LogOut } from "lucide-react"

/**
 * Profile Page - Protected
 *
 * Features:
 * - Protected route (redirect to /connexion if not logged in)
 * - Display user info (name, email, avatar)
 * - Sign out button
 * - Premium glass design
 */

export default async function ProfilPage() {
  const session = await auth()

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect('/connexion')
  }

  const { user } = session

  // Get user initials for avatar fallback
  const initials = user.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || user.email?.[0]?.toUpperCase() || '?'

  return (
    <div className="container py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="font-display text-4xl font-bold">Mon Profil</h1>
          <p className="text-muted-foreground">
            Gérez vos informations personnelles
          </p>
        </div>

        {/* Profile Card */}
        <Card className="glass-love border-primary/20">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                <AvatarImage src={user.image || ''} alt={user.name || ''} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white text-2xl font-display">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="font-display text-2xl">
              {user.name || 'Utilisateur'}
            </CardTitle>
            <CardDescription>Membre Boutique 1885</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* User Info */}
            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-center gap-3 p-4 rounded-xl glass-purple border border-primary/10">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium truncate">{user.email}</p>
                </div>
              </div>

              {/* Member Since */}
              {user.emailVerified && (
                <div className="flex items-center gap-3 p-4 rounded-xl glass-purple border border-primary/10">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">Membre depuis</p>
                    <p className="font-medium">
                      {new Date(user.emailVerified).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 space-y-3">
              {/* My Orders (future feature) */}
              <Button
                variant="outline"
                className="w-full justify-start h-12"
                disabled
              >
                <span className="text-muted-foreground">Mes commandes (bientôt)</span>
              </Button>

              {/* Sign Out */}
              <form
                action={async () => {
                  "use server"
                  await signOut({ redirectTo: "/" })
                }}
              >
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full justify-start h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Se déconnecter
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
