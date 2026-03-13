export interface TechDetection {
  name: string;
  category: string;
  confidence: number;
  evidence: string;
}

interface TechSignature {
  name: string;
  category: string;
  patterns: (string | RegExp)[];
}

const TECH_SIGNATURES: TechSignature[] = [
  { name: "Google Analytics", category: "Analytics", patterns: ["google-analytics.com", "gtag(", "ga('create", "googletagmanager.com", "UA-", "G-"] },
  { name: "Google Tag Manager", category: "Analytics", patterns: ["googletagmanager.com/gtm.js", "GTM-"] },
  { name: "Facebook Pixel", category: "Advertising", patterns: ["connect.facebook.net", "fbq(", "facebook.com/tr"] },
  { name: "HubSpot", category: "CRM", patterns: ["js.hs-scripts.com", "hs-analytics.net", "hubspot.com", "hbspt.forms"] },
  { name: "Salesforce", category: "CRM", patterns: ["force.com", "salesforce.com", "pardot.com"] },
  { name: "Marketo", category: "Marketing Automation", patterns: ["marketo.com", "munchkin", "mktoForms"] },
  { name: "Intercom", category: "Customer Support", patterns: ["intercom.io", "widget.intercom.io", "Intercom("] },
  { name: "Drift", category: "Customer Support", patterns: ["drift.com", "js.driftt.com"] },
  { name: "Zendesk", category: "Customer Support", patterns: ["zendesk.com", "zdassets.com", "zopim.com"] },
  { name: "Freshdesk", category: "Customer Support", patterns: ["freshdesk.com", "freshchat.com"] },
  { name: "Stripe", category: "Payments", patterns: ["js.stripe.com", "stripe.com/v3", "Stripe("] },
  { name: "PayPal", category: "Payments", patterns: ["paypal.com/sdk", "paypalobjects.com"] },
  { name: "Square", category: "Payments", patterns: ["squareup.com", "square.site"] },
  { name: "Shopify", category: "E-commerce", patterns: ["cdn.shopify.com", "myshopify.com", "Shopify.theme"] },
  { name: "WooCommerce", category: "E-commerce", patterns: ["woocommerce", "wc-ajax", "wp-content/plugins/woocommerce"] },
  { name: "BigCommerce", category: "E-commerce", patterns: ["bigcommerce.com", "mybigcommerce.com"] },
  { name: "Magento", category: "E-commerce", patterns: ["magento", "mage/", "Magento_"] },
  { name: "WordPress", category: "CMS", patterns: ["wp-content", "wp-includes", "wp-json", "wordpress"] },
  { name: "Drupal", category: "CMS", patterns: ["drupal.js", "sites/default/files", "Drupal.settings"] },
  { name: "Squarespace", category: "CMS", patterns: ["squarespace.com", "sqsp.net", "static.squarespace.com"] },
  { name: "Wix", category: "CMS", patterns: ["wix.com", "parastorage.com", "wixstatic.com"] },
  { name: "Webflow", category: "CMS", patterns: ["webflow.com", "assets.website-files.com"] },
  { name: "React", category: "Frontend", patterns: ["react.production.min", "__NEXT_DATA__", "reactjs.org", "_react"] },
  { name: "Vue.js", category: "Frontend", patterns: ["vuejs.org", "vue.min.js", "__vue__", "Vue.component"] },
  { name: "Angular", category: "Frontend", patterns: ["angular.io", "ng-version", "angular.min.js"] },
  { name: "jQuery", category: "Frontend", patterns: ["jquery.min.js", "jquery.com", "jQuery("] },
  { name: "Bootstrap", category: "Frontend", patterns: ["bootstrap.min.css", "bootstrap.min.js", "getbootstrap.com"] },
  { name: "Tailwind CSS", category: "Frontend", patterns: ["tailwindcss", "tailwind.min.css"] },
  { name: "AWS CloudFront", category: "Hosting/CDN", patterns: ["cloudfront.net"] },
  { name: "Cloudflare", category: "Hosting/CDN", patterns: ["cdnjs.cloudflare.com", "cf-ray", "__cf_bm"] },
  { name: "Fastly", category: "Hosting/CDN", patterns: ["fastly.net", "fastly.com"] },
  { name: "Akamai", category: "Hosting/CDN", patterns: ["akamai.net", "akamaized.net", "akstat.io"] },
  { name: "Vercel", category: "Hosting/CDN", patterns: ["vercel.app", "vercel.com", "__vercel"] },
  { name: "Netlify", category: "Hosting/CDN", patterns: ["netlify.app", "netlify.com"] },
  { name: "Heroku", category: "Hosting/CDN", patterns: ["herokuapp.com", "heroku.com"] },
  { name: "Google Cloud", category: "Hosting/CDN", patterns: ["googleapis.com", "gstatic.com", "storage.googleapis.com"] },
  { name: "Amazon S3", category: "Hosting/CDN", patterns: [".s3.amazonaws.com", "s3.us-"] },
  { name: "Mailchimp", category: "Email Marketing", patterns: ["mailchimp.com", "list-manage.com", "mc.js"] },
  { name: "SendGrid", category: "Email Marketing", patterns: ["sendgrid.net", "sendgrid.com"] },
  { name: "Segment", category: "Analytics", patterns: ["segment.com", "segment.io", "analytics.js"] },
  { name: "Mixpanel", category: "Analytics", patterns: ["mixpanel.com", "mixpanel.init"] },
  { name: "Amplitude", category: "Analytics", patterns: ["amplitude.com", "cdn.amplitude.com"] },
  { name: "Hotjar", category: "Analytics", patterns: ["hotjar.com", "static.hotjar.com", "hj("] },
  { name: "FullStory", category: "Analytics", patterns: ["fullstory.com", "fs.js"] },
  { name: "Heap", category: "Analytics", patterns: ["heap-analytics", "heapanalytics.com"] },
  { name: "Sentry", category: "Monitoring", patterns: ["sentry.io", "browser.sentry-cdn.com"] },
  { name: "Datadog", category: "Monitoring", patterns: ["datadoghq.com", "datadog-rum"] },
  { name: "New Relic", category: "Monitoring", patterns: ["newrelic.com", "nr-data.net", "NREUM"] },
  { name: "Slack", category: "Communication", patterns: ["slack.com/widget", "slack-edge.com"] },
  { name: "Typeform", category: "Forms", patterns: ["typeform.com"] },
  { name: "Calendly", category: "Scheduling", patterns: ["calendly.com", "assets.calendly.com"] },
  { name: "Zoom", category: "Communication", patterns: ["zoom.us", "zoomcdn.com"] },
  { name: "Okta", category: "Identity", patterns: ["okta.com", "oktacdn.com"] },
  { name: "Auth0", category: "Identity", patterns: ["auth0.com", "cdn.auth0.com"] },
  { name: "Twilio", category: "Communication", patterns: ["twilio.com", "twiliocdn.com"] },
  { name: "Recaptcha", category: "Security", patterns: ["google.com/recaptcha", "gstatic.com/recaptcha"] },
];

export function scanTechnographics(html: string): TechDetection[] {
  const detections: TechDetection[] = [];
  const seen = new Set<string>();

  const lowerHtml = html.toLowerCase();

  for (const sig of TECH_SIGNATURES) {
    if (seen.has(sig.name)) continue;

    for (const pattern of sig.patterns) {
      const searchStr = typeof pattern === "string" ? pattern.toLowerCase() : "";

      if (typeof pattern === "string" && lowerHtml.includes(searchStr)) {
        seen.add(sig.name);
        detections.push({
          name: sig.name,
          category: sig.category,
          confidence: 85,
          evidence: `Found "${pattern}" in page source`,
        });
        break;
      } else if (pattern instanceof RegExp && pattern.test(html)) {
        seen.add(sig.name);
        detections.push({
          name: sig.name,
          category: sig.category,
          confidence: 80,
          evidence: `Matched pattern in page source`,
        });
        break;
      }
    }
  }

  return detections.sort((a, b) => b.confidence - a.confidence);
}

export function categorizeTechnographics(detections: TechDetection[]): Record<string, string[]> {
  const categories: Record<string, string[]> = {};
  for (const d of detections) {
    if (!categories[d.category]) categories[d.category] = [];
    categories[d.category].push(d.name);
  }
  return categories;
}
