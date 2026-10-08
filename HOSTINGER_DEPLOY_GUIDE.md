# Hostinger Deployment Guide & "Entry File Not Found" Fix

এই গাইডে Hostinger-এ **"ERROR: Entry file not found"** সমস্যার সমাধান এবং সঠিক নিয়মে ডিপ্লয় করার ২টি পদ্ধতি আলোচনা করা হলো।

---

## কেন "ERROR: Entry file not found" এররটি আসে?

Hostinger-এ এই এররটি সাধারণত ২টি কারণে ঘটে:
1. **Node.js Web App ব্যবহার করলে:** Hostinger-এর Node.js সেটিংসে "Application startup file" (বা Entry file) হিসেবে `server.js` বা `app.js` চাওয়া হয়। কিন্তু আপনার প্রজেক্টে এই ফাইলটি না থাকলে বা `package.json`-এ `"main"` ও `"start"` না থাকলে Hostinger বিল্ড ফেইল করে।
2. **File Manager / Shared Hosting ব্যবহার করলে:** `public_html`-এর ভেতরে সরাসরি `index.html` না রেখে যদি পুরো প্রজেক্টের রুট ফাইল অথবা আলাদা কোনো সাবফোল্ডারে রাখা হয়, তখন ব্রাউজার এন্ট্রি ফাইল (`index.html`) খুঁজে পায় না।

---

## সমাধান: প্রজেক্টে যা যা যুক্ত ও ফিক্স করা হয়েছে

1. প্রজেক্টের রুটে **`server.js`**, **`index.js`**, এবং **`app.js`** তিনটি প্রধান এন্ট্রি ফাইল তৈরি করা হয়েছে।
2. `package.json`-এ `"main": "server.js"` এবং `"start": "node server.js"` যোগ করা হয়েছে।
3. `server.js`-এ বিল্ড করা `dist/index.html` সার্ভ করার জন্য Express কনফিগার করা হয়েছে।
4. `dist/` ফোল্ডারের জন্য `.htaccess` ফাইল তৈরি রয়েছে।

---

## পদ্ধতি ১: Hostinger Node.js Web App / Git ডিপ্লয়মেন্ট (যদি Node.js সেকশন ব্যবহার করেন)

Hostinger hPanel > **Websites** > **Node.js** বা **Git Deployment**-এ গেলে নিচের সেটিংস দিন:

- **Node.js version:** `18.x` বা `20.x`
- **Application root:** `/`
- **Application startup file (বা Entry file):** `server.js` (বা `index.js` বা `app.js`)
- **Build command:** `npm run build`
- **Run / Start command:** `npm start` (বা `node server.js`)

> এখন `server.js` উপস্থিত থাকায় Hostinger কোনো "Entry file not found" এরর দেবে না এবং সরাসরি অ্যাপ রান করবে!

---

## পদ্ধতি ২: Hostinger File Manager / Shared Hosting (সবচেয়ে সহজ ও জনপ্রিয় পদ্ধতি)

যদি আপনি Hostinger-এর সাধারণ Web Hosting / Shared Hosting ব্যবহার করেন, তবে Node.js-এর প্রয়োজন নেই:

1. আপনার কম্পিউটারের টার্মিনালে রান করুন:
   ```bash
   npm run build
   ```
2. এটি রান করলে প্রজেক্টের ভেতর **`dist`** নামের একটি ফোল্ডার তৈরি হবে।
3. **খুব গুরুত্বপূর্ণ:** `dist` ফোল্ডারের **ভেতরে ঢুকুন**। সেখানে দেখতে পাবেন:
   - `index.html` *(এটাই আপনার প্রধান এন্ট্রি ফাইল)*
   - `.htaccess` *(ক্যাশিং ও রিরাইট কনফিগারেশন)*
   - `assets/` *(CSS, JS ও বান্ডলড ছবি)*
   - `images/` *(প্রোডাক্ট ছবি)*
4. `dist` ফোল্ডারের ভেতরের এই সব ফাইলগুলোকে একসাথে সিলেক্ট করে জিপ (`dist.zip`) করুন।
5. Hostinger hPanel > **File Manager** > **`public_html`** ফোল্ডারে ঢুকুন।
6. `dist.zip` আপলোড করে `public_html`-এর ভেতরেই **Extract** করে দিন।
7. নিশ্চিত করুন `public_html/index.html` সরাসরি রয়েছে (কোনো সাবফোল্ডারের ভেতরে নয়)।

---

## বাড়তি সতর্কতা:
- `public_html`-এ যদি পূর্বে কোনো `default.php` ফাইল থেকে থাকে, সেটি ডিলিট করে দিন।
- Hostinger File Manager-এর গিয়ার সেটিংসে ক্লিক করে **Show Hidden Files** অন রাখুন, যাতে `.htaccess` দেখা যায়।
