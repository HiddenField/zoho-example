import * as https from 'https';
import dotenv from 'dotenv'

dotenv.config();

const {
  DELAY,
  END_PRICE,
  ORG_ID,
  START_PRICE,
  SUB_ID,
  TOKEN,
} = process.env;

function nap(s) {
  return new Promise(resolve => setTimeout(resolve, s * 1000));
}

function request(method, path, body) {
  return new Promise((resolve, reject) => { 
    const req = https.request({
      hostname: 'subscriptions.zoho.com',
      port: 443,
      method,
      path,
      headers: {
        'content-type': 'application/json',
        'x-com-zoho-subscriptions-organizationid': ORG_ID,
        authorization: `Zoho-authtoken ${TOKEN}`,
      },
    }, (res) => {
      console.log(`PATH: ${path}`);
      console.log(`STATUS: ${res.statusCode}`);

      let body = '';

      res.on('data', (d) => {
        body += d;
      });

      res.on('close', () => {
        console.log(`BODY: ${body}`);
        resolve(JSON.parse(body))
      });
    });

    req.on('error', e => reject(e));

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

function updateSubscription(subscriptionId, price) {
  return request('PUT', `/api/v1/subscriptions/${subscriptionId}`, {
    plan: {
      plan_code: 'testpaidplan',
      billing_cycles: 0,
      price,
    },
    end_of_term: false,
  });
}

function recordPayment(customerId, invoiceId, amount) {
  return request('POST', '/api/v1/payments', {
    customer_id: customerId,
    payment_mode: 'creditcard',
    amount,
    invoices: [{
      invoice_id: invoiceId,
      amount_applied: amount,
    }],
  });
}

async function getLatestInvoices(subscriptionId) {
  const { invoices } = await request('GET', `/api/v1/invoices?subscription_id=${subscriptionId}`);
  return invoices
    .filter(invoice => ['sent', 'partially_paid'].includes(invoice.status))
    .sort((a, b) => new Date(a.created_time).getTime() < new Date(b.created_time).getTime());
}

async function main() {
  const startPrice = parseInt(START_PRICE, 10);
  const endPrice = parseInt(END_PRICE, 10);
  const delay = parseInt(DELAY, 10);

  for (let i = startPrice + 2; i <= endPrice; i += 2) {
    const { subscription } = await updateSubscription(SUB_ID, `${i}`);
    const [ invoice ] = await getLatestInvoices(SUB_ID);
    await recordPayment(subscription.customer.customer_id, invoice.invoice_id, `${invoice.balance}`);
    await nap(delay);
  }
}

main()
  .then(() => {})
  .catch(e => console.error(e));
