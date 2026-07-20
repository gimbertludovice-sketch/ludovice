# LUDOVICE Platform — Deployment & Operations Manual
## Complete System Setup, Configuration, and Business Operations Guide

---

## PART I: DEPLOYMENT ARCHITECTURE

### Infrastructure Layer

**Production Hosting:**
- **Platform:** GitHub Pages / Netlify / Vercel (Zero-cost CDN deployment)
- **Domain:** ludovice.ph (or custom domain)
- **SSL/TLS:** Automatic (provided by host)
- **DNS:** CloudFlare (optional CDN for image caching)
- **Uptime SLA:** 99.9% (provided by hosting platform)

**File Structure for Deployment:**
```
ludovice-storefront/
├── index.html                    (Home page)
├── about.html                    (Company story)
├── products.html                 (Full menu - 600 items)
├── cart.html                     (Order review)
├── checkout.html                 (Payment & shipping)
├── login.html                    (Sign in)
├── register.html                 (Sign up)
├── contact.html                  (Support)
├── css/
│   ├── style.css                (Main stylesheet - 1200+ lines)
│   └── print.css                (Print optimization)
├── js/
│   ├── main.js                  (Cart, Auth, Orders, utilities)
│   ├── catalog.js               (Search, filter, sort, modal)
│   ├── home.js                  (Homepage logic)
│   ├── login.js                 (Login form)
│   ├── register.js              (Registration form)
│   ├── contact.js               (Contact form)
│   ├── checkout.js              (Payment processing)
│   ├── cart-page.js             (Cart rendering)
│   └── orders.js                (Order history)
├── data/
│   └── products.js              (600-item catalog)
├── img/
│   ├── logo.png                 (Brand logo)
│   ├── Gimbert.png.jpg          (Founder photo)
│   ├── Dianne.png.jpg           (Chef photo)
│   ├── Rhea.png.jpg             (Operations photo)
│   ├── Shane.png.jpg            (Guest services photo)
│   ├── bestpick.png.jpg         (Hero image)
│   ├── sisg plate.jpg           (Food imagery)
│   ├── lechon plate.png         (Food imagery)
│   ├── halo halo.jpg            (Dessert imagery)
│   └── adobo.jpg                (Signature dish)
├── .gitignore                    (Exclude node_modules, .env)
├── README.md                     (Project documentation)
├── package.json                  (Optional, for local dev)
└── 404.html                      (Custom 404 page)
```

### Deployment Steps

**1. GitHub Pages Setup (Recommended for MVP)**

```bash
# Create repository
git init ludovice-storefront
cd ludovice-storefront
git add .
git commit -m "Initial LUDOVICE storefront deployment"
git branch -M main
git remote add origin https://github.com/yourusername/ludovice-storefront.git
git push -u origin main

# Enable GitHub Pages
# Go to: Settings → Pages → Source: Deploy from a branch → main branch → root
# Your site will be live at: https://yourusername.github.io/ludovice-storefront
```

**2. Custom Domain Configuration**

```
Nameserver 1: ns-1234.awsdns-56.com
Nameserver 2: ns-5678.awsdns-78.net
Nameserver 3: ns-9999.awsdns-90.org
Nameserver 4: ns-1111.awsdns-22.co.uk

CNAME Record: www → yourusername.github.io
A Record: @ → 185.199.108.153 (GitHub Pages IP)
```

**3. SSL/HTTPS Enforcement**

```
GitHub Pages automatically issues SSL certificate via Let's Encrypt
Custom domain automatically redirects HTTP → HTTPS
```

---

## PART II: CONFIGURATION & ENVIRONMENT

### Environment Variables (for future backend integration)

Create `.env` file (excluded from version control):

```env
# API Configuration
VITE_API_URL=https://api.ludovice.ph
VITE_API_KEY=your_secret_key_here

# Payment Gateway
STRIPE_PUBLIC_KEY=pk_live_your_key
PAYMONGO_PUBLIC_KEY=your_key

# Email Service
SENDGRID_API_KEY=sg_live_your_key
ADMIN_EMAIL=gimbertludovice@ludovice.ph

# Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
HOTJAR_ID=your_id

# Environment
NODE_ENV=production
DEBUG=false
```

### Feature Flags (for A/B Testing)

Add to `main.js`:

```javascript
const FEATURES = {
  ENABLE_RECOMMENDATIONS: true,    // Show "You might also like"
  ENABLE_REVIEWS: false,            // Customer reviews (Phase 2)
  ENABLE_LOYALTY: false,            // Loyalty points (Phase 2)
  ENABLE_LIVE_CHAT: false,          // Live support (Phase 2)
  ENABLE_SUBSCRIPTION: false,       // Meal plans (Phase 3)
  MAINTENANCE_MODE: false           // Pause orders during maintenance
};
```

---

## PART III: DAILY OPERATIONS CHECKLIST

### Morning Startup (Before 10 AM)

- [ ] Check website uptime (https://ludovice.ph loads)
- [ ] Verify menu items displaying correctly (images loading)
- [ ] Test cart functionality (add item → checkout → confirmation)
- [ ] Monitor social media for customer inquiries
- [ ] Check email for overnight orders (design only, but simulate)
- [ ] Review Google Analytics for traffic patterns
- [ ] Confirm delivery partners are online (GrabFood, Foodpanda)

### Hourly Monitoring (Peak Hours: 11 AM – 2 PM)

Every hour during lunch rush:
- [ ] Page load time < 2.5 seconds (Lighthouse)
- [ ] No JavaScript errors in console
- [ ] Cart not accumulating duplicate items
- [ ] Checkout form accepting all input fields
- [ ] Images displaying (fallback to emoji if failing)
- [ ] Mobile layout responsive (test on real device)

### Weekly Tasks (Every Monday 6 AM)

**Content Updates:**
- [ ] Refresh homepage featured products (rotate `popular: true`)
- [ ] Add 2–3 seasonal special dishes to Chef's Specials
- [ ] Update team photos if needed
- [ ] Verify all external image URLs are HTTPS-accessible
- [ ] Check Wikimedia Commons/Unsplash links still valid

**Performance & Security:**
- [ ] Run Lighthouse audit (target: 90+ overall)
- [ ] Review error logs (check console errors)
- [ ] Validate SSL certificate expiration (should be auto-renewed)
- [ ] Test form validation (email, phone, password strength)
- [ ] Check localStorage quota usage

**Analytics Review:**
- [ ] Traffic sources (search, social, direct)
- [ ] Top 10 most-viewed products
- [ ] Search queries (identify zero-result searches)
- [ ] Device breakdown (mobile vs. desktop)
- [ ] Bounce rate on product page

### Monthly Tasks (1st of each month)

**Business Review:**
- [ ] Update analytics dashboard
- [ ] Compare conversion rate to target (e.g., 3%)
- [ ] Analyze cart abandonment
- [ ] Review customer feedback from contact form
- [ ] Plan next month's special menu items

**Technical Maintenance:**
- [ ] Update JavaScript libraries (if using npm)
- [ ] Audit third-party dependencies for vulnerabilities
- [ ] Review CDN caching headers
- [ ] Compress images if file sizes grown
- [ ] Archive logs older than 90 days

**Operational Planning:**
- [ ] Inventory forecasting (which dishes most popular)
- [ ] Staffing adjustments based on orders
- [ ] Marketing campaign planning
- [ ] Budget review (hosting, domain, email)

---

## PART IV: MONITORING & ALERTS

### Key Performance Indicators (KPIs) to Track

**User Engagement:**
```
Daily Active Users (DAU):
  Target: 500–1000 users
  Alert Threshold: < 250 (significant drop)

Page Views:
  Target: 5,000–10,000 daily
  Alert Threshold: < 2,000

Conversion Rate:
  Target: 2–5% (browse → order)
  Alert Threshold: < 1%

Average Order Value (AOV):
  Target: ₱2,500–3,500
  Alert Threshold: < ₱2,000
```

**Operational Metrics:**
```
Cart Abandonment Rate:
  Target: < 60%
  Alert Threshold: > 75%

Page Load Time (LCP):
  Target: < 2.5 seconds
  Alert Threshold: > 4 seconds

Error Rate:
  Target: < 0.1%
  Alert Threshold: > 1%

Uptime:
  Target: 99.9%
  Alert Threshold: < 99.5%
```

### Monitoring Tools Setup

**Uptime Monitoring (UptimeRobot - Free Tier)**
```
Check URL: https://ludovice.ph
Interval: Every 5 minutes
Alert: Email if down for > 5 minutes
Check type: HTTP(S)
```

**Performance Monitoring (Lighthouse CI - Free)**
```
Metrics to watch:
  - Largest Contentful Paint (LCP): < 2.5s
  - Cumulative Layout Shift (CLS): < 0.1
  - First Input Delay (FID): < 100ms

Weekly check via CI/CD pipeline
```

**Analytics Dashboard (Google Analytics 4)**
```
Dashboard shows:
  - Real-time active users
  - Top pages
  - Traffic sources
  - Device breakdown
  - Conversion funnel
```

---

## PART V: CUSTOMER SUPPORT PLAYBOOK

### Support Ticket Categories & Responses

**Category: Order Issues**

*Issue: "My cart total keeps changing"*
- Root Cause: Shipping fee recalculating
- Response: "Shipping cost updates when you select your delivery method. Standard costs ₱79, Express ₱149, Pickup is free."
- Action: None needed (working as designed)

*Issue: "Can't complete checkout"*
- Root Cause: Form validation failing (usually email/phone format)
- Response: "Please ensure email format is valid (name@domain.com) and phone is 10-11 digits."
- Action: Update form error messages to be more specific

*Issue: "Payment declined"*
- Root Cause: Design-only (no real payment processing)
- Response: "This is a demo site. Real payment processing coming soon. Orders are simulated."
- Action: Update disclaimer on checkout page

**Category: Menu/Product Questions**

*Issue: "Is the Sisig available today?"*
- Response: "All 600 menu items are available for order 24/7 on our site. You can add to cart anytime."
- Action: Consider adding stock status in Phase 2

*Issue: "Can I customize the Kare-Kare?"*
- Response: "Customization options coming soon in Phase 2. For now, please note special requests in the contact form."
- Action: Add notes field to checkout

**Category: Account/Login Issues**

*Issue: "I forgot my password"*
- Response: "Password reset emails not yet implemented (design phase). For now, clear your browser cache to log out, then create a new account."
- Action: Add password reset functionality in Phase 2

*Issue: "Can't create account"*
- Likely Cause: localStorage full, browser private mode, or validation failing
- Response: "Try using a different browser or device. Clear browser data and try again. Email us if problem persists."
- Action: Improve error messages for registration

**Category: Technical/Website**

*Issue: "Images not loading"*
- Root Cause: CDN timeout or CORS issue
- Response: "We're aware of image loading issues. Please refresh the page. If problem continues, please report."
- Action: Add image retry logic; monitor CDN uptime

*Issue: "Site slow on mobile"*
- Root Cause: Large images, unoptimized JavaScript
- Response: "Mobile experience improves with faster connection. Try over WiFi or cellular 4G/5G."
- Action: Implement image lazy-loading; profile performance

### Support Response Time SLAs

| Priority | Issue Type | Response Time | Resolution Time |
|----------|-----------|---|---|
| Critical | Site down / no orders possible | < 15 min | < 1 hour |
| High | Can't checkout / major bug | < 1 hour | < 4 hours |
| Medium | Account issue / product question | < 4 hours | < 1 business day |
| Low | Feedback / enhancement request | < 1 business day | < 1 week |

---

## PART VI: CONTENT MANAGEMENT

### Menu Updates Process

**Weekly Rotation Schedule:**

**Monday Morning:**
- Add 2 new Chef's Specials (change `popular: true`)
- Feature a trending dish from last week
- Update seasonal produce-based items

**Example JavaScript Update:**
```javascript
// In products.js, find Chef's Specials (id 500–650)
{
  "id": 516,
  "name": "Seasonal White Truffle Pasta",  // NEW
  "category": "specials",
  "price": 1200,
  "desc": "Fresh egg pasta with white truffle and parmigiano-reggiano",
  "img": "https://...",
  "rating": 4.9,
  "reviews": 0,
  "popular": true,  // ← Featured for this week
  "categoryLabel": "Chef's Specials"
}
```

**Quarterly Updates:**
- Add 20 new main course items
- Retire slow-moving dishes
- Adjust prices based on ingredient costs
- Add seasonal variations

### Promotional Campaign Calendar

**Monthly:**
- **Week 1:** "New Arrivals" (highlight 5 new dishes)
- **Week 2:** "Customer Favorites" (top 5 by orders)
- **Week 3:** "Chef's Pick" (owner's recommendation)
- **Week 4:** "Flash Sale" (20% off select items)

**Seasonal:**
- **January:** "New Year, New Menu" (6 new dishes)
- **April:** "Summer Specials" (light, refreshing dishes)
- **July:** "Mid-Year Celebration" (anniversary discount)
- **December:** "Holiday Feast" (premium packages)

---

## PART VII: RISK MANAGEMENT & INCIDENT RESPONSE

### Disaster Recovery Plan

**Scenario 1: Website Goes Down**

Detection:
- UptimeRobot alert (email)
- No HTTP 200 response for 5+ minutes

Immediate Actions (< 15 min):
1. Check GitHub Pages status page
2. Verify DNS is pointing to correct IP
3. Clear CloudFlare cache if enabled
4. Re-deploy from GitHub main branch
5. Notify team via Slack/email

Recovery SLA: < 1 hour

---

**Scenario 2: Data Corruption (localStorage)**

Detection:
- Users report carts emptying randomly
- Console shows JSON parse errors

Investigation (< 30 min):
1. Check browser console for errors
2. Reproduce issue on device
3. Identify which JSON is corrupting
4. Roll back data in localStorage

Prevention:
- Add validation to Cart.save()
- Implement data versioning
- Alert if data > 5MB (quota issue)

---

**Scenario 3: Image CDN Failure**

Detection:
- 404 errors for Unsplash URLs
- Blank images on product page

Immediate Actions:
1. Verify CDN still HTTPS-accessible
2. Check if URLs have expired query params
3. Activate emoji fallback CSS

Recovery:
- Switch to backup image source (Wikimedia, Pexels)
- Re-generate URLs with new domain

SLA: < 4 hours

---

**Scenario 4: Security Breach / XSS Attack**

Detection:
- Unexpected JavaScript in localStorage
- Console warnings about CSP violations
- Malicious links in cart items

Immediate Actions:
1. Clear browser localStorage
2. Revoke any API keys (if integrated)
3. Review GitHub commit history
4. Revert to last known good commit
5. Implement stricter CSP headers

Prevention:
- Use textContent, not innerHTML
- Validate all external URLs
- Implement Content Security Policy
- Monitor for suspicious patterns

---

## PART VIII: COST BREAKDOWN & BUDGET

### Fixed Costs (Monthly)

| Item | Provider | Cost (₱) |
|------|----------|----------|
| Domain (.ph) | Namecheap | 350 |
| Email (5 accounts) | Gmail Business | 600 |
| CDN (Optional) | CloudFlare | Free–2,500 |
| Monitoring | UptimeRobot + Lighthouse | Free |
| Analytics | Google Analytics | Free |
| **TOTAL MONTHLY** | | **950–3,450** |

### Variable Costs (Per Order)

| Item | Cost | Notes |
|------|------|-------|
| Payment processing | 2.2% + ₱15/transaction | Stripe/PayMongo |
| Email notification | ₱2.50 per order | SendGrid |
| Delivery logistics | ₱50–150 per order | GrabFood/Foodpanda commission |
| **Total per order** | **54–167.50** | At ₱2,500 AOV |

### Revenue Model (Scenario)

```
Target: 50 orders/day
Average Order Value: ₱2,500
Daily Revenue: ₱125,000

Less:
- Payment processing (2.2% + ₱15): ₱70 per order = ₱3,500/day
- Delivery commission (15%): ₱18,750/day
- Fixed costs (₱3,450/30): ₱115/day

Daily Profit: ₱102,635
Monthly Profit: ₱3,079,050

Payback Period (development ₱730,000): ~8 days
```

---

## PART IX: TEAM ROLES & RESPONSIBILITIES

### Founder & Head Chef (Gimbert Ludovice)
- Menu development and dish creation
- Quality control on all orders
- Brand strategy and storytelling
- Weekly special selection
- Strategic partnerships

**Time Commitment:** 4–6 hours daily

### Operations Manager (Rhea Lei Talavero)
- Website updates and content management
- Inventory tracking
- Order fulfillment coordination
- Customer support
- Analytics review

**Time Commitment:** 3–4 hours daily

### Guest Experience Lead (Shane De Manzana)
- Customer inquiries via contact form
- Email responses
- Feedback management
- Social media engagement
- Review management

**Time Commitment:** 2–3 hours daily

### Developer (Contract/Freelance)
- Website maintenance and fixes
- Performance optimization
- Backend integration (Phase 2)
- Security updates
- New feature development

**Time Commitment:** 8–12 hours weekly

---

## PART X: FUTURE ROADMAP & SCALING

### Phase 2 (Months 6–12)

**Backend Integration:**
- Node.js + Express API
- PostgreSQL database
- Real payment processing (Stripe/PayMongo)
- Email notifications (SendGrid)
- Admin dashboard

**User Features:**
- Real authentication (OAuth2)
- Order history saved to cloud
- Loyalty points program
- Push notifications
- Live chat support

**Operational:**
- Multi-branch support
- Real inventory management
- Delivery zone mapping
- Dynamic pricing per branch
- Staff management portal

**Cost Estimate:** ₱500,000–1,000,000

---

### Phase 3 (Year 2)

**Platform Expansion:**
- Mobile app (iOS + Android)
- PWA (Progressive Web App)
- WhatsApp ordering bot
- Subscription meal plans
- Catering/bulk orders

**Analytics:**
- Customer behavior tracking
- Predictive demand forecasting
- Recommendation engine
- A/B testing framework
- BI dashboard

**Growth:**
- 3 additional branches (Makati, QC, Cebu)
- 1,500+ menu items
- 5,000+ daily active users
- Franchise model exploration

**Cost Estimate:** ₱2,000,000–3,000,000

---

## APPENDIX: TROUBLESHOOTING REFERENCE

### Common Issues & Fixes

**Q: Images not loading on product page**
A: 
1. Check internet connection
2. Refresh browser (Ctrl+F5 hard refresh)
3. Check browser console for CORS errors
4. If Unsplash CDN down, emoji fallback will show
5. Contact support if persists

**Q: Cart not saving between sessions**
A:
1. Check if localStorage is enabled (not in private mode)
2. Check if storage quota exceeded (browser settings)
3. Clear browser cache and cookies
4. Try different browser
5. Contact support with error message

**Q: Checkout form won't submit**
A:
1. Verify all required fields filled (red asterisks)
2. Check email format is valid
3. Check phone number is 10-11 digits
4. Verify passwords match (if registering)
5. Disable password manager (may interfere)
6. Try incognito/private mode

**Q: Site very slow on mobile**
A:
1. Switch to 4G/5G or WiFi
2. Close other browser tabs
3. Disable extensions (ad blockers may slow)
4. Restart browser
5. Clear browser cache
6. Try different device

**Q: Can't create account - "Username already taken"**
A:
1. Choose different username (must be unique)
2. Clear browser cache (may be caching old data)
3. Try in incognito/private mode
4. Contact support if legitimate issue

---

**Document Version:** 1.0 (Production Release)
**Last Updated:** July 2026
**Next Review:** January 2027
**Contact:** gimbertludovice@ludovice.ph
