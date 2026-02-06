'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, QrCode, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

type ValidationResult = {
  success: boolean;
  message?: string;
  order?: {
    id: string;
    customerEmail: string;
    grandTotalCents: number;
    createdAt: string;
  };
  error?: string;
  errorCode?: number;
  usedAt?: string;
  usedBy?: string;
  currentStatus?: string;
};

export function QRScanner() {
  const [token, setToken] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on mount and after validation
  useEffect(() => {
    inputRef.current?.focus();
  }, [result]);

  const handleValidate = async () => {
    if (!token.trim()) {
      toast.error('Veuillez saisir un token');
      inputRef.current?.focus();
      return;
    }

    setIsValidating(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/pickup/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || 'Retrait validé avec succès',
          order: data.order,
        });
        toast.success('Retrait validé !', {
          description: 'La commande a été marquée comme retirée',
        });
        // Clear token input after successful validation
        setTimeout(() => {
          setToken('');
          setResult(null);
        }, 3000);
      } else {
        setResult({
          success: false,
          error: data.error || 'Erreur de validation',
          errorCode: response.status,
          usedAt: data.usedAt,
          usedBy: data.usedBy,
          currentStatus: data.currentStatus,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        error: 'Erreur de connexion au serveur',
        errorCode: 500,
      });
      toast.error('Erreur', {
        description: 'Impossible de valider le token',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isValidating) {
      handleValidate();
    }
  };

  // Auto-validate on paste for better UX
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText.length > 20) {
      // Likely a token, auto-validate after paste
      setTimeout(() => handleValidate(), 100);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 pb-8">
      {/* Token Input Section - Mobile-First */}
      <div className="space-y-4">
        <div className="space-y-3">
          <Label
            htmlFor="token"
            className="text-base font-semibold text-gray-900"
          >
            Token de Retrait
          </Label>

          {/* Large, touch-friendly input */}
          <Input
            ref={inputRef}
            id="token"
            type="text"
            placeholder="Collez le token ici"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyPress={handleKeyPress}
            onPaste={handlePaste}
            disabled={isValidating}
            className="h-14 text-lg font-mono tracking-tight px-4 text-center"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
          />

          {/* Full-width validation button */}
          <Button
            onClick={handleValidate}
            disabled={isValidating || !token.trim()}
            className="w-full h-12 text-base font-semibold"
            size="lg"
          >
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Validation en cours...
              </>
            ) : (
              <>
                <QrCode className="mr-2 h-5 w-5" />
                Valider le retrait
              </>
            )}
          </Button>

          <p className="text-sm text-center text-muted-foreground leading-relaxed">
            Le client peut vous montrer le QR code sur son téléphone ou dans l&apos;email reçu
          </p>
        </div>
      </div>

      {/* Validation Result - Enhanced Mobile-Friendly Cards */}
      {result && (
        <div
          className="animate-in fade-in-50 slide-in-from-top-5 duration-300"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {result.success ? (
            /* Success State - Green Card */
            <div className="rounded-lg border-2 border-green-200 bg-green-50 p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="rounded-full bg-green-100 p-3">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-green-900">
                      {result.message}
                    </h3>
                  </div>

                  {result.order && (
                    <>
                      <div className="h-px bg-green-200" />

                      {/* Order Details */}
                      <div className="space-y-3">
                        {/* Order ID & Amount */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-md bg-white/50 p-3">
                            <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-1">
                              Commande
                            </p>
                            <p className="font-mono text-base font-semibold text-green-900">
                              #{result.order.id.slice(0, 8).toUpperCase()}
                            </p>
                          </div>
                          <div className="rounded-md bg-white/50 p-3">
                            <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-1">
                              Montant
                            </p>
                            <p className="text-base font-bold text-green-900">
                              {formatCurrency(result.order.grandTotalCents)}
                            </p>
                          </div>
                        </div>

                        {/* Customer Email */}
                        <div className="rounded-md bg-white/50 p-3">
                          <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-1">
                            Client
                          </p>
                          <p className="text-sm font-semibold text-green-900 break-all">
                            {result.order.customerEmail}
                          </p>
                        </div>

                        {/* Order Date */}
                        <div className="rounded-md bg-white/50 p-3">
                          <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-1">
                            Commandée le
                          </p>
                          <p className="text-sm font-semibold text-green-900">
                            {new Date(result.order.createdAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Error State - Red Card */
            <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="rounded-full bg-red-100 p-3">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-red-900">
                        Validation échouée
                      </h3>
                      {result.errorCode && (
                        <Badge
                          variant="outline"
                          className="border-red-300 bg-red-100 text-red-800 font-bold text-xs"
                        >
                          {result.errorCode}
                        </Badge>
                      )}
                    </div>
                    <p className="text-base text-red-800 font-medium">
                      {result.error}
                    </p>
                  </div>

                  {/* Additional Error Details */}
                  {(result.usedAt || result.currentStatus) && (
                    <>
                      <div className="h-px bg-red-200" />

                      <div className="space-y-2">
                        {result.usedAt && (
                          <div className="rounded-md bg-white/50 p-3">
                            <p className="text-xs font-medium text-red-700 uppercase tracking-wide mb-1">
                              Déjà retiré le
                            </p>
                            <p className="text-sm font-semibold text-red-900">
                              {new Date(result.usedAt).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            {result.usedBy && (
                              <p className="text-xs text-red-800 mt-1">
                                Par : {result.usedBy}
                              </p>
                            )}
                          </div>
                        )}

                        {result.currentStatus && (
                          <div className="rounded-md bg-white/50 p-3">
                            <p className="text-xs font-medium text-red-700 uppercase tracking-wide mb-1">
                              Statut actuel
                            </p>
                            <p className="text-sm font-semibold text-red-900">
                              {result.currentStatus}
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collapsible Help Section */}
      <div className="rounded-lg border border-gray-200 bg-gray-50">
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-100 active:bg-gray-200"
          aria-expanded={showHelp}
          aria-controls="help-content"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-gray-600" />
            <h4 className="font-semibold text-base text-gray-900">
              Besoin d&apos;aide ?
            </h4>
          </div>
          {showHelp ? (
            <ChevronUp className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-600" />
          )}
        </button>

        {showHelp && (
          <div
            id="help-content"
            className="border-t border-gray-200 p-4 space-y-4 animate-in fade-in-50 slide-in-from-top-2 duration-200"
          >
            <div>
              <h5 className="font-semibold text-sm text-gray-900 mb-3">
                Codes d&apos;erreur courants
              </h5>

              <div className="space-y-3">
                {/* Error 404 */}
                <div className="flex items-start gap-3 p-3 rounded-md bg-white border border-gray-200">
                  <Badge
                    variant="outline"
                    className="border-orange-300 bg-orange-50 text-orange-800 font-bold text-xs flex-shrink-0 mt-0.5"
                  >
                    404
                  </Badge>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Token invalide</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Le code n&apos;existe pas. Vérifiez qu&apos;il est copié correctement.
                    </p>
                  </div>
                </div>

                {/* Error 410 */}
                <div className="flex items-start gap-3 p-3 rounded-md bg-white border border-gray-200">
                  <Badge
                    variant="outline"
                    className="border-purple-300 bg-purple-50 text-purple-800 font-bold text-xs flex-shrink-0 mt-0.5"
                  >
                    410
                  </Badge>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Token expiré</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Les QR codes sont valables 30 jours après la commande.
                    </p>
                  </div>
                </div>

                {/* Error 409 */}
                <div className="flex items-start gap-3 p-3 rounded-md bg-white border border-gray-200">
                  <Badge
                    variant="outline"
                    className="border-blue-300 bg-blue-50 text-blue-800 font-bold text-xs flex-shrink-0 mt-0.5"
                  >
                    409
                  </Badge>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Déjà utilisé</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Cette commande a déjà été retirée. Vérifiez la date et l&apos;utilisateur.
                    </p>
                  </div>
                </div>

                {/* Error 400 */}
                <div className="flex items-start gap-3 p-3 rounded-md bg-white border border-gray-200">
                  <Badge
                    variant="outline"
                    className="border-red-300 bg-red-50 text-red-800 font-bold text-xs flex-shrink-0 mt-0.5"
                  >
                    400
                  </Badge>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Commande non payée</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Le client doit d&apos;abord finaliser son paiement.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="pt-3 border-t border-gray-200">
              <h5 className="font-semibold text-sm text-gray-900 mb-2">
                Conseils rapides
              </h5>
              <ul className="space-y-2 text-xs text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>Le token se colle automatiquement depuis le QR code scanné</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>Appuyez sur Entrée pour valider rapidement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>En cas de doute, vérifiez l&apos;email du client dans les détails de la commande</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
