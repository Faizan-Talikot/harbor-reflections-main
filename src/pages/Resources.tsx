import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Phone, Globe, MapPin, ExternalLink } from "lucide-react";

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const regions = [
    { name: "All Regions", value: null },
    { name: "United States", value: "us" },
    { name: "United Kingdom", value: "uk" },
    { name: "Canada", value: "canada" },
    { name: "Australia", value: "australia" },
    { name: "International", value: "international" },
  ];

  const resources = [
    {
      name: "988 Suicide & Crisis Lifeline",
      region: "us",
      type: "Crisis Hotline",
      phone: "988",
      website: "https://988lifeline.org",
      description: "24/7, free and confidential support for people in distress, prevention and crisis resources.",
      availability: "24/7",
    },
    {
      name: "Crisis Text Line",
      region: "us",
      type: "Text Support",
      phone: "Text HOME to 741741",
      website: "https://www.crisistextline.org",
      description: "Free, 24/7 support for those in crisis. Text from anywhere in the USA to reach a trained Crisis Counselor.",
      availability: "24/7",
    },
    {
      name: "SAMHSA National Helpline",
      region: "us",
      type: "Information & Referral",
      phone: "1-800-662-4357",
      website: "https://www.samhsa.gov/find-help/national-helpline",
      description: "Free, confidential, 24/7 treatment referral and information service for mental health and substance abuse.",
      availability: "24/7",
    },
    {
      name: "Samaritans",
      region: "uk",
      type: "Crisis Hotline",
      phone: "116 123",
      website: "https://www.samaritans.org",
      description: "Whatever you're going through, a Samaritan will face it with you. Available 24 hours a day, 365 days a year.",
      availability: "24/7",
    },
    {
      name: "Kids Help Phone",
      region: "canada",
      type: "Youth Support",
      phone: "1-800-668-6868",
      website: "https://kidshelpphone.ca",
      description: "Canada's only 24/7 e-mental health service offering free, confidential support to young people.",
      availability: "24/7",
    },
    {
      name: "Lifeline Australia",
      region: "australia",
      type: "Crisis Hotline",
      phone: "13 11 14",
      website: "https://www.lifeline.org.au",
      description: "24-hour crisis support and suicide prevention services.",
      availability: "24/7",
    },
    {
      name: "Befrienders Worldwide",
      region: "international",
      type: "Directory",
      phone: "Varies by country",
      website: "https://www.befrienders.org",
      description: "Find emotional support helplines around the world. A network of crisis helplines in many countries.",
      availability: "Varies",
    },
  ];

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = !selectedRegion || resource.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
            Resource Hub
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find professional helplines, therapy services, and support communities. Help is always available.
          </p>
        </div>

        {/* Emergency Notice */}
        <Card className="p-6 mb-8 bg-destructive/10 border-destructive/20 animate-fade-in">
          <div className="flex items-start gap-3">
            <Phone className="h-6 w-6 text-destructive mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-heading font-semibold text-foreground mb-2">In Crisis?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                If you or someone you know is in immediate danger, please call emergency services (911 in the US) or go to your nearest emergency room.
              </p>
              <Button variant="destructive" size="sm">
                Call Emergency Services
              </Button>
            </div>
          </div>
        </Card>

        {/* Search and Filter */}
        <div className="max-w-4xl mx-auto mb-12 space-y-6 animate-fade-in-up">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* Region Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            {regions.map((region) => (
              <Badge
                key={region.name}
                variant={selectedRegion === region.value ? "default" : "outline"}
                className="cursor-pointer px-4 py-2 text-sm hover:scale-105 transition-transform"
                onClick={() => setSelectedRegion(region.value)}
              >
                <MapPin className="h-3 w-3 mr-1" />
                {region.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {filteredResources.map((resource, index) => (
            <Card
              key={index}
              className="p-6 hover:shadow-lg transition-all hover:-translate-y-1 animate-fade-in-up border-border/50"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-heading font-semibold text-foreground mb-1">
                    {resource.name}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {resource.type}
                  </Badge>
                </div>
                <Badge variant="outline" className="text-xs">
                  {resource.availability}
                </Badge>
              </div>

              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                {resource.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">{resource.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-primary" />
                  <a
                    href={resource.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    Visit Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No resources found. Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;
