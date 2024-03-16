const fs = require('fs');
const { faker } = require('@faker-js/faker');

const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvWriter = createCsvWriter({
  path: 'booking.csv',
  header: [
    { id: 'user_email', title: 'USER_EMAIL' },
    { id: 'restaurant_id', title: 'RESTAURANT_ID' },
    { id: 'adult', title: 'ADULT' },
    { id: 'kids', title: 'KIDS' },
    { id: 'total_price', title: 'TOTAL_PRICE' },
    { id: 'created_at', title: 'CREATED_AT' }
  ]
});

const generateRandomData = () => {
  return {
    user_email: faker.internet.email(),
    restaurant_id: faker.datatype.number({ min: 1, max: 100 }),
    adult: faker.datatype.number({ min: 1, max: 10 }),
    kids: faker.datatype.number({ min: 0, max: 3 }),
    total_price: faker.commerce.price(100, 5000, 0),
    created_at: faker.date.past().toISOString()
  };
};

const records = [];
for (let i = 0; i < 1000000; i++) {
  records.push(generateRandomData());
}

csvWriter.writeRecords(records)       // returns a promise
    .then(() => {
        console.log('...Done');
    });

