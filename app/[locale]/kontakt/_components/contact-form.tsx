
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, MessageSquare, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useInView } from 'react-intersection-observer';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export default function ContactForm() {
  const t = useTranslations('ContactForm');
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    formType: 'contact',
    website: '', // honeypot field (bots täidavad sageli selle)
    consent: false // GDPR nõusolek
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      toast.error(t('errorFillRequired'));
      return;
    }

    // Valideeri nõusolek
    if (!formData.consent) {
      toast.error(t('errorConsent'));
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
        toast.success(result.message || t('successTitle'));
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: '',
          formType: 'contact',
          website: '',
          consent: false
        });
      } else {
        console.error('API error:', result);
        let errorMessage =
          typeof result.error === 'string'
            ? result.error
            : result?.error?.message || t('errorSend');
        // Kui server tagastab details (debug), näita ka seda
        if (result?.error?.details) {
          errorMessage += ` (${result.error.details})`;
        }
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('Contact form error:', error);
      toast.error(t('errorNetwork'));
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
                <div className="w-20 h-20 bg-papagoi-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Send className="h-10 w-10 text-papagoi-green" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {t('successTitle')}
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  {t('successMessage')}
                </p>
                <div className="bg-papagoi-blue-50 border-l-4 border-papagoi-blue p-4 rounded mb-6 text-left">
                  <p className="text-gray-700">
                    <strong>{t('nextStepsTitle')}</strong>
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                    <li>{t('nextStep1')}</li>
                    <li>{t('nextStep2')}</li>
                    <li>{t('nextStep3')} <strong>+372 51 27 938</strong></li>
                  </ul>
                </div>
                <Button
                  onClick={() => setIsSubmitted(false)}
                  variant="outline"
                  className="mt-4"
                >
                  {t('sendAgain')}
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
            <CardHeader className="bg-gradient-to-r from-papagoi-blue to-papagoi-green text-white text-center">
              <CardTitle className="text-2xl font-bold flex items-center justify-center space-x-3">
                <Mail className="h-6 w-6" />
                <span>{t('title')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Honeypot field - peidetud inimkasutajale */}
                <div className="absolute -left-[9999px]" aria-hidden="true">
                  <label htmlFor="contact-website">{t('honeypotLabel')}</label>
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
                      <span>{t('labelName')}</span>
                    </Label>
                    <Input
                      id="contact-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder={t('placeholderName')}
                      required
                      className="form-input pl-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-email" className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{t('labelEmail')}</span>
                    </Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder={t('placeholderEmail')}
                      required
                      className="form-input pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-phone" className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>{t('labelPhone')}</span>
                  </Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder={t('placeholderPhone')}
                    required
                    className="form-input pl-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-message" className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>{t('labelMessage')}</span>
                  </Label>
                  <Textarea
                    id="contact-message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder={t('placeholderMessage')}
                    rows={6}
                    required
                  />
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="contact-consent"
                    checked={formData.consent}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, consent: checked === true }))}
                    className="mt-1"
                  />
                  <Label htmlFor="contact-consent" className="text-sm text-gray-700 cursor-pointer">
                    {t('consent')}
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-papagoi-blue to-papagoi-green hover:from-papagoi-blue-600 hover:to-papagoi-green-600 text-white font-semibold py-3 text-lg"
                >
                  {isSubmitting ? (
                    t('submitting')
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      {t('submit')}
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
