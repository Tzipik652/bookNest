import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { ArrowLeft, Mail, Send, MessageSquare, MapPin, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUserStore } from '../store/useUserStore';

export function ContactPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const { user: currentUser } = useUserStore();
  const discoverRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (!loading) {
      if (firstLoad) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setFirstLoad(false);
      } else if (discoverRef.current) {
        discoverRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [loading]);

const handleSubmit = async (e: any) => {
  e.preventDefault();

  if (!formData.subject || !formData.message) {
    toast.error('Please fill in all fields');
    return;
  }

  setIsSubmitting(true);

  try {
    const res = await fetch("http://localhost:5000/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: currentUser?.name,
        email: currentUser?.email,
        subject: formData.subject,
        message: formData.message
      })
    });

    if (!res.ok) throw new Error();

    toast.success("Message sent successfully!");
    setMessageSent(true);
    setFormData({ subject: "", message: "" });

  } catch (err) {
    toast.error("Failed to send message");
  }

  setIsSubmitting(false);
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  if (!currentUser?.name || !currentUser?.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center space-y-4">
            <h2 className="text-red-600">You must be logged in</h2>
            <p className="text-gray-600">
              You need a valid account with name and email to send a message.
            </p>
            <Button onClick={() => navigate("/login")} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="mb-8 flex items-center gap-3">
          <div className="bg-green-100 p-3 rounded-lg">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h1 className="mb-1">Contact Us</h1>
            <p className="text-gray-600">We'd love to hear from you</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Form */}
          {messageSent ? (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <div className="mb-4 flex justify-center">
                    <div className="bg-green-100 p-4 rounded-full">
                      <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                  </div>
                  <h2 className="mb-3 text-green-800">Message Sent Successfully!</h2>
                  <p className="text-green-700 mb-6 max-w-md mx-auto">
                    Thank you for reaching out to us. We've received your message and will get back to you as soon as possible.
                  </p>
                  <Button
                    onClick={() => setMessageSent(false)}
                    variant="outline"
                    className="border-green-600 text-green-700 hover:bg-green-100"
                  >
                    Send Another Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="md:col-span-2">
              <Card>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Your name"
                          value={formData.name}
                          onChange={handleChange}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div> */}

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="What is this about?"
                        value={formData.subject}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us more..."
                        className="min-h-[200px]"
                        value={formData.message}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full gap-2"
                      disabled={isSubmitting}
                    >
                      <Send className="h-4 w-4" />
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="mb-1">Email</h3>
                    <p className="text-sm text-gray-600">booknestwebsite@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="mb-1">Location</h3>
                    <p className="text-sm text-gray-600">
                      123 Book Street<br />
                      Reading City, RC 12345<br />
                      United States
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-3">Frequently Asked Questions</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Before reaching out, you might find answers to common questions in our FAQ section.
                </p>
                <Button variant="outline" className="w-full">
                  View FAQs
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}