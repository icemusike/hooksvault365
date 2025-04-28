#!/usr/bin/env node

/**
 * This script downloads hooks data from a Google Sheet (exported as CSV)
 * and converts it to JSON format for use in the HookVault365 application.
 * 
 * Usage: node scripts/update.js SHEET_ID
 * 
 * The Google Sheet should have the following columns:
 * id, text, niche, tone, length
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { parse } = require('csv-parse/sync');

// Check if sheet ID is provided
const sheetId = process.argv[2];
if (!sheetId) {
  console.error('Error: Google Sheet ID is required.');
  console.log('Usage: node scripts/update.js SHEET_ID');
  process.exit(1);
}

// Construct the CSV export URL
const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

// Path to save the hooks.json file
const targetPath = path.join(__dirname, '..', 'public', 'hooks.json');

console.log(`📥 Downloading hooks from Google Sheet (ID: ${sheetId})...`);

// Download the CSV file
https.get(csvUrl, (response) => {
  if (response.statusCode !== 200) {
    console.error(`Error: Failed to download CSV file. Status code: ${response.statusCode}`);
    process.exit(1);
  }

  let data = '';
  response.on('data', (chunk) => {
    data += chunk;
  });

  response.on('end', () => {
    try {
      // Parse CSV data
      const records = parse(data, {
        columns: true,
        skip_empty_lines: true
      });

      // Transform data to the required format
      const hooks = records.map((record, index) => {
        return {
          id: parseInt(record.id) || index + 1,
          text: record.text || '',
          niche: record.niche?.toLowerCase() || 'other',
          tone: record.tone?.toLowerCase() || 'neutral',
          length: record.length?.toLowerCase() || 'medium'
        };
      });

      // Write the JSON file
      fs.writeFileSync(targetPath, JSON.stringify(hooks, null, 2));
      console.log(`✓ Successfully updated hooks.json with ${hooks.length} hooks.`);
    } catch (error) {
      console.error('Error processing CSV data:', error.message);
      process.exit(1);
    }
  });
}).on('error', (error) => {
  console.error('Error downloading the CSV file:', error.message);
  process.exit(1);
}); 