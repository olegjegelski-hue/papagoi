
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, MessageSquare, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInView } from 'react-intersection-observer';
import { toast } from 'sonner';

export default function ContactForm() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    formType: 'contact',
    website: '' // honeypot field (bots täidavad sageli selle)
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Valideeri vorm
    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      toast.error('Palun täitke kõik kohustuslikud väljad');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsSubmitted(true);
        toast.success(result.message || 'Teie sõnum on edukalt saadetud!');
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: '',
          formType: 'contact',
          website: ''
        });
      } else {
        console.error('API error:', result);
        const errorMessage =
          typeof result.error === 'string'
            ? result.error
            : result?.error?.message || 'Sõnumi saatmisel tekkis viga. Palun proovige uuesti.';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('Contact form error:', error);
      toast.error('Võrguühenduse viga. Palun proovige uuesti.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Kui vorm on edukalt saadetud, näita teavitust
  if (isSubmitted) {
    return (
      <div ref={ref}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
            <Card className="shadow-2xl rounded-2xl overflow-hidden">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Send className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Täname! Teie sõnum on saadetud
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Võtame teiega lähiajal ühendust ja vastame teile esimesel võimalusel.
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6 text-left">
                  <p className="text-gray-700">
                    <strong>Mida järgmisena?</strong>
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                    <li>Kontrollige oma e-posti - saatsime teile kinnituse</li>
                    <li>Vastame tavaliselt 24 tunni jooksul</li>
                    <li>Kiirete küsimuste puhul helistage: <strong>+372 51 27 938</strong></li>
                  </ul>
                </div>
                <Button
                  onClick={() => setIsSubmitted(false)}
                  variant="outline"
                  className="mt-4"
                >
                  Saada uus sõnum
                </Button>
              </CardContent>
            </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8 }}
      >

          <Card className="shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-green-500 text-white text-center">
              <CardTitle className="text-2xl font-bold flex items-center justify-center space-x-3">
                <Mail className="h-6 w-6" />
                <span>Kontaktvorm</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Honeypot field - peidetud inimkasutajale */}
                <div className="absolute -left-[9999px]" aria-hidden="true">
                  <label htmlFor="contact-website">Veebileht</label>
                  <input
                    id="contact-website"
                    type="text"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Nimi *</span>
                    </Label>
                    <Input
                      id="contact-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Teie nimi"
                      required
                      className="form-input pl-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-email" className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>E-mail *</span>
                    </Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="teie@email.ee"
                      required
                      className="form-input pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-phone" className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>Telefon *</span>
                  </Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+372 ..."
                    required
                    className="form-input pl-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-message" className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Teie sõnum *</span>
                  </Label>
                  <Textarea
                    id="contact-message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Kirjutage siia oma küsimus, soov või kommentaar..."
                    rows={6}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-semibold py-3 text-lg"
                >
                  {isSubmitting ? (
                    'Saadame...'
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Saada sõnum
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
  );
}
