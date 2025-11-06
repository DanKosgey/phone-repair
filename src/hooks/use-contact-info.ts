import { useState, useEffect } from 'react';

interface ContactInfo {
  phone: string;
  email: string;
  hours: string;
}

const DEFAULT_CONTACT_INFO: ContactInfo = {
  phone: "(555) 123-4567",
  email: "support@repairhub.com",
  hours: "Mon-Sat 9AM-6PM"
};

export function useContactInfo() {
  const [contactInfo, setContactInfo] = useState<ContactInfo>(DEFAULT_CONTACT_INFO);

  useEffect(() => {
    // Load contact information from localStorage
    const loadContactInfo = () => {
      if (typeof window !== 'undefined') {
        const storedContactInfo = localStorage.getItem('homepageContactInfo');
        if (storedContactInfo) {
          try {
            setContactInfo(JSON.parse(storedContactInfo));
          } catch (error) {
            console.error('Error parsing contact info:', error);
            setContactInfo(DEFAULT_CONTACT_INFO);
          }
        }
      }
    };

    loadContactInfo();

    // Listen for storage changes to update contact info across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'homepageContactInfo' && e.newValue) {
        try {
          setContactInfo(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Error parsing contact info from storage event:', error);
          setContactInfo(DEFAULT_CONTACT_INFO);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return contactInfo;
}