import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import intimityLogo from "@/assets/intimity-logo.png";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="w-full text-center shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4">
              <img 
                src={intimityLogo} 
                alt="INTIMITY" 
                className="h-24 w-24 mx-auto animate-fade-in"
              />
            </div>
            <CardTitle className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
              INTIMITY
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Votre compagnon pour un suivi menstruel personnalisé
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Suivi personnalisé de votre cycle</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Prédictions intelligentes</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Conseils et accompagnement</span>
              </div>
            </div>
            
            <div className="space-y-3 pt-4">
              <Button 
                onClick={() => navigate('/onboarding')} 
                className="w-full h-12 text-lg gradient-primary hover:shadow-lg transition-all duration-300"
              >
                Découvrir INTIMITY
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/auth')} 
                className="w-full"
              >
                J'ai déjà un compte
              </Button>
              
              <p className="text-xs text-gray-500">
                Gratuit • Confidentiel • Sécurisé
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}