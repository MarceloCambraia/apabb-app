import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Trophy } from "lucide-react";

interface DonationCardProps {
  title: string;
  amount: string;
  description: string;
  impact: string;
  isRecommended?: boolean;
  onSelect: (amount: string) => void;
}

export function DonationCard({ 
  title, 
  amount, 
  description, 
  impact, 
  isRecommended = false,
  onSelect 
}: DonationCardProps) {
  return (
    <Card className={`relative transition-smooth hover:scale-105 hover:shadow-medium ${
      isRecommended ? 'ring-2 ring-secondary shadow-medium' : 'shadow-soft'
    }`}>
      {isRecommended && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
          <div className="gradient-secondary px-3 py-1 rounded-full text-xs font-semibold text-secondary-foreground flex items-center gap-1">
            <Trophy className="w-3 h-3" />
            Mais Popular
          </div>
        </div>
      )}
      
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
        <div className="text-3xl font-bold text-primary">R$ {amount}</div>
        <CardDescription className="text-muted-foreground">{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <Users className="w-4 h-4 text-secondary" />
          <span>{impact}</span>
        </div>
        
        <Button 
          onClick={() => onSelect(amount)}
          className="w-full"
          variant={isRecommended ? "hero" : "donation"}
        >
          <Heart className="w-4 h-4" />
          Doar Agora
        </Button>
      </CardContent>
    </Card>
  );
}