import config from '../config/siteConfig.js';
import { currencyService } from './currencyService.js';
export function whatsappUrl(message) { return `https://wa.me/${config.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`; }
export function carEnquiry(car) { return whatsappUrl(`Hello ${config.name}, I'm interested in the ${[car.year, car.make, car.model].filter(Boolean).join(' ')}.\nPrice: ${currencyService.format(car.price)}\nStock reference: ${car.id}\nPlease confirm availability and help me arrange an inspection.`); }
// No network submission in the demo. Replace these methods with API calls later.
export const enquiryService = { async submit(payload) { return {demo:true, payload, message:'Demo preview complete. Your details have not been sent.'}; } };
