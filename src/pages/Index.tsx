import { useState, useEffect } from "react";
import { Calendar, Heart, TrendingUp, Plus, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { format, addDays, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

const Index = () => {
  const [currentCycle] = useState({
    startDate: new Date(2025, 0, 5), // 5 janvier 2025
    expectedPeriod: new Date(2025, 1, 2), // 2 février 2025  
    expectedOvulation: new Date(2025, 0, 19), // 19 janvier 2025
    cycleLength: 28
  });

  const today = new Date();
  const daysSinceStart = differenceInDays(today, currentCycle.startDate);
  const daysUntilPeriod = differenceInDays(currentCycle.expectedPeriod, today);
  const daysUntilOvulation = differenceInDays(currentCycle.expectedOvulation, today);
  const cycleProgress = Math.min((daysSinceStart / currentCycle.cycleLength) * 100, 100);

  const getCurrentPhase = () => {
    if (daysSinceStart <= 5) return { name: "Menstruation", color: "bg-red-500" };
    if (daysSinceStart <= 13) return { name: "Phase folliculaire", color: "bg-blue-500" };
    if (daysSinceStart <= 16) return { name: "Ovulation", color: "bg-green-500" };
    return { name: "Phase lutéale", color: "bg-yellow-500" };
  };

  const currentPhase = getCurrentPhase();

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="INTIMITY" />
      
      <div className="p-4 space-y-6 max-w-md mx-auto">
        {/* Cycle principal */}
        <Card className="gradient-card shadow-soft border-0 overflow-hidden">
          <CardHeader className="gradient-primary text-primary-foreground">
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Cycle actuel
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Jour {daysSinceStart + 1} de votre cycle
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression du cycle</span>
                <span>{Math.round(cycleProgress)}%</span>
              </div>
              <Progress value={cycleProgress} className="h-2" />
            </div>
            
            <div className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", currentPhase.color)}></div>
              <span className="font-medium">{currentPhase.name}</span>
            </div>
          </CardContent>
        </Card>

        {/* Prochains événements */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-card border-0">
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Prochaines règles</p>
              <p className="font-bold text-lg">
                {daysUntilPeriod > 0 ? `${daysUntilPeriod}j` : "Aujourd'hui"}
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-card border-0">
            <CardContent className="p-4 text-center">
              <Droplets className="h-8 w-8 text-accent mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Ovulation</p>
              <p className="font-bold text-lg">
                {daysUntilOvulation > 0 ? `${daysUntilOvulation}j` : 
                 daysUntilOvulation === 0 ? "Aujourd'hui" : "Passée"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-lg">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start gap-3 h-12" variant="outline">
              <Plus className="h-5 w-5 text-primary" />
              Ajouter des symptômes
            </Button>
            <Button className="w-full justify-start gap-3 h-12" variant="outline">
              <Heart className="h-5 w-5 text-primary" />
              Humeur du jour
            </Button>
            <Button className="w-full justify-start gap-3 h-12" variant="outline">
              <TrendingUp className="h-5 w-5 text-primary" />
              Voir les tendances
            </Button>
          </CardContent>
        </Card>

        {/* Rappels aujourd'hui */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-lg">Rappels d'aujourd'hui</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Boire de l'eau</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                08:00
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-accent/5 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-sm">Prendre vitamines</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                09:00
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Index;
