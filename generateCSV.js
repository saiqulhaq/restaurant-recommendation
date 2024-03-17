const fs = require('fs');
const { faker } = require('@faker-js/faker');

const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvWriter = createCsvWriter({
  path: 'booking.csv',
  header: [
    { id: 'user_id', title: 'USER_ID' }, // Changed from USER_EMAIL to USER_ID
    { id: 'item_id', title: 'ITEM_ID' }, // Changed from RESTAURANT_ID to ITEM_ID
    { id: 'adult', title: 'ADULT' },
    { id: 'kids', title: 'KIDS' },
    { id: 'date', title: 'DATE' },
    { id: 'start_time', title: 'START_TIME' },
    { id: 'timestamp', title: 'TIMESTAMP' } // Added TIMESTAMP column
  ]
});

const generateRandomData = () => {
  const date = faker.date.past();
  return {
    user_id: faker.number.int({ min: 1, max: 100000 }), // Generate random user_id
    item_id: faker.number.int({ min: 1, max: 100 }), // Changed from restaurant_id to item_id
    adult: faker.number.int({ min: 1, max: 10 }),
    kids: faker.number.int({ min: 0, max: 3 }),
    date: date.toISOString().split('T')[0], // Extract the date part
    start_time: date.toISOString().split('T')[1].split('.')[0], // Extract the time part
    timestamp: date.getTime() // Generate UNIX timestamp
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

