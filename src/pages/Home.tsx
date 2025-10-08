import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Shield, Users, Sparkles } from "lucide-react";

const Home = () => {
  const mentalHealthFacts = [
    {
      icon: Heart,
      title: "You're Not Alone",
      description: "1 in 5 adults experience mental health challenges each year. Your feelings are valid, and help is available.",
    },
    {
      icon: Shield,
      title: "It's Okay to Ask for Help",
      description: "Seeking support is a sign of strength, not weakness. Taking the first step towards wellness takes courage.",
    },
    {
      icon: Users,
      title: "Community Matters",
      description: "Connection and support from others can make a profound difference in your mental health journey.",
    },
    {
      icon: Sparkles,
      title: "Hope is Real",
      description: "Recovery is possible. Millions of people live fulfilling lives while managing mental health conditions.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-6 leading-tight">
              It's okay to feel adrift.
              <br />
              <span className="text-primary">Your safe harbor is here.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A gentle space to understand your feelings, find resources, and remember you're not alone.
            </p>
            <Link to="/check-in">
              <Button
                size="lg"
                className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 animate-glow"
              >
                Start Your Personal Check-in
              </Button>
            </Link>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl animate-pulse-soft" />
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Project Safe Harbor exists to create a warm, judgment-free space where individuals
              facing mental health challenges can take their first, private step toward
              self-awareness. We believe that understanding your emotional state is the beginning
              of healing, and we're here to gently guide you toward the professional support and
              resources you deserve.
            </p>
          </div>
        </div>
      </section>

      {/* Mental Wellness Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              The Importance of Mental Wellness
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Mental health is just as important as physical health. Here's what you should know:
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {mentalHealthFacts.map((fact, index) => {
              const Icon = fact.icon;
              return (
                <Card
                  key={index}
                  className="p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1 animate-fade-in-up border-border/50 bg-card"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                    {fact.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {fact.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Ready to take the first step?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Our gentle check-in tool is here to help you understand where you are today.
            </p>
            <Link to="/check-in">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-full">
                Begin Your Journey
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
