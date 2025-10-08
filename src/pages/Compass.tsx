import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Brain, Heart, Users, Briefcase } from "lucide-react";

const Compass = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { name: "All", value: null },
    { name: "Stress", value: "stress" },
    { name: "Depression", value: "depression" },
    { name: "Anxiety", value: "anxiety" },
    { name: "Relationships", value: "relationships" },
  ];

  const articles = [
    {
      title: "Understanding Anxiety: What Your Mind is Trying to Tell You",
      excerpt: "Anxiety is more than just worry. Learn to recognize the signs and discover gentle ways to manage anxious thoughts.",
      category: "anxiety",
      tags: ["Mental Health", "Coping Strategies"],
      icon: Brain,
      readTime: "5 min read",
    },
    {
      title: "Tips for Managing Daily Stress",
      excerpt: "Simple, evidence-based techniques you can use today to reduce stress and find moments of peace in your routine.",
      category: "stress",
      tags: ["Self-Care", "Wellness"],
      icon: Heart,
      readTime: "4 min read",
    },
    {
      title: "How to Support a Friend in Crisis",
      excerpt: "Learn compassionate ways to be there for someone you care about who may be struggling with their mental health.",
      category: "relationships",
      tags: ["Support", "Community"],
      icon: Users,
      readTime: "6 min read",
    },
    {
      title: "Depression: Breaking the Silence",
      excerpt: "Understanding depression is the first step to healing. Explore what depression feels like and why seeking help matters.",
      category: "depression",
      tags: ["Mental Health", "Awareness"],
      icon: Brain,
      readTime: "7 min read",
    },
    {
      title: "Work-Life Balance and Mental Wellness",
      excerpt: "Discover how to set boundaries and create space for both productivity and self-care in your professional life.",
      category: "stress",
      tags: ["Work-Life", "Balance"],
      icon: Briefcase,
      readTime: "5 min read",
    },
    {
      title: "The Power of Connection",
      excerpt: "Why human connection is vital for mental health and how to nurture meaningful relationships even when it feels hard.",
      category: "relationships",
      tags: ["Community", "Support"],
      icon: Users,
      readTime: "4 min read",
    },
  ];

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
            The Compass
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore articles, tips, and insights to help you navigate your mental wellness journey.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="max-w-4xl mx-auto mb-12 space-y-6 animate-fade-in-up">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Badge
                key={category.name}
                variant={selectedCategory === category.value ? "default" : "outline"}
                className="cursor-pointer px-4 py-2 text-sm hover:scale-105 transition-transform"
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {filteredArticles.map((article, index) => {
            const Icon = article.icon;
            return (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group animate-fade-in-up border-border/50"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {article.excerpt}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {article.tags.map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{article.readTime}</p>
              </Card>
            );
          })}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No articles found. Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compass;
