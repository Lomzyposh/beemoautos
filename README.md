# Beemo Autos

React + Vite + Tailwind CSS v4. No backend or online payments.

## Run

`npm install`, then `npm run dev`. Production: `npm run build`.

## Rebrand

Edit `src/config/siteConfig.js` for business name, full name, logo, colours, contacts, address, hero photo and social links. Edit `src/data/cars.json` for inventory. Place photos in `public/images`. Layout stays fixed. Replace **all sample contact details** before pitching; the email is blank until a confirmed business address is supplied. The site uses `/beemo_logo.jpg` as its logo.

## Backend integration

UI calls `inventoryService.list()` / `.get()`. Replace their implementations with API calls. Forms call `enquiryService.submit()`; currently previews only, without storing or sending data. Sell-car photos preview locally; future upload implementation should send validated files to your backend and Cloudinary. Do not put a Cloudinary secret in frontend code.

## Currency

Prices are NGN only. Default dropdown exposes NGN only so the demo never claims stale rates. Add supported currencies and a public endpoint to config when ready. `currencyService` expects `{base:"NGN",rates:{NGN:1,USD:...,GBP:...,EUR:...}}`, caches rates for six hours in memory and falls back to NGN on failure. For providers needing secret keys, later proxy through your backend. Converted prices are indicative; WhatsApp enquiries always use the base NGN price.

## Images and demo data

Inventory contains six Mercedes-Benz vehicles, with their 39 supplied photos copied into `public/images/inventory`. The CLA 35 AMG is a 2021 model with price on request; the other five listings use the supplied NGN prices. Colours are editable black/white placeholders. All listings use the Used condition. Seating is omitted from the inventory and vehicle details. Missing prices display as Price on request. See `ASSET_SOURCES.md` for the remaining reference imagery. No mileage, fuel type or transmission fields are included.

## Deploy elsewhere

Deploy `dist` to any static host. Enable SPA fallback to `/index.html` for direct route visits. `public/_redirects` supplies a common static-host fallback; Vercel can use the included `vercel.json`.
