
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { motion } from "@/components/ui/motion";
import emailjs from "emailjs-com";

const Register = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    course: "",
    experience: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const courses = [
    "Full Stack Development",
    "Data Science & Analytics",
    "Java Programming",
    "Aptitude Training",
    "Cloud Computing (AWS)",
    "Mobile App Development",
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  // ... validation code ...

  const emailParams = {
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    course: formData.course,
    experience: formData.experience,
    message: formData.message,
    time: new Date().toLocaleString(),
  };

  try {
    await emailjs.send(
      "service_n9z5rzg",     // replace with actual service ID
      "template_a0ke5pf",    // replace with registration template ID
      emailParams,
      "ngbxDDU3E7ue3VkLR"        // replace with your public API key
    );
    
    toast({
      title: "Registration Successful! 🎉",
      description: "Thank you for registering! Our team will contact you within 24 hours.",
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      course: "",
      experience: "",
      message: "",
    });
  } catch (error) {
    toast({
      title: "Registration Failed",
      description: "Something went wrong. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with animation */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Register for Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Take the first step towards your tech career. Register for a free demo 
            session and discover how Tech Miya can transform your future.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Registration Form with staggered animation */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-white shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">Demo Registration</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll contact you to schedule your personalized demo session.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                      className="transition-all duration-300 focus:ring-2 focus:ring-purple-500"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      className="transition-all duration-300 focus:ring-2 focus:ring-purple-500"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                      className="transition-all duration-300 focus:ring-2 focus:ring-purple-500"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Label htmlFor="course">Course Interested In *</Label>
                    <Select value={formData.course} onValueChange={(value) => handleInputChange("course", value)}>
                      <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-purple-500">
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course} value={course}>
                            {course}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Label htmlFor="experience">Programming Experience</Label>
                    <Select value={formData.experience} onValueChange={(value) => handleInputChange("experience", value)}>
                      <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-purple-500">
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Complete Beginner</SelectItem>
                        <SelectItem value="basic">Basic Knowledge</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Label htmlFor="message">Additional Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your goals, questions, or anything else you'd like us to know..."
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      rows={4}
                      className="transition-all duration-300 focus:ring-2 focus:ring-purple-500"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 text-lg transition-all duration-300"
                    >
                      {isSubmitting ? "Submitting..." : "Register for Demo"}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Benefits Section with staggered animation */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg transition-transform duration-300 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="text-xl">What's Included in Your Demo?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { icon: "✨", title: "Personalized Course Overview", desc: "Get a detailed walkthrough of your chosen course curriculum" },
                    { icon: "💼", title: "Career Guidance", desc: "Learn about job opportunities and salary expectations" },
                    { icon: "🎯", title: "Learning Path Assessment", desc: "Get a customized learning plan based on your background" },
                    { icon: "📞", title: "One-on-One Consultation", desc: "Direct interaction with our expert counselors" }
                  ].map((item, index) => (
                    <motion.div 
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + (index * 0.1) }}
                      className="flex items-start space-x-3"
                    >
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <h4 className="font-semibold">{item.title}</h4>
                        <p className="text-blue-100">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="hover:shadow-lg transition-transform duration-300 hover:-translate-y-1"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Why Students Choose Tech Miya</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Job Placement Rate", value: "95%" },
                    { label: "Average Salary Increase", value: "300%" },
                    { label: "Student Satisfaction", value: "4.9/5" },
                    { label: "Industry Partnerships", value: "50+" }
                  ].map((stat, index) => (
                    <motion.div 
                      key={stat.label}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + (index * 0.1) }}
                      className="flex items-center justify-between"
                    >
                      <span>{stat.label}</span>
                      <span className="font-bold text-green-600">{stat.value}</span>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">🎁</span>
                    <div>
                      <h4 className="font-semibold text-yellow-800">Limited Time Offer</h4>
                      <p className="text-yellow-700">
                        Register now and get <Badge className="ml-1 bg-yellow-500">20% off</Badge> on your course enrollment!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
