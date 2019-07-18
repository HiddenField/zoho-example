# zoho-example

> An example of interacting with the Zoho subscriptions, invoices and payments API.

This example loops through from `START_PRICE` to `END_PRICE` incrementing it by 2 each time and doing the following:

* `PUT /subscriptions/{id}` Updating the subscription price.
* `GET /invoices?subscription_id={id}` Fetching the invoices for the update.
* `POST /payments` Marking the invoice as paid.

## Usage

We recommend using [Docker](https://docs.docker.com/install/) for simplicity:

```bash
docker-compose up --build
```
Otherwise, run locally with yarn:

```bash
yarn
yarn start
```

## Configuration

The following environment variables are available:

* `TOKEN` - The auth token (with `Zoho-authtoken` prefix).
* `ORG_ID` - The organization ID.
* `SUB_ID` - The ID of the subscription being updated.
* `START_PRICE` - The price to begin updating the subscription at.
* `END_PRICE` - The price to finish updating the subscription at.
* `DELAY` - The delay between each update in sections.

Set them by placing them in a `.env` file in the project root, for example:

```bash
TOKEN=28cfaaddcc11837a
ORG_ID=2233432
SUB_ID=133918191222
START_PRICE=0
END_PRICE=20
DELAY=5
```

