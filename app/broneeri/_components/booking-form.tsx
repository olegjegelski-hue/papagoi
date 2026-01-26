
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Mail, Phone, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInView } from 'react-intersection-observer';
import { toast } from 'sonner';

export default function BookingForm() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    timeSlot: '',
    groupSize: '',
    groupType: '',
    message: '',
    website: '' // honeypot
  });

  const timeSlots = [
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const groupTypes = [
    { value: 'perevisit', label: 'Perevisit' },
    { value: 'kool', label: 'Kool/Lasteaed' },
    { value: 'ettevote', label: 'Ettevõte' },
    { value: 'muu', label: 'Muu' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);
        setFormData({
          name: '',
          email: '',
          phone: '',
          date: '',
          timeSlot: '',
          groupSize: '',
          groupType: '',
          message: '',
          website: ''
        });
      } else {
        const errorMessage =
          typeof result.error === 'string'
            ? result.error
            : result?.error?.message || 'Broneeringu saatmisel tekkis viga';
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error('Võrguühenduse viga. Palun proovige uuesti.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const totalPrice = (parseInt(formData.groupSize) || 0) * 10;

  return (
    <section className="py-20 bg-gradient-to-b from-white to-green-50" ref={ref}>
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white text-center rounded-t-lg">
              <CardTitle className="text-2xl font-bold">Broneerimise vorm</CardTitle>
              <p className="opacity-90">Täitke vorm ja võtame teiega ühendust külastuse aja kokkuleppimiseks</p>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Honeypot field - hidden for humans */}
                <div className="absolute -left-[9999px]" aria-hidden="true">
                  <label htmlFor="booking-website">Veebileht</label>
                  <input
                    id="booking-website"
                    type="text"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                {/* Personal Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Nimi *</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Teie nimi"
                      required
                      className="form-input pl-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>E-mail *</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="teie@email.ee"
                      required
                      className="form-input pl-10"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Telefon *</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+372 ..."
                      required
                      className="form-input pl-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="groupSize">Inimeste arv *</Label>
                    <Input
                      id="groupSize"
                      type="number"
                      min="3"
                      max="50"
                      value={formData.groupSize}
                      onChange={(e) => handleInputChange('groupSize', e.target.value)}
                      placeholder="Mitu inimest tuleb?"
                      required
                    />
                    <p className="text-xs text-gray-500">Minimaalne grupi suurus: 3 inimest</p>
                  </div>
                </div>

                {/* Visit Details */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Eelistatud kuupäev</span>
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Eelistatud kellaaeg</span>
                    </Label>
                    <Select value={formData.timeSlot} onValueChange={(value) => handleInputChange('timeSlot', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Valige aeg" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Grupi tüüp</Label>
                    <Select value={formData.groupType} onValueChange={(value) => handleInputChange('groupType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Valige tüüp" />
                      </SelectTrigger>
                      <SelectContent>
                        {groupTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message" className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Lisainfo või soovid</span>
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Kirjutage siia oma soovid, küsimused või lisainfo..."
                    rows={4}
                  />
                </div>

                {/* Price Display */}
                {formData.groupSize && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">Eeldatav hind:</div>
                      <div className="text-3xl font-bold text-green-600">{totalPrice} EUR</div>
                      <div className="text-sm text-gray-600">
                        {formData.groupSize} inimest × 10 EUR = {(parseInt(formData.groupSize) || 0) * 10} EUR
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 text-lg"
                >
                  {isSubmitting ? (
                    'Saadame...'
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Saada broneering
                    </>
                  )}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  <p>Broneeringu esitamisega nõustute meie teenuse tingimustega.</p>
                  <p className="mt-1">Võtame teiega ühendust 24 tunni jooksul kinnituse saamiseks.</p>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
